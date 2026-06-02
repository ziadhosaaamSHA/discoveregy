import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { communityApi } from "../../../services/api/community.api";
import { PostCard } from "../../../components/community/PostCard";
import { CommentComposer } from "../../../components/community/CommentComposer";
import { CommentThread } from "../../../components/community/CommentThread";

export default function PostDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const postId = Number(params.postId);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [postError, setPostError] = useState(null);
  const [commentsError, setCommentsError] = useState(null);
  const [isComposerSubmitting, setIsComposerSubmitting] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      setIsPostLoading(true);
      setPostError(null);
      const data = await communityApi.getPost(postId);
      setPost(data);
    } catch (err) {
      setPostError(err?.message || "Failed to load post.");
    } finally {
      setIsPostLoading(false);
    }
  }, [postId]);

  const loadComments = useCallback(async () => {
    try {
      setIsCommentsLoading(true);
      setCommentsError(null);
      const data = await communityApi.getComments(postId);
      setComments(data || []);
    } catch (err) {
      setCommentsError(err?.message || "Failed to load comments.");
    } finally {
      setIsCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (Number.isFinite(postId)) {
      loadPost();
      loadComments();
    }
  }, [postId, loadPost, loadComments]);

  const ensureAuth = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleUpdatePost = async (id, dto) => {
    if (!ensureAuth()) return;
    try {
      await communityApi.updatePost(id, dto);
      setPost((current) =>
        current ? { ...current, title: dto.title, content: dto.content, isEdited: true } : null
      );
    } catch (err) {
      alert(err?.message || "Failed to update post.");
    }
  };

  const handleDeletePost = async () => {
    if (!ensureAuth()) return;
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await communityApi.deletePost(postId);
      navigate("/community");
    } catch (err) {
      alert(err?.message || "Failed to delete post.");
    }
  };

  const handleLikePost = async () => {
    if (!ensureAuth()) return;
    if (!post) return;
    const wasLiked = post.isLikedByMe;

    // Optimistic UI update
    setPost((current) =>
      current
        ? {
            ...current,
            isLikedByMe: !wasLiked,
            likesCount: current.likesCount + (wasLiked ? -1 : 1),
          }
        : null
    );

    try {
      if (wasLiked) {
        await communityApi.unlikePost(postId);
      } else {
        await communityApi.likePost(postId);
      }
    } catch (err) {
      // Revert on error
      setPost((current) =>
        current
          ? {
              ...current,
              isLikedByMe: wasLiked,
              likesCount: current.likesCount + (wasLiked ? 1 : -1),
            }
          : null
      );
    }
  };

  const handleCreateComment = async (content, images) => {
    if (!ensureAuth()) return;
    try {
      setIsComposerSubmitting(true);
      await communityApi.createComment({ postId, content, images });
      await loadComments();
      // Increase comments count locally on post
      setPost((current) =>
        current ? { ...current, commentsCount: current.commentsCount + 1 } : null
      );
    } catch (err) {
      alert(err?.message || "Failed to post comment.");
    } finally {
      setIsComposerSubmitting(false);
    }
  };

  const handleCreateReply = async (postId, parentCommentId, content, images) => {
    if (!ensureAuth()) return;
    try {
      await communityApi.createComment({ postId, parentCommentId, content, images });
      await loadComments();
      // Increase comments count locally on post
      setPost((current) =>
        current ? { ...current, commentsCount: current.commentsCount + 1 } : null
      );
    } catch (err) {
      alert(err?.message || "Failed to post reply.");
    }
  };

  const handleUpdateComment = async (id, dto) => {
    if (!ensureAuth()) return;
    try {
      await communityApi.updateComment(id, dto);
      await loadComments();
    } catch (err) {
      alert(err?.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (id) => {
    if (!ensureAuth()) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await communityApi.deleteComment(id);
      await loadComments();
      // Decrease comments count locally on post
      setPost((current) =>
        current ? { ...current, commentsCount: Math.max(0, current.commentsCount - 1) } : null
      );
    } catch (err) {
      alert(err?.message || "Failed to delete comment.");
    }
  };

  const toggleLikeState = (list, commentId, isLiked, countDiff) => {
    return list.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          isLikedByMe: isLiked,
          likesCount: c.likesCount + countDiff,
        };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: toggleLikeState(c.replies, commentId, isLiked, countDiff),
        };
      }
      return c;
    });
  };

  const handleLikeComment = async (comment) => {
    if (!ensureAuth()) return;
    const wasLiked = comment.isLikedByMe;
    const diff = wasLiked ? -1 : 1;

    setComments((current) => toggleLikeState(current, comment.id, !wasLiked, diff));

    try {
      if (wasLiked) {
        await communityApi.unlikeComment(comment.id);
      } else {
        await communityApi.likeComment(comment.id);
      }
    } catch (err) {
      setComments((current) => toggleLikeState(current, comment.id, wasLiked, -diff));
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F2E0CA] pt-28 pb-10 px-5 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-[800px] mx-auto space-y-6">
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-secondary border border-gray-100 rounded-xl font-semibold text-sm shadow-sm transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to community</span>
        </Link>

        {isPostLoading && (
          <div className="animate-pulse bg-white rounded-2xl h-80 border border-gray-100" />
        )}
        
        {postError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {postError}
          </div>
        )}

        {post && (
          <>
            <PostCard
              post={post}
              isDetail
              onLike={handleLikePost}
              onUnlike={handleLikePost}
              onDelete={handleDeletePost}
              onUpdate={handleUpdatePost}
            />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#154d7d]">Comments</h3>
                <p className="text-xs text-gray-500">
                  Continue the conversation with the people following this trip.
                </p>
              </div>

              {user ? (
                <CommentComposer
                  isSubmitting={isComposerSubmitting}
                  onSubmit={handleCreateComment}
                />
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[#d4800b] font-bold hover:underline"
                    >
                      Log in
                    </button>{" "}
                    to leave a comment.
                  </p>
                </div>
              )}

              {commentsError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {commentsError}
                </div>
              )}

              {isCommentsLoading ? (
                <div className="animate-pulse bg-gray-50 rounded-xl h-28" />
              ) : (
                <CommentThread
                  postId={postId}
                  comments={comments}
                  onReply={handleCreateReply}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  onLike={handleLikeComment}
                  onUnlike={handleLikeComment}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
