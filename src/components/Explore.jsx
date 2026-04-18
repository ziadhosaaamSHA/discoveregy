import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { DESTINATIONS } from "../data/destinations";

const FEATURED_IDS = [1, 5, 8];
const featuredDestinations = DESTINATIONS.filter((d) =>
  FEATURED_IDS.includes(d.id)
);

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export default function Explore() {
  return (
    <section
      id="explore"
      className="py-20 lg:py-28 relative"
      aria-labelledby="explore-heading"
    >
      {/* Floating airplane decoration */}
      <motion.img
        src="/images/right_up_airplane.png"
        alt=""
        aria-hidden="true"
        className="absolute top-12 right-12 w-96 opacity-75 hidden lg:block"
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          id="explore-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-bold text-secondary text-center mb-16"
        >
          Explore
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDestinations.map((dest, i) => (
            <motion.article
              key={dest.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.12)" }}
              className="bg-white rounded-2xl overflow-hidden shadow-card group"
            >
              <Link to={`/destination/${dest.id}`} className="block">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={`${dest.name} destination`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={400}
                    height={256}
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-secondary">
                      {dest.name}
                    </h3>
                    <span className="text-lg font-bold text-muted">
                      {dest.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted">
                    <Navigation size={16} aria-hidden="true" />
                    <span className="text-sm">{dest.duration}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Bottom floating airplane */}
      <motion.img
        src="/images/left_airplane.png"
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-8 w-96 -z-10 opacity-75 hidden lg:block"
        animate={{ y: [0, 12, 0], x: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}
