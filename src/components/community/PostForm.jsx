import React, { useState, useMemo } from "react";
import { Image, X, Send } from "lucide-react";

export function PostForm({ post, submitLabel = "Publish", isSubmitting, onSubmit, onCancel }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [images, setImages] = useState([]);

  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  const handleFiles = (event) => {
    setImages((current) => [...current, ...Array.from(event.target.files ?? [])]);
    event.target.value = "";
  };

  const removeImage = (name) => {
    setImages((current) => current.filter((file) => file.name !== name));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    if (post) {
      onSubmit({
        content: content.trim(),
        title: title.trim(),
        newImages: images,
      });
      return;
    }

    onSubmit({
      content: content.trim(),
      title: title.trim(),
      images: images,
    });
    setTitle("");
    setContent("");
    setImages([]);
  };

  return (
    <div id="create-post" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#154d7d]">Share your trip story</h3>
          <p className="text-xs text-gray-500">
            Post a moment, tip, or question for the Discover community.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
          <input
            type="text"
            placeholder="Give your story a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Post content *</label>
          <textarea
            placeholder="What's on your mind? Share your thoughts, advice, or questions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            required
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {previews.map(({ file, url }) => (
              <div key={file.name} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeImage(file.name)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-4 py-2 border-2 border-secondary text-secondary rounded-xl font-semibold text-sm hover:bg-secondary hover:text-white transition-colors cursor-pointer">
              <Image size={18} />
              <span>Images</span>
              <input hidden type="file" accept="image/*" multiple onChange={handleFiles} />
            </label>
            {images.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-secondary text-secondary bg-secondary/5 font-semibold">
                {images.length} selected
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#d4800b] hover:brightness-105 text-white rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Publishing..." : submitLabel}</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
