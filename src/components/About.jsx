import { motion } from "framer-motion";

const STATS = [
  {
    id: "downloads",
    label: "Total Downloads",
    value: "439",
    gradient: "from-[#D4E4F7] to-[#F0F7FF]",
  },
  {
    id: "ratings",
    label: "App Ratings",
    value: "5.0",
    sub: "out of 5",
    badge: "32 Ratings",
    gradient: "from-[#F5F0C4] to-[#FDFBE8]",
  },
  {
    id: "conversion",
    label: "Conversion Rate",
    value: "22.7 %",
    gradient: "from-[#D4F0E7] to-[#E8FBF4]",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function About() {
  return (
    <section
      id="about-us"
      className="py-20 lg:py-28"
      aria-labelledby="about-heading"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          id="about-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-bold text-secondary text-center mb-16"
        >
          About Us
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              className={`rounded-2xl p-8 bg-linear-to-r ${stat.gradient} border border-white/50`}
            >
              <p className="text-secondary/70 text-sm font-medium mb-3">
                {stat.label}
              </p>
              <p className="text-4xl lg:text-5xl font-bold text-secondary mb-1">
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-secondary/60 text-sm mb-4">{stat.sub}</p>
              )}
              {stat.badge && (
                <span className="inline-block px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg">
                  {stat.badge}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
