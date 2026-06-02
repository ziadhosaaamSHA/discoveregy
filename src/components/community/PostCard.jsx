import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, Edit3, Trash2, Heart, MessageSquare, Eye } from "lucide-react";
import { PostForm } from "./PostForm";
import { PostImageGrid } from "./PostImageGrid";
import { useAuth } from "../../context/AuthContext";

export function PostCard({ post, onLike, onUnlike, onDelete, onUpdate, isDetail }) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef(null);

  const isAuthor = user && (String(user.id) === String(post.authorId) || user.type === "admin");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  if (isEditing) {
    return (
      <PostForm
        post={post}
        submitLabel="Save post"
        onCancel={() => setIsEditing(false)}
        onSubmit={(input) => {
          onUpdate(post.id, input);
          setIsEditing(false);
        }}
      />
    );
  }

  const handleLikeClick = () => {
    if (post.isLikedByMe) {
      onUnlike(post);
    } else {
      onLike(post);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {post.authorImage ? (
            <img
              src={post.authorImage}
              alt={post.authorName}
              className="w-11 h-11 rounded-full object-cover bg-secondary/10"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-[#154d7d]">{post.authorName}</h4>
            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
              {post.isEdited ? " · Edited" : ""}
            </p>
          </div>
        </div>

        {isAuthor && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Post actions"
            >
              <MoreHorizontal size={20} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 size={16} className="text-gray-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(post);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2">
        {post.title && (
          <h3 className="text-lg font-bold text-[#2B2D42]">
            {post.title}
          </h3>
        )}
        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
        <PostImageGrid images={post.images} />
      </div>

      <hr className="border-gray-100" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
              post.isLikedByMe
                ? "text-[#d4800b]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Heart size={18} className={post.isLikedByMe ? "fill-[#d4800b]" : ""} />
            <span>{post.likesCount}</span>
          </button>
          
          <Link
            to={`/community/${post.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MessageSquare size={18} />
            <span>{post.commentsCount}</span>
          </Link>
        </div>

        {!isDetail && (
          <Link
            to={`/community/${post.id}`}
            className="flex items-center gap-1 px-4 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Eye size={16} />
            <span>View</span>
          </Link>
        )}
      </div>
    </div>
  );
}
