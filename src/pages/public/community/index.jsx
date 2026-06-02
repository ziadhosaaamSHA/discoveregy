import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import { communityApi } from "../../../services/api/community.api";
import { PostCard } from "../../../components/community/PostCard";
import { PostForm } from "../../../components/community/PostForm";

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await communityApi.getFeed({ page: 1, size: 50 });
      setPosts(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load community stories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const ensureAuth = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleCreatePost = async (input) => {
    if (!ensureAuth()) return;
    try {
      setIsSubmitting(true);
      await communityApi.createPost(input);
      await loadFeed(); // Reload feed to show new post
    } catch (err) {
      alert(err?.message || "Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (id, dto) => {
    if (!ensureAuth()) return;
    try {
      await communityApi.updatePost(id, dto);
      setPosts((current) =>
        current.map((p) =>
          p.id === id ? { ...p, title: dto.title, content: dto.content, isEdited: true } : p
        )
      );
    } catch (err) {
      alert(err?.message || "Failed to update post.");
    }
  };

  const handleDeletePost = async (post) => {
    if (!ensureAuth()) return;
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await communityApi.deletePost(post.id);
      setPosts((current) => current.filter((p) => p.id !== post.id));
    } catch (err) {
      alert(err?.message || "Failed to delete post.");
    }
  };

  const handleLikePost = async (post) => {
    if (!ensureAuth()) return;
    const wasLiked = post.isLikedByMe;
    
    // Optimistic UI update
    setPosts((current) =>
      current.map((p) =>
        p.id === post.id
          ? {
              ...p,
              isLikedByMe: !wasLiked,
              likesCount: p.likesCount + (wasLiked ? -1 : 1),
            }
          : p
      )
    );

    try {
      if (wasLiked) {
        await communityApi.unlikePost(post.id);
      } else {
        await communityApi.likePost(post.id);
      }
    } catch (err) {
      // Revert on error
      setPosts((current) =>
        current.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLikedByMe: wasLiked,
                likesCount: p.likesCount + (wasLiked ? 1 : -1),
              }
            : p
        )
      );
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F2E0CA] pt-28 pb-10 px-5 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Feed Column */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4800b]">
                Community
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-[#154d7d] mt-1">
                Stories from travelers across Egypt
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-xl">
                Share experiences, discover hidden places, and keep the journey moving with people exploring the same map.
              </p>
            </div>

            {user ? (
              <PostForm isSubmitting={isSubmitting} onSubmit={handleCreatePost} />
            ) : (
              <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-600">
                  Want to share your story?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[#d4800b] font-bold hover:underline"
                  >
                    Log in
                  </button>{" "}
                  to publish a post.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse bg-white rounded-2xl h-56 border border-gray-100"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
                No community posts yet. Start the first conversation.
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLikePost}
                    onUnlike={handleLikePost}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sticky Sidebar Column */}
          <div className="md:col-span-1">
            <div className="md:sticky md:top-28 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#cf9b2f]/15 text-[#cf9b2f] flex items-center justify-center">
                <Compass size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#154d7d]">Community module</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Feed, posts, images, likes, comments, and replies are bound only to routes confirmed in CommunityController.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
