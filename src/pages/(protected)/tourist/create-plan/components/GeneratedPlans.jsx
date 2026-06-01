import { Plus } from "lucide-react";

export default function GeneratedPlans({ generatedPlans, onSelectPlan, isRTL, language, prompt, t }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="!ml-2 mt-8 mb-2 text-3xl font-bold">{t("createPlan.selectTitle")}</h2>
        <p className="mb-6 text-gray-600">{t("createPlan.resultsFor", { query: prompt })}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {generatedPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white/40 backdrop-blur-sm rounded-[40px] p-6 shadow-xl border border-white/50 cursor-pointer hover:scale-[1.02] transition-all group"
            onClick={() => onSelectPlan(plan.id)}
          >
            <div className="aspect-video rounded-[32px] overflow-hidden mb-6">
              <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-black text-[#5d4037] mb-3">{plan.title}</h3>
            <p className="text-gray-700 font-medium leading-relaxed italic line-clamp-4">{plan.text}</p>
            <div className={`mt-8 flex ${isRTL ? "justify-start" : "justify-end"}`}>
              <div className="bg-[#e67e22] text-white p-3 rounded-2xl">
                <Plus size={24} strokeWidth={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
