import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MapPin, Bookmark, Star, BadgeCheck } from "lucide-react";
import { DESTINATIONS, COMMENTS } from "../data/destinations";
import { useBookmarks } from "../context/BookmarksContext";
import BookingModal from "../components/BookingModal";

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const destination = DESTINATIONS.find((d) => d.id === Number(id));
  const bookmarked = destination ? isBookmarked(destination.id) : false;

  if (!destination) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary mb-2">
            Destination not found
          </p>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-secondary">Details</h1>
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
            alt={destination.name}
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
          <h2 className="text-lg font-bold text-secondary mb-3">Description</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            {destination.description}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
            >
              Book now
            </button>

            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-white hover:brightness-110 transition-all"
              aria-label="Call"
            >
              <Phone size={20} />
            </button>

            <button
              type="button"
              className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-white hover:brightness-110 transition-all"
              aria-label="View location"
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
              aria-label={bookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
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
          <h2 className="text-lg font-bold text-secondary mb-4">Comments</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMMENTS.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-gray-50 rounded-2xl p-4"
              >
                {/* User Info */}
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                    width={32}
                    height={32}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-secondary truncate">
                        {comment.user}
                      </span>
                      {comment.verified && (
                        <BadgeCheck
                          size={12}
                          className="text-accent flex-shrink-0"
                          aria-label="Verified"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-2">
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
                  {comment.text}
                </p>
              </motion.div>
            ))}
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
