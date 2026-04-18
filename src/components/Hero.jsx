import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-28 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#F3F6FF] to-white -z-10"
        aria-hidden="true"
      />

      {/* Decorative blob */}
      <div
        className="absolute top-20 right-0 w-[500px] h-[500px] bg-soft rounded-full blur-3xl opacity-60 -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
              Best Destinations Around Egypt
            </span>

            <h1
              id="hero-heading"
              className="text-4xl md:text-5xl lg:text-[64px] font-bold text-secondary leading-tight mb-6"
            >
              Travel, enjoy and live a new and full life
            </h1>

            <p className="text-muted text-lg leading-relaxed mb-8 max-w-lg">
              Worem ipsum dolor sit amet, consectetur adipiscing elit. Worem
              ipsum dolor sit amet, consectetur adipiscing elit. Worem ipsum
              dolor sit amet,
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#explore"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-btn hover:brightness-110 transition-all hover:-translate-y-0.5"
              >
                Find out more
              </a>

              <button
                type="button"
                className="inline-flex items-center gap-3 text-gray-800 font-medium group"
                aria-label="Play demo video"
              >
                <span className="w-12 h-12 flex items-center justify-center bg-primary rounded-full text-white shadow-btn group-hover:scale-105 transition-transform">
                  <Play size={18} fill="currentColor" aria-hidden="true" />
                </span>
                <span>Download Now!</span>
              </button>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main traveller image */}
            <img
              src="/images/hero_traveller_img.png"
              alt="Happy traveller with suitcase exploring Egypt"
              className="w-full max-w-lg mx-auto"
              width={900}
              height={600}
              loading="eager"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
