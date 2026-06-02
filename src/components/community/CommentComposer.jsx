import React, { useState } from "react";
import { Image, Send } from "lucide-react";

export function CommentComposer({ label = "Add a comment", submitLabel = "Comment", isSubmitting, onSubmit }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const handleFiles = (event) => {
    setImages((current) => [...current, ...Array.from(event.target.files ?? [])]);
    event.target.value = "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    onSubmit(content.trim(), images);
    setContent("");
    setImages([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2">
        <textarea
          placeholder={label}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-300 outline-none text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#d4800b] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all self-stretch sm:self-auto"
        >
          <span>{isSubmitting ? "Sending..." : submitLabel}</span>
          <Send size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 px-3 py-1.5 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer">
          <Image size={14} />
          <span>Images</span>
          <input hidden type="file" accept="image/*" multiple onChange={handleFiles} />
        </label>
        {images.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-secondary text-secondary bg-secondary/5 font-semibold">
            {images.length} selected
          </span>
        )}
      </div>
    </form>
  );
}
