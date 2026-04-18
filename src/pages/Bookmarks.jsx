import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, MapPin, Star, Trash2 } from "lucide-react";
import { useBookmarks } from "../context/BookmarksContext";
import { DESTINATIONS } from "../data/destinations";

export default function Bookmarks() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, bookmarkCount } = useBookmarks();

  const bookmarkedDestinations = DESTINATIONS.filter((d) =>
    bookmarks.includes(d.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-secondary">
            My Bookmarks ({bookmarkCount})
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
              No bookmarks yet
            </h2>
            <p className="text-muted text-center mb-6">
              Start exploring and save your favorite destinations!
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
            >
              Explore Destinations
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {bookmarkedDestinations.map((destination, i) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
              >
                <Link
                  to={`/destination/${destination.id}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                    loading="lazy"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/destination/${destination.id}`}>
                    <h3 className="font-semibold text-secondary text-lg mb-1 hover:text-primary transition-colors">
                      {destination.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 text-muted text-sm mb-2">
                    <MapPin size={14} />
                    <span>{destination.location}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-primary fill-primary" />
                      <span className="text-sm font-medium text-secondary">
                        {destination.rating}
                      </span>
                    </div>
                    <span className="text-muted text-sm">
                      ({destination.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">
                      {destination.price}
                    </span>
                    <span className="text-muted text-sm">
                      {destination.duration}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeBookmark(destination.id)}
                  className="self-start p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${destination.name} from bookmarks`}
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
