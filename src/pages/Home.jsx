import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { DESTINATIONS } from "../data/destinations";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ── Data slices ──────────────────────────────────────────────
const ACTIVITY_IDS = [8, 6, 3, 10]; // Giza, Red Sea, Alexandria, Valley of Kings
const POPULAR_IDS  = [1, 3, 5, 7, 9, 11, 12, 13];

const activityDestinations = DESTINATIONS.filter((d) => ACTIVITY_IDS.includes(d.id));
const popularDestinations  = DESTINATIONS.filter((d) => POPULAR_IDS.includes(d.id));

// ── Animation helpers ────────────────────────────────────────
const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.48, delay: i * 0.11, ease: "easeOut" },
});

// ── Activity card ────────────────────────────────────────────
function ActivityCard({ dest, index }) {
  const { language, t, isRTL } = useLanguage();
  const data = dest.copy[language] || dest.copy.en;
  
  // Logic: 0: 0 90px (left), 1: 90px 0 (right), 2: 90px 0 (left), 3: 0 90px (right)
  const isLeft = index % 2 === 0;

  // Card radius: 0 (left img) -> 0 90px 0 0 | 1 (right img) -> 90px 0 0 0
  // Actually, wait: index 0: left img -> 0px 90px 0px 90px, index 1: right img -> 90px 0px 90px 0px
  const cardRadius = isLeft     
    ? (index === 0 ? "0 90px 0 90px" : "90px 0 90px 0") 
    : (index === 1 ? "90px 0 90px 0" : "0 90px 0 90px");
  const imgRadius = isLeft 
    ? (index === 0 ? "0 90px 0 0" : "90px 0 0 0") 
    : (index === 1 ? "0px 0 0px 0" : "0 0px 0 0px");

  return (
    <motion.article
      {...fadeUp(index)}
      className="overflow-hidden flex h-[240px]"
      style={{
        borderRadius: cardRadius,
        border: "1px solid #211C1C",
        boxShadow: "4px 0 50px 0 rgba(0, 0, 0, 0.25)",
        direction: isRTL ? "rtl" : "ltr",
        backgroundColor: "#F2E0CA"
      }}
    >
      {/* ── Text ── */}
      <div className={`flex flex-col justify-between p-6 flex-1 min-w-0 ${isLeft ? "order-1" : "order-2"}`}>
        <div>
          <h3 className="text-[17px] font-bold text-black mb-2 leading-snug">{data.name}</h3>
          <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-5">{data.description}</p>
        </div>
        <div className="flex justify-center">
          <Link
            to={`/destination/${dest.id}`}
            className="inline-flex items-center justify-center px-5 py-2 bg-[#E8A020] text-white text-[13px] font-semibold rounded-xl hover:brightness-110 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            {t("destination.details")}
          </Link>
        </div>
      </div>

      {/* ── Image ── */}
      <div className={`w-[210px] shrink-0 ${isLeft ? "order-2" : "order-1"}`}>
        <img
          src={dest.image}
          alt={data.name}
          className="w-full h-full object-cover"
          style={{ borderRadius: imgRadius }}
          loading="lazy"
        />
      </div>
    </motion.article>
  );
}

// ── Popular card ─────────────────────────────────────────────
function PopularCard({ dest, index }) {
  const { language } = useLanguage();
  const data = dest.copy[language] || dest.copy.en;

  return (
    <motion.div
      {...fadeUp(index * 0.7)}
      className="snap-start shrink-0 w-[260px] sm:w-[300px]"
    >
      <Link to={`/destination/${dest.id}`} className="block group">
        <div className="relative h-[155px] rounded-[16px] overflow-hidden">
          <img
            src={dest.image}
            alt={data.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Rating badge */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow">
            <Star size={11} className="text-[#E8A020] fill-[#E8A020]" aria-hidden="true" />
            <span className="text-[11px] font-bold text-gray-800">{dest.rating}</span>
          </div>
          {/* Gradient + name */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <p className="absolute bottom-2.5 left-3 right-3 text-white text-[13px] font-semibold line-clamp-1">
            {data.name}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function Home() {
  const { isRTL, t } = useLanguage();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2E0CA" }}>
      <Header />

      <main className="pt-24 pb-16">

        {/* ══ Current Activities ══════════════════════════════ */}
        <section
          id="activities"
          className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16"
          aria-labelledby="activities-heading"
        >
          <motion.h2
            id="activities-heading"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[32px] lg:text-[38px] font-bold text-black text-center mb-10"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {t("destination.currentActivities")}
          </motion.h2>

          <div
            className={`flex flex-wrap gap-5 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {activityDestinations.map((dest, i) => (
              <div key={dest.id} className="w-full md:w-[calc(50%-10px)]">
                <ActivityCard dest={dest} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* ══ Popular Attractions ═════════════════════════════ */}
        <section
          id="popular"
          className="py-12 lg:py-16"
          aria-labelledby="popular-heading"
        >
          <div className="max-w-[1200px] mx-auto px-6">
            <motion.h2
              id="popular-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[32px] lg:text-[38px] font-bold text-black text-center mb-10"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {t("destination.popularAttractions")}
            </motion.h2>
          </div>

          {/* Full-bleed scroll so cards bleed to screen edge */}
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

      </main>

      <Footer />
    </div>
  );
}