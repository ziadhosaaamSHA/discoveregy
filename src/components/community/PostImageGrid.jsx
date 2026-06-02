import React from "react";
import { resolveApiAssetUrl } from "../../services/api-client";

export function PostImageGrid({ images }) {
  if (!images || images.length === 0) {
    return null;
  }

  const resolvedImages = images.map(resolveApiAssetUrl);

  return (
    <div
      className={`grid gap-2 mt-4 ${
        resolvedImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {resolvedImages.slice(0, 4).map((url, index) => {
        const isThreeImages = resolvedImages.length === 3;
        const gridColumnClass = isThreeImages && index === 0 ? "col-span-2" : "col-auto";
        const aspectClass = resolvedImages.length === 1 ? "aspect-video" : "aspect-square";

        return (
          <div
            key={`${url}-${index}`}
            className={`${gridColumnClass} ${aspectClass} overflow-hidden rounded-xl bg-[#efe5d2]`}
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover block"
            />
          </div>
        );
      })}
    </div>
  );
}
