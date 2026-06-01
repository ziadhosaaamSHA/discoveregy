import { ChevronLeft, PlusCircle } from "lucide-react";

// PlansHeader keeps page-level navigation separate from plan selection state.
export function PlansHeader({ isRTL, navigate, title, createLabel }) {
  return (
    <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto relative px-2 pt-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
          {isRTL ? <ChevronLeft size={28} strokeWidth={1.5} className="rotate-180" /> : <ChevronLeft size={28} strokeWidth={1.5} />}
        </button>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
      </div>
      <button onClick={() => navigate("/tourist/create-plan")} className="bg-[#e67e22] text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md hover:brightness-110 active:scale-95 transition-all">
        <PlusCircle size={20} />
        {createLabel}
      </button>
    </header>
  );
}
