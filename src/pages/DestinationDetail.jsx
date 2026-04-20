import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone, MapPin, Bookmark, Star, BadgeCheck,
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";
import { DESTINATIONS, COMMENTS } from "../data/destinations";
import { useBookmarks } from "../context/BookmarksContext";
import { useLanguage } from "../context/LanguageContext";

// Figma back icon
const imgBackIcon = "http://localhost:3845/assets/6235413aa7ab9a66ee4722fb5888215567271838.svg";

export default function DestinationDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { t, language, isRTL }           = useLanguage();
  const carouselRef  = useRef(null);

  // Handle drag-to-scroll
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const destination = DESTINATIONS.find((d) => d.id === Number(id));
  const bookmarked  = destination ? isBookmarked(destination.id) : false;

  if (!destination) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2" style={{ color: "#2B2D42" }}>
            {t("destination.notFound")}
          </p>
          <Link to="/" style={{ color: "#d4800b" }} className="hover:underline">
            {t("destination.goBackHome")}
          </Link>
        </div>
      </div>
    );
  }

  const data        = destination.copy[language] || destination.copy.en;
  const name        = data.name;
  const description = data.description;

  // Build carousel images from the destination image + variations
  const carouselImages = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    src: destination.image.replace("w=400&h=400", `w=200&h=260&sig=${i}`),
    alt: `${name} photo ${i + 1}`,
  }));

  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen ${isRTL ? "text-right" : "text-left"}`} style={{ backgroundColor: "#F2E0CA" }}>

      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: "#fff", borderColor: "#e5e7eb" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            aria-label={t("common.close")}
          >
            <img src={imgBackIcon} alt="back" className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: "#2B2D42" }}>
            {t("destination.details")}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto min-h-screen">

        {/* ── Hero image ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full overflow-hidden mb-8"
          style={{ height: "420px", borderRadius: "0 0 24px 24px" }}
        >
          <img
            src={destination.image.replace("w=400&h=400", "w=1200&h=600")}
            alt={name}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
          <h2 className="absolute bottom-5 left-8 text-white font-bold text-3xl">{name}</h2>
        </motion.div>

        {/* ── Photos full-width strip ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-8 py-8"
        >
          <div className="flex items-center justify-between mb-4 w-full px-8">
            <h3 className="text-sm font-semibold" style={{ color: "#2B2D42" }}>
              {t("destination.photos")}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border bg-white transition-colors hover:bg-gray-50 shadow-sm"
                style={{ borderColor: "#e0e0e0" }}
              >
                {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border bg-white transition-colors hover:bg-gray-50 shadow-sm"
                style={{ borderColor: "#e0e0e0" }}
              >
                {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-4 px-8"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {carouselImages.map((img, i) => (
              <motion.div
                key={img.id}
                className="flex-shrink-0 overflow-hidden"
                style={{
                  width: "180px",
                  height: "220px",
                  borderRadius: "16px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.10)",
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Combined Description and Comments container ── */}
        <div className={`px-8 pb-12 grid grid-cols-1 md:grid-cols-2 gap-12 ${isRTL ? "text-right" : "text-left"}`}>
          
          {/* Description */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "#2B2D42" }}>
              {t("destination.description")}
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B7280" }}>
              {description}
            </p>

            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              {/* Book Now — Figma: rounded rectangle 173×48, #d4800b */}
              <button
                type="button"
                onClick={() => navigate("/pay")}
                className="font-semibold text-white transition-all hover:brightness-110"
                style={{
                  backgroundColor: "#d4800b",
                  borderRadius: "14px",
                  padding: "12px 28px",
                  boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
                  fontSize: "15px",
                }}
              >
                {t("destination.bookNow")}
              </button>
              <button
                type="button"
                className="w-12 h-12 flex items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#d4800b", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.15)" }}
                aria-label={t("destination.call")}
              >
                <Phone size={20} />
              </button>
              <button
                type="button"
                className="w-12 h-12 flex items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#d4800b", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.15)" }}
                aria-label={t("destination.viewLocation")}
              >
                <MapPin size={20} />
              </button>
              <button
                type="button"
                onClick={() => toggleBookmark(destination.id)}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all"
                style={{
                  borderColor: bookmarked ? "#d4800b" : "#e5e7eb",
                  backgroundColor: bookmarked ? "#d4800b" : "transparent",
                  color: bookmarked ? "#fff" : "#2B2D42",
                }}
              >
                <Bookmark size={20} className={bookmarked ? "fill-white" : ""} />
              </button>
            </div>
          </motion.section>

          {/* Comments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "#2B2D42" }}>
              {t("destination.comments")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMMENTS.map((comment, i) => {
                const reviewData = comment.copy.en;
                return (
                  <div
                    key={comment.id}
                    className="p-4"
                    style={{
                      backgroundColor: "#E6E6D5",
                      borderRadius: "16px",
                      boxShadow: "2px 4px 4px 0px rgba(0,0,0,0.10)",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <img src={comment.avatar} alt={reviewData.user} className="w-9 h-9 rounded-full" />
                      <span className="text-xs font-semibold" style={{ color: "#2B2D42" }}>{reviewData.user}</span>
                      {comment.verified && <BadgeCheck size={12} style={{ color: "#d4800b" }} />}
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "#6B7280" }}>{reviewData.text}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        <div className="h-10" />
      </main>
    </div>
  );
}