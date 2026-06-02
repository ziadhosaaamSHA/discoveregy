import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone, MapPin, Bookmark, BadgeCheck, Play, X,
} from "lucide-react";
import { useBookmarks } from "../../../context/BookmarksContext";
import { useLanguage } from "../../../context/LanguageContext";
import { tourismApi } from "../../../services/tourism-api";
import { resolveApiAssetUrl } from "../../../services/api-client";
// Figma back icon
const imgBackIcon = "/images/back-svgrepo-com 1.svg";
const DEFAULT_DESTINATION_VIDEO_URL = "https://www.youtube.com/watch?v=mfxQy5A_tHs";


function normalizeReview(review, index) {
  return {
    id: String(review?.id ?? `${Date.now()}-${index}`),
    user:
      review?.userName ??
      review?.touristName ??
      review?.user?.name ??
      review?.tourist?.name ??
      "Guest",
    text: review?.comment ?? review?.text ?? "",
    rating: Number(review?.rating ?? 5),
    verified: Boolean(review?.verified),
    isApi: true,
    avatar:
      review?.avatarUrl ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  };
}

// DestinationSkeleton keeps the detail page layout stable while API data loads.
function DestinationSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[420px] bg-gray-300 rounded-b-3xl" />

      <div className="px-8 py-10">
        <div className="h-8 w-48 bg-gray-300 rounded mb-6" />

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="h-5 w-32 bg-gray-300 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
            </div>
          </div>

          <div>
            <div className="h-5 w-32 bg-gray-300 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// DestinationDetail shows destination media, booking actions, bookmarks, and reviews.
export default function DestinationDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { t, language, isRTL }           = useLanguage();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");
  const [editingReviewRating, setEditingReviewRating] = useState("5");
  const [activeReviewActionId, setActiveReviewActionId] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);



  // Use API place details when available،
  const source = placeDetails;
  const bookmarked  = source ? isBookmarked(Number(source.id)) : false;

useEffect(() => {
  let cancelled = false;

  const loadPlaceDetails = async () => {
    const placeId = Number(id);

    if (!Number.isFinite(placeId)) {
      setLoadError("Invalid place id");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await tourismApi.getPlaceById(placeId);

      const payload =
        response && typeof response === "object"
          ? response.data && typeof response.data === "object"
            ? response.data
            : response
          : null;

      if (!cancelled) {
        setPlaceDetails(payload);
      }
    } catch {
      if (!cancelled) {
        setPlaceDetails(null);
        setLoadError("Error Retrieving");
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
  };

  loadPlaceDetails();

  return () => {
    cancelled = true;
  };
}, [id]);
  useEffect(() => {
    let cancelled = false;
    const loadReviews = async () => {
      const placeId = placeDetails?.id
      if (!placeId) return;
      try {
        const response = await tourismApi.getPlaceReviews(Number(placeId));
        const source = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];
        if (!cancelled) {
          setReviews(source.map(normalizeReview));
        }
      } catch {
        if (!cancelled) setReviews([]);
      }
    };

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [placeDetails]);

if (loadError) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-red-600">
        {t("destination.loadError")}
      </div>
    </div>
  );
}

function getEmbedUrl(url) {
  if (!url) return "";

  // already embed url
  if (url.includes("/embed/")) {
    return url;
  }

  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/i
  );

  if (!match) return url;

  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
}

