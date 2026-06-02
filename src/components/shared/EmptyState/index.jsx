export function EmptyState({ children, tone = "muted", className = "" }) {
  const toneClass = tone === "error"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-black/5 border-black/10 text-gray-600";

  return (
    <div className={`col-span-full py-14 text-center rounded-[40px] border-2 border-dashed ${toneClass} ${className}`}>
      <p className="font-bold italic">{children}</p>
    </div>
  );
}
