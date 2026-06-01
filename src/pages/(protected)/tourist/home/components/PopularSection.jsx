import { motion } from "framer-motion";
import { PopularCard } from "./PopularCard";

export default function PopularSection({ popularDestinations, isRTL, t }) {
  return (
    <section id="popular" className="py-12 lg:py-16" aria-labelledby="popular-heading">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          id="popular-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[32px] lg:text-[38px] font-bold text-black text-center mb-10"
        >
          {t("destination.popularAttractions")}
        </motion.h2>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-3 pl-[max(24px,calc((100vw-1200px)/2+24px))] pr-6 snap-x snap-mandatory"
        style={{
          direction: isRTL ? "rtl" : "ltr",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {popularDestinations.map((dest, i) => (
          <PopularCard key={dest.id} dest={dest} index={i} />
        ))}
      </div>
    </section>
  );
}
