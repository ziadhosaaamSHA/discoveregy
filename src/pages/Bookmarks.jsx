import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, MapPin, Star, Trash2, ArrowRight } from "lucide-react";
import { useBookmarks } from "../context/BookmarksContext";
import { DESTINATIONS } from "../data/destinations";
import { useLanguage } from "../context/LanguageContext";

export default function Bookmarks() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, bookmarkCount } = useBookmarks();
  const { t, language, isRTL } = useLanguage();

  const bookmarkedDestinations = DESTINATIONS.filter((d) =>
    bookmarks.includes(d.id)
  );

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
          <h1 className="text-lg font-semibold text-secondary">
            {t("bookmarks.title", { count: bookmarkCount })}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto bg-white min-h-screen shadow-lg p-6">
        {bookmarkedDestinations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bookmark size={32} className="text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-secondary mb-2">
              {t("bookmarks.emptyTitle")}
            </h2>
            <p className="text-muted text-center mb-6">
              {t("bookmarks.emptyBody")}
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
            >
              {t("bookmarks.exploreDestinations")}
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {bookmarkedDestinations.map((destination, i) => {
              const data = destination.copy[language] || destination.copy.en;
              const duration = destination.duration[language] || destination.duration.en;
              
              return (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Link
                    to={`/destination/${destination.id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={destination.image}
                      alt={data.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/destination/${destination.id}`}>
                      <h3 className="font-semibold text-secondary text-lg mb-1 hover:text-primary transition-colors truncate">
                        {data.name}
                      </h3>
                    </Link>

                    <div className={`flex items-center gap-1 text-muted text-sm mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin size={14} className={isRTL ? 'ml-1' : ''} />
                      <span>{data.location}</span>
                    </div>

                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Star size={14} className="text-primary fill-primary" />
                        <span className="text-sm font-medium text-secondary">
                          {destination.rating}
                        </span>
                      </div>
                      <span className="text-muted text-sm">
                        ({destination.reviews} {t("destination.reviews")})
                      </span>
                    </div>

                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-primary font-bold">
                        {destination.price}
                      </span>
                      <span className="text-muted text-sm">
                        {duration}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBookmark(destination.id)}
                    className={`self-start p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${isRTL ? 'mr-auto' : 'ml-auto'}`}
                    aria-label={t("bookmarks.removeBookmark", { name: data.name })}
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