function readCoordinate(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}
  // Prefer API-provided placeDetails when available
  const currentPlaceId = placeDetails?.id
  let name;
  let description;
  let destinationVideoUrl = DEFAULT_DESTINATION_VIDEO_URL;
  if (placeDetails) {
    name = language === "ar" ? (placeDetails.nameAr || placeDetails.name) : (placeDetails.name || "");
    description = language === "ar" ? (placeDetails.descriptionAr || placeDetails.description) : (placeDetails.description || "");
    destinationVideoUrl = getEmbedUrl( placeDetails.videoUrl || DEFAULT_DESTINATION_VIDEO_URL);
  }
  const heroImage = resolveApiAssetUrl(placeDetails?.imageUrl);
  const videoButtonLabel = language === "ar" ? "فيديو المكان" : "Place video";
  const latitude = readCoordinate(placeDetails?.latitude, placeDetails?.Latitude, placeDetails?.lat, placeDetails?.Lat);
  const longitude = readCoordinate(placeDetails?.longitude, placeDetails?.Longitude, placeDetails?.lng, placeDetails?.Lng);
  const hasCoordinates = latitude !== null && longitude !== null;
  const handleOpenMap = () => {
    if (!hasCoordinates) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, "_blank", "noopener,noreferrer");
  };
  const displayedReviews = reviews
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    try {
      setIsSubmittingReview(true);
      setReviewError("");
      await tourismApi.createReview({
        placeId: currentPlaceId,
        rating: Number(reviewRating),
        comment: reviewText.trim(),
      });
      setReviewText("");
      const response = await tourismApi.getPlaceReviews(Number(currentPlaceId));
      const source = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
            ? response.data
            : [];
      setReviews(source.map(normalizeReview));
    } catch (error) {
      setReviewError(error?.message || "Unable to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleStartEditReview = (review) => {
    if (!review?.isApi) return;
    setEditingReviewId(review.id);
    setEditingReviewText(review.text || "");
    setEditingReviewRating(String(review.rating || 5));
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditingReviewText("");
    setEditingReviewRating("5");
  };

  const handleSaveEditReview = async (reviewId) => {
    const numericReviewId = Number(reviewId);
    if (!Number.isFinite(numericReviewId) || !editingReviewText.trim()) return;
    try {
      setActiveReviewActionId(String(reviewId));
      setReviewError("");
      await tourismApi.updateReview(numericReviewId, {
        placeId: currentPlaceId,
        rating: Number(editingReviewRating),
        comment: editingReviewText.trim(),
      });
      const response = await tourismApi.getPlaceReviews(Number(currentPlaceId));
      const source = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
            ? response.data
            : [];
      setReviews(source.map(normalizeReview));
      handleCancelEditReview();
    } catch (error) {
      setReviewError(error?.message || "Unable to update review.");
    } finally {
      setActiveReviewActionId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const numericReviewId = Number(reviewId);
    if (!Number.isFinite(numericReviewId)) return;
    try {
      setActiveReviewActionId(String(reviewId));
      setReviewError("");
      await tourismApi.deleteReview(numericReviewId);
      setReviews((prev) => prev.filter((item) => Number(item.id) !== numericReviewId));
      if (editingReviewId === String(reviewId)) handleCancelEditReview();
    } catch (error) {
      setReviewError(error?.message || "Unable to delete review.");
    } finally {
      setActiveReviewActionId(null);
    }
  };

  // Build carousel images from the destination images
  let carouselImages = []
  if (placeDetails?.photos?.length > 0) {
      carouselImages = placeDetails.photos?.map((image, i) => ({
      id: i,
      src: resolveApiAssetUrl(image),
      alt: `${name} photo ${i + 1}`,
    }));
  }

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
            <img src={imgBackIcon} alt="back" className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: "#2B2D42" }}>
            {t("destination.details")}
          </h1>
          <div className="w-10" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto min-h-screen">
        {isLoading ? (
          <div className="animate-pulse">
            <DestinationSkeleton />
          </div>
        ) : (
          <>
        {/* ── Hero image ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full overflow-hidden mb-8"
          style={{ height: "420px", borderRadius: "0 0 24px 24px" }}
          >
          <img
            src={
              heroImage
                ? heroImage.replace("w=400&h=400", "w=1200&h=600")
                : "/placeholder-image.jpg"
            }            alt={name}
            className="w-full h-full object-contain"
            loading="eager"
            />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
          <h2 className={`absolute bottom-5 ${isRTL ? "right-8" : "left-8"} text-white font-bold text-3xl`}>{name}</h2>
        </motion.div>

        {/* ── Photos Ribbon ── */}
        {carouselImages.length > 0 ? (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 overflow-hidden"
          >
          <div className="px-8 mb-6">
            <h3 className="text-xl font-bold" style={{ color: "#2B2D42" }}>
              {t("destination.photos")}
            </h3>
          </div>

          <div className="relative flex overflow-hidden" dir="ltr">
            <motion.div
              className="flex gap-6 pr-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }}
              style={{ width: "fit-content" }}
              >
              {[...carouselImages, ...carouselImages].map((img, idx) => (
                <div
                key={idx}
                className="flex-shrink-0 overflow-hidden"
                style={{
                  width: "220px",
                  height: "280px",
                  borderRadius: "24px",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        ):(<div className="px-8 mb-6">
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B7280" }}>
              {t("destination.noPhotos")}
            </p>
          </div>
        )}
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
                onClick={() => navigate(`/tourist/pay?destId=${currentPlaceId}`)}
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
                className="w-12 h-12 flex items-center justify-center rounded-full text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                style={{ backgroundColor: "#d4800b", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.15)" }}
                aria-label={t("destination.call")}
                >
                <Phone size={20} />
              </button>
              <button
                type="button"
                onClick={handleOpenMap}
                disabled={!hasCoordinates}
                className="w-12 h-12 flex items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#d4800b", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.15)" }}
                aria-label={t("destination.viewLocation")}
                title={hasCoordinates ? t("destination.viewLocation") : (language === "ar" ? "الموقع غير متاح" : "Location unavailable")}
                >
                <MapPin size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="w-12 h-12 flex items-center justify-center rounded-full text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#d4800b", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.15)" }}
                aria-label={videoButtonLabel}
                title={videoButtonLabel}
                >
                <Play size={20} className="translate-x-[1px]" />
              </button>
              <button
                type="button"
                onClick={() => toggleBookmark(currentPlaceId)}
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
              {displayedReviews.map((comment) => {
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
                      <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-full" />
                      <span className="text-xs font-semibold" style={{ color: "#2B2D42" }}>{comment.user}</span>
                      {comment.verified && <BadgeCheck size={12} style={{ color: "#d4800b" }} />}
                    </div>
                    {editingReviewId === comment.id ? (
                      <div className="space-y-2">
                        <select
                          value={editingReviewRating}
                          onChange={(event) => setEditingReviewRating(event.target.value)}
                          className="px-2 py-1 rounded-md border border-[#d9c9b2] bg-white text-xs"
                          >
                          <option value="5">5 ⭐</option>
                          <option value="4">4 ⭐</option>
                          <option value="3">3 ⭐</option>
                          <option value="2">2 ⭐</option>
                          <option value="1">1 ⭐</option>
                        </select>
                        <textarea
                          value={editingReviewText}
                          onChange={(event) => setEditingReviewText(event.target.value)}
                          className="w-full min-h-[70px] p-2 rounded-md border border-[#d9c9b2] bg-white text-xs outline-none"
                          />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEditReview(comment.id)}
                            disabled={activeReviewActionId === comment.id || !editingReviewText.trim()}
                            className="px-3 py-1 rounded-md bg-[#d4800b] text-white text-xs font-semibold disabled:opacity-50"
                            >
                            {language === "ar" ? "حفظ" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditReview}
                            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-xs font-semibold"
                            >
                            {language === "ar" ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "#6B7280" }}>{comment.text}</p>
                        {comment.isApi && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditReview(comment)}
                              className="px-2 py-1 rounded-md bg-[#d4800b]/15 text-[#a35b08] text-xs font-semibold"
                              >
                              {language === "ar" ? "تعديل" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(comment.id)}
                              disabled={activeReviewActionId === comment.id}
                              className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold disabled:opacity-50"
                              >
                              {language === "ar" ? "حذف" : "Delete"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 rounded-2xl border border-[#d9c9b2] bg-[#f3e7d7]">
              <h4 className="text-sm font-bold mb-2" style={{ color: "#2B2D42" }}>
                {language === "ar" ? "أضف تقييمك" : "Add your review"}
              </h4>
              <div className="flex gap-2 mb-2">
                <select
                  value={reviewRating}
                  onChange={(event) => setReviewRating(event.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#d9c9b2] bg-white text-sm"
                  >
                  <option value="5">5 ⭐</option>
                  <option value="4">4 ⭐</option>
                  <option value="3">3 ⭐</option>
                  <option value="2">2 ⭐</option>
                  <option value="1">1 ⭐</option>
                </select>
              </div>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder={language === "ar" ? "اكتب تعليقك..." : "Write your comment..."}
                className="w-full min-h-[90px] p-3 rounded-lg border border-[#d9c9b2] bg-white text-sm outline-none"
                />
              {reviewError && (
                <p className="mt-2 text-xs text-red-600">{reviewError}</p>
              )}
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewText.trim()}
                className="mt-3 px-4 py-2 rounded-lg bg-[#d4800b] text-white text-sm font-semibold disabled:opacity-50"
                >
                {isSubmittingReview
                  ? (language === "ar" ? "جارٍ الإرسال..." : "Submitting...")
                  : (language === "ar" ? "إرسال التقييم" : "Submit review")}
              </button>
            </div>
          </motion.section>
        </div>

        <div className="h-10" />
        </>
        )}
      </main>
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden bg-black shadow-2xl relative">
        <button
        type="button"
        onClick={() => setIsVideoOpen(false)}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
        aria-label={t("common.close")}
        >
        <X size={18} />
        </button>
        <div className="aspect-video">
        <iframe
        src={`${destinationVideoUrl}`}
        title={`${name} video`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        />
        </div>
        </div>
        </div>
      )}
    </div>
  );
}
