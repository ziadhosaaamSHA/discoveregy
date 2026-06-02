import { PlusCircle } from "lucide-react";
import { Button, PageBackButton, SegmentedTabs } from "../../../../../components/ui";

// PlansHeader keeps page-level navigation separate from plan selection state.
export function PlansHeader({
  navigate,
  title,
  createLabel,
  destId,
  activeTab,
  setActiveTab,
  t,
  language,
}) {
  const tabs = [
    { id: "matching", label: t("plans.matchingTrips") || (language === "ar" ? "الرحلات المطابقة" : "Matching Trips") },
    { id: "all", label: t("plans.allTrips") || (language === "ar" ? "كل الرحلات" : "All Trips") },
  ];

  return (
    <header className="flex flex-col gap-6 mb-8 max-w-6xl mx-auto px-2 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PageBackButton onClick={() => navigate(-1)} className="bg-transparent shadow-none hover:bg-black/5" />
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        </div>

        {/* Desktop Tabs (shown on sm and up) */}
        {destId && (
          <SegmentedTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={setActiveTab}
            className="hidden sm:flex backdrop-blur-sm"
            buttonClassName="px-5 py-1.5 text-sm font-bold"
          />
        )}

        <Button type="button" onClick={() => navigate("/tourist/create-plan")} className="rounded-full px-6 py-2">
          <PlusCircle size={20} />
          {createLabel}
        </Button>
      </div>

      {/* Mobile Tabs (shown on mobile only) */}
      {destId && (
        <SegmentedTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
          className="flex sm:hidden backdrop-blur-sm self-center"
          buttonClassName="px-6 py-2 font-bold"
        />
      )}
    </header>
  );
}
