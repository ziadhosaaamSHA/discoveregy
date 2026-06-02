import { cn } from "../../../../lib/utils";

// Shared pill-style tab control used by protected pages for local view filters.
export function SegmentedTabs({ tabs, activeId, onChange, className = "", buttonClassName = "" }) {
  return (
    <div className={cn("flex flex-wrap justify-center p-1 bg-black/5 rounded-full border border-black/5", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-black transition-all duration-300",
            activeId === tab.id ? "bg-[#e67e22] text-white shadow-md" : "text-gray-700 hover:bg-black/5",
            buttonClassName
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
