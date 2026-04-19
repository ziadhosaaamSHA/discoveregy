import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MapPin, Bookmark, Star, BadgeCheck, ArrowRight } from "lucide-react";
import { DESTINATIONS, COMMENTS } from "../data/destinations";
import { useBookmarks } from "../context/BookmarksContext";
import { useLanguage } from "../context/LanguageContext";
import BookingModal from "../components/BookingModal";

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { t, language, isRTL } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const destination = DESTINATIONS.find((d) => d.id === Number(id));
  const bookmarked = destination ? isBookmarked(destination.id) : false;

  if (!destination) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary mb-2">
            {t("destination.notFound")}
          </p>
          <Link to="/" className="text-primary hover:underline">
            {t("destination.goBackHome")}
          </Link>
        </div>
      </div>
    );
  }

  const data = destination.copy[language] || destination.copy.en;
  const name = data.name;
  const description = data.description;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t("common.close")}
          >
            {isRTL ? <ArrowRight size={20} className="text-secondary" /> : <ArrowLeft size={20} className="text-secondary" />}
          </button>
          <h1 className="text-lg font-semibold text-secondary">{t("destination.details")}</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto bg-white min-h-screen shadow-lg">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-video w-full"
        >
          <img
            src={destination.image.replace("w=400&h=400", "w=800&h=600")}
            alt={name}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Description Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6"
        >
          <h2 className="text-lg font-bold text-secondary mb-3">{t("destination.description")}</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            {description}
          </p>

          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all flex-1"
            >
              {t("destination.bookNow")}
            </button>

            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-white hover:brightness-110 transition-all"
              aria-label={t("destination.call")}
            >
              <Phone size={20} />
            </button>

            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-white hover:brightness-110 transition-all"
              aria-label={t("destination.viewLocation")}
            >
              <MapPin size={20} />
            </button>

            <button
              type="button"
              onClick={() => toggleBookmark(destination.id)}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl transition-all ${
                bookmarked
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-secondary hover:border-primary hover:text-primary"
              }`}
              aria-label={bookmarked ? t("bookmarks.removeBookmark", { name }) : t("auth.saveToBookmarks")}
            >
              <Bookmark size={20} className={bookmarked ? "fill-white" : ""} />
            </button>
          </div>
        </motion.section>

        {/* Comments Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 pt-0"
        >
          <h2 className="text-lg font-bold text-secondary mb-4">{t("destination.comments")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMMENTS.map((comment, i) => {
              // We always use the English copy as requested by the user
              const reviewData = comment.copy.en;
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`bg-gray-50 rounded-2xl p-4 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {/* User Info */}
                  <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={comment.avatar}
                      alt={reviewData.user}
                      className="w-8 h-8 rounded-full object-cover"
                      loading="lazy"
                      width={32}
                      height={32}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold text-secondary truncate">
                          {reviewData.user}
                        </span>
                        {comment.verified && (
                          <BadgeCheck
                            size={12}
                            className="text-accent flex-shrink-0"
                            aria-label={t("destination.verified")}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className={`flex items-center gap-0.5 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={12}
                        className={
                          idx < comment.rating
                            ? "text-primary fill-primary"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-muted leading-relaxed line-clamp-3">
                    {reviewData.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Bottom Padding */}
        <div className="h-8" />
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        destination={destination}
      />
    </div>
  );
}
