import { motion } from "framer-motion";
import { ActivityCard } from "./ActivityCard";

export default function ActivitiesSection({ activityDestinations, isRTL, t }) {
  return (
    <section id="activities" className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16" aria-labelledby="activities-heading">
      <motion.h2
        id="activities-heading"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[32px] lg:text-[38px] font-bold text-black text-center mb-10"
      >
        {t("destination.currentActivities")}
      </motion.h2>

      <div className={`flex flex-wrap gap-5 ${isRTL ? "flex-row-reverse" : "flex-row"}`} dir={isRTL ? "rtl" : "ltr"}>
        {activityDestinations.map((dest, i) => (
          <div key={dest.id} className="w-full md:w-[calc(50%-10px)]">
            <ActivityCard dest={dest} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
