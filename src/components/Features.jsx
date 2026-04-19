import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from "../context/LanguageContext";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5 },
  }),
};

export default function Features() {
  const { t, isRTL } = useLanguage();
  const featuresItems = t("features.items");

  return (
    <section
      id="features"
      className="py-20 lg:py-28 bg-gradient-to-b from-white to-[#F9FAFB]"
      aria-labelledby="features-heading"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="features-heading" className="sr-only">
          {t("features.title")}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(featuresItems) && featuresItems.map((feature, i) => (
            <motion.article
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className={`bg-white rounded-2xl p-8 border border-border hover:shadow-card transition-shadow duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <h3 className="text-xl font-bold text-secondary mb-4">
                {feature.title}
              </h3>

              <p className="text-muted leading-relaxed mb-6">
                {feature.description}
              </p>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors font-medium group"
              >
                <span>{feature.link}</span>
                <ArrowRight
                  size={16}
                  className={`transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                  aria-hidden="true"
                />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
