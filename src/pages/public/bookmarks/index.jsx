import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Star,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useBookmarks } from "../../../context/BookmarksContext";
import { useLanguage } from "../../../context/LanguageContext";
import { tourismApi } from "../../../services/tourism-api";
import {
  fetchDestinations,
} from "@/services/destinations-data";
import { resolveApiAssetUrl } from "../../../services/api-client";

// Bookmarks displays saved destinations and reconciles them with current API data.
export default function Bookmarks() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, bookmarkCount } = useBookmarks();
  const { t, language, isRTL } = useLanguage();

  const [destinations, setDestinations] = useState([]);

  const [ratings, setRatings] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadDestinations = async () => {
      try {
        const data = await fetchDestinations();

        if (!cancelled) {
          setDestinations(data);
        }
      } catch {
        if (!cancelled) {
          setDestinations([]);
        }
      }
    };

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  const destinationMap = useMemo(() => {
    return new Map(destinations.map((item) => [item.id, item]));
  }, [destinations]);

  const bookmarkedDestinations = useMemo(() => {
    return bookmarks
      .map((id) => destinationMap.get(id))
      .filter(Boolean);
  }, [bookmarks, destinationMap]);

  useEffect(() => {
    let cancelled = false;

    const loadRatings = async () => {
      if (!bookmarkedDestinations.length) {
        setRatings({});
        return;
      }

      const ratingsMap = {};

      await Promise.all(
        bookmarkedDestinations.map(async (destination) => {
          try {
            const response = await tourismApi.getPlaceReviews(
              destination.id,
              language
            );

            const reviews = Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.items)
              ? response.items
              : [];

            const count = reviews.length;
            const average =
              count > 0
                ? reviews.reduce(
                    (sum, review) =>
                      sum + Number(review?.rating || 0),
                    0
                  ) / count
                : null;

            ratingsMap[destination.id] = {
              average: average !== null ? average.toFixed(1) : null,
              count,
            };
          } catch (error) {
            console.error(
              `Error fetching reviews for destination ${destination.id}:`,
              error
            );

            ratingsMap[destination.id] = null;
          }
        })
      );

      if (!cancelled) {
        setRatings(ratingsMap);
      }
    };

    loadRatings();

    return () => {
      cancelled = true;
    };
  }, [bookmarkedDestinations, language]);

  return (
    <div
      className={`min-h-screen bg-gray-50 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t("common.close")}
          >
            {isRTL ? (
              <ArrowRight size={20} className="text-secondary" />
            ) : (
              <ArrowLeft size={20} className="text-secondary" />
            )}
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
              const data =
                destination.copy?.[language] ||
                destination.copy?.en ||
                {};

              return (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <Link
                    to={`/destination/${destination.id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={`${resolveApiAssetUrl(destination.image)}`}
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

                    <div
                      className={`flex items-center gap-1 text-muted text-sm mb-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <MapPin
                        size={14}
                        className={isRTL ? "ml-1" : ""}
                      />
                      <span>{data.location}</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 mb-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Star
                          size={14}
                          className="text-primary fill-primary"
                        />

                        <span className="text-sm font-medium text-secondary">
                          {ratings[destination.id]?.average ??
                            (language === "ar"
                              ? "جارٍ التحميل..."
                              : "Loading...")}
                        </span>
                      </div>

                      <span className="text-muted text-sm">
                        ({ratings[destination.id] !== undefined
                          ? (ratings[destination.id]?.count ?? 0)
                          : language === "ar"
                            ? "جارٍ التحميل..."
                            : "Loading..."
                        }
                        {t("destination.reviews")})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBookmark(destination.id)}
                    className={`self-start p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                      isRTL ? "mr-auto" : "ml-auto"
                    }`}
                    aria-label={t("bookmarks.removeBookmark", {
                      name: data.name,
                    })}
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
