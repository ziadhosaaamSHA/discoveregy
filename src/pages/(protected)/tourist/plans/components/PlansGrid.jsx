import { PlanCard } from "./PlanCard";

// PlansGrid owns the loading, empty, error, and card-list presentation states.
export function PlansGrid({
  plans,
  isLoading,
  plansError,
  activePlanId,
  tripDetailsById,
  destinationMap,
  deletingPlanId,
  isRTL,
  language,
  t,
  onSelectPlan,
  onDeletePlan,
  destId,
  navigate,
}) {
  if (isLoading) {
    return (
      <div className="col-span-full py-14 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
        <p className="text-gray-600 font-bold italic">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="col-span-full py-14 text-center bg-red-50 rounded-[40px] border-2 border-red-200">
        <p className="text-red-700 font-bold italic">Error retrieving.</p>
      </div>
    );
  }

  if (plans.length === 0) {
    const noTripsMessage = t("plans.noTripsFoundForDestination") || (language === "ar" ? "لم يتم العثور على جولات لهذه الوجهة." : "No trips found for this destination.");
    const createLabel = t("createPlan.title") || (language === "ar" ? "إنشاء خطة مخصصة" : "Create custom plan");

    return (
      <div className="col-span-full py-14 text-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
        {destId ? (
          <div>
            <p className="text-red-700 font-bold italic">{noTripsMessage}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => navigate ? navigate("/tourist/create-plan") : window.location.assign("/tourist/create-plan")}
                className="bg-[#e67e22] text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                {createLabel}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 font-bold italic">{t("plans.noPlansFound") || "No plans found."}</p>
        )}
      </div>
    );
  }

  return plans.map((plan) => (
    <PlanCard
      key={plan.id}
      plan={plan}
      isActive={activePlanId === plan.id}
      isRTL={isRTL}
      language={language}
      t={t}
      destinationMap={destinationMap}
      tripDetails={tripDetailsById[plan.tripId]}
      deletingPlanId={deletingPlanId}
      onSelect={onSelectPlan}
      onDelete={onDeletePlan}
    />
  ));
}
