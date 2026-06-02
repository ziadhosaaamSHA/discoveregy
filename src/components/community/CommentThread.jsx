import React, { useState } from "react";
import { Heart, Reply, Edit3, Trash2 } from "lucide-react";
import { CommentComposer } from "./CommentComposer";
import { PostImageGrid } from "./PostImageGrid";
import { useAuth } from "../../context/AuthContext";

function CommentItem({
  postId,
  comment,
  onReply,
  onUpdate,
  onDelete,
  onLike,
  onUnlike,
  depth = 0,
}) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const isAuthor = user && (String(user.id) === String(comment.authorId) || user.type === "admin");

  const handleLikeClick = () => {
    if (comment.isLikedByMe) {
      onUnlike(comment);
    } else {
      onLike(comment);
    }
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? "pl-6 sm:pl-10 border-l border-gray-100" : ""}`}>
      <div className="flex items-start gap-3">
        {comment.authorImage ? (
          <img
            src={comment.authorImage}
            alt={comment.authorName}
            className="w-9 h-9 rounded-full object-cover bg-secondary/10"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h5 className="text-xs font-bold text-[#154d7d]">{comment.authorName}</h5>
              <p className="text-[10px] text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
                {comment.isEdited ? " · Edited" : ""}
              </p>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Edit comment"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 outline-none text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdate(comment.id, { content: draft });
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 bg-[#d4800b] hover:brightness-105 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed mt-0.5">
                {comment.content}
              </p>
              <PostImageGrid images={comment.images} />
            </>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                comment.isLikedByMe
                  ? "text-[#d4800b]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Heart size={14} className={comment.isLikedByMe ? "fill-[#d4800b]" : ""} />
              <span>{comment.likesCount}</span>
            </button>
            
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          </div>

          {isReplying && (
            <div className="mt-2 pl-2">
              <CommentComposer
                label="Write a reply..."
                submitLabel="Reply"
                onSubmit={(content, images) => {
                  onReply(postId, comment.id, content, images);
                  setIsReplying(false);
                }}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 pt-3 mt-3 border-t border-gray-50">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  postId={postId}
                  comment={reply}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onLike={onLike}
                  onUnlike={onUnlike}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({
  postId,
  comments,
  onReply,
  onUpdate,
  onDelete,
  onLike,
  onUnlike,
}) {
  if (!comments || comments.length === 0) {
    return <p className="text-xs text-gray-400">No comments yet. Be the first to comment!</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <div key={comment.id} className="space-y-4">
          <CommentItem
            postId={postId}
            comment={comment}
            onReply={onReply}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onLike={onLike}
            onUnlike={onUnlike}
          />
          {index < comments.length - 1 && <hr className="border-gray-100" />}
        </div>
      ))}
    </div>
  );
}
