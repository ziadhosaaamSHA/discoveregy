import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import { useAuth } from "../../../../context/AuthContext";
import { tourismApi } from "../../../../services/tourism-api";
import { fetchNationalities } from "../../../../services/auth-api";
import { resolveApiAssetUrl } from "../../../../services/api-client";
import { extractArray } from "../../../../shared/utils/api-shapes";
import { formatAmount } from "../../../../shared/utils/money";
import { COLORS, icons } from "../../../../features/admin/adminDashboardTokens";
import { ActionBtn, AdminSidebar, Badge, SearchBar, SectionHeader, Table, Td } from "../../../../features/admin/adminDashboardUi";

// === MAIN ADMIN CONSOLE ===
export default function AdminDashboard() {
  const { isRTL, language, t } = useLanguage();
  const { user, logout } = useAuth();

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Data states
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [pendingGuides, setPendingGuides] = useState([]);
  const [places, setPlaces] = useState([]);
  const [trips, setTrips] = useState([]);
  const [customTrips, setCustomTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Search terms
  const [searchGuide, setSearchGuide] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchPlace, setSearchPlace] = useState("");
  const [searchTrip, setSearchTrip] = useState("");
  const [searchBooking, setSearchBooking] = useState("");

  // Tab views
  const [guideTab, setGuideTab] = useState("pending"); // pending, active
  const [tripTab, setTripTab] = useState("ready"); // ready, custom

  // Modals & form states
  const [rejectGuideId, setRejectGuideId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [assignRoleUserId, setAssignRoleUserId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");

  const [placeModal, setPlaceModal] = useState(null); // 'add' or place object for edit
  const [placeForm, setPlaceForm] = useState({
    name: "", nameAr: "", description: "", descriptionAr: "",
    city: "", cityAr: "", latitude: "", longitude: "",
    averageVisitDuration: "02:00:00", ticketPrice: 0,
    openingTime: "08:00:00", closingTime: "18:00:00",
    categoryId: 1, mainImageFile: null
  });

  const [tripModal, setTripModal] = useState(false);
  const [tripForm, setTripForm] = useState({
    title: "", titleAr: "", description: "", descriptionAr: "",
    price: 0, startDateTime: "", endDateTime: "",
    guideId: "", companyId: 1, imageFile: null, selectedPlaces: []
  });

  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [refundModal, setRefundModal] = useState(null); // booking object
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const [selectedPlaceReviewsId, setSelectedPlaceReviewsId] = useState("");
  const [reviewsList, setReviewsList] = useState([]);

  const [nationalityModal, setNationalityModal] = useState(null); // 'add' or nationality object for edit
  const [nationalityForm, setNationalityForm] = useState({ name: "", nameAr: "" });

  const [roleModal, setRoleModal] = useState(false);
  const [roleFormName, setRoleFormName] = useState("");

  const [notifForm, setNotifForm] = useState({ title: "", content: "" });

  const tAdmin = t("admin");

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // --- API OPERATIONS ---
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [
        resUsers,
        resGuides,
        resPendGuides,
        resPlaces,
        resTrips,
        resCustTrips,
        resBookings,
        resNationalities,
        resRoles,
        resNotifs
      ] = await Promise.all([
        tourismApi.getUsers().then(extractArray),
        tourismApi.getAllGuides().then(extractArray),
        tourismApi.getPendingGuides().then(extractArray),
        tourismApi.getPlaces().then(extractArray),
        tourismApi.getTrips().then(extractArray),
        tourismApi.getAllCustomTrips().then(extractArray),
        tourismApi.getAllBookings().then(extractArray),
        fetchNationalities().then(extractArray),
        tourismApi.getRoles().then(extractArray),
        tourismApi.getNotifications().then(extractArray),
      ]);

      setUsers(resUsers);
      setGuides(resGuides);
      setPendingGuides(resPendGuides);
      setPlaces(resPlaces);
      setTrips(resTrips);
      setCustomTrips(resCustTrips);
      setBookings(resBookings);
      setNationalities(resNationalities);
      setRoles(resRoles);
      setNotifications(resNotifs);
    } catch (err) {
      setError(err?.message || tAdmin.messages.loadSystemFailed);
    } finally {
      setIsLoading(false);
    }
  }, [tAdmin.messages.loadSystemFailed]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAllData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAllData]);

  // Fetch reviews when a place is chosen
  useEffect(() => {
    if (!selectedPlaceReviewsId) {
      const timeoutId = window.setTimeout(() => {
        setReviewsList([]);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
    const loadReviews = async () => {
      try {
        const res = await tourismApi.getPlaceReviews(selectedPlaceReviewsId).then(extractArray);
        setReviewsList(res);
      } catch (err) {
        setError(err?.message || tAdmin.messages.loadReviewsFailed);
      }
    };
    loadReviews();
  }, [selectedPlaceReviewsId, tAdmin.messages.loadReviewsFailed]);

  // Handle Guide Approve
  const handleApproveGuide = async (id) => {
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.approveGuide(id);
      showSuccess(tAdmin.messages.approveGuideSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.approveGuideFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Guide Reject
  const handleRejectGuide = async () => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.rejectGuide(rejectGuideId, { reason: rejectionReason });
      showSuccess(tAdmin.messages.rejectGuideSuccess);
      setRejectGuideId(null);
      setRejectionReason("");
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.rejectGuideFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Guide Suspend
  const handleSuspendGuide = async (id) => {
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.suspendGuide(id);
      showSuccess(tAdmin.messages.suspendGuideSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.suspendGuideFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteUser)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteUserById(id);
      showSuccess(tAdmin.messages.deleteUserSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteUserFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Assign Role
  const handleAssignRole = async () => {
    if (!selectedRoleName) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.assignUserRole(assignRoleUserId, selectedRoleName);
      showSuccess(tAdmin.messages.assignRoleSuccess);
      setAssignRoleUserId(null);
      setSelectedRoleName("");
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.assignRoleFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Geoapify Import
  const handleGeoapifyImport = async () => {
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.importPlaces();
      showSuccess(tAdmin.places.importSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.places.importFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create/Update Place
  const handleSavePlace = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("Name", placeForm.name);
    formData.append("NameAr", placeForm.nameAr || placeForm.name);
    formData.append("Description", placeForm.description);
    formData.append("DescriptionAr", placeForm.descriptionAr || placeForm.description);
    formData.append("City", placeForm.city);
    formData.append("CityAr", placeForm.cityAr || placeForm.city);
    formData.append("Latitude", String(placeForm.latitude));
    formData.append("Longitude", String(placeForm.longitude));
    formData.append("TicketPrice", String(placeForm.ticketPrice));
    formData.append("CategoryId", String(placeForm.categoryId));
    formData.append("AverageVisitDuration", placeForm.averageVisitDuration);
    formData.append("OpeningTime", placeForm.openingTime);
    formData.append("ClosingTime", placeForm.closingTime);

    if (placeForm.mainImageFile) {
      formData.append("MainImage", placeForm.mainImageFile);
    }

    try {
      if (placeModal === "add") {
        await tourismApi.createPlace(formData);
        showSuccess(tAdmin.messages.placeAdded);
      } else {
        await tourismApi.updatePlace(placeModal.id, formData);
        showSuccess(tAdmin.messages.placeUpdated);
      }
      setPlaceModal(null);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.savePlaceFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Place
  const handleDeletePlace = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeletePlace)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deletePlace(id);
      showSuccess(tAdmin.messages.deletePlaceSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deletePlaceFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Trip
  const handleSaveTrip = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    // Prepare payload object for buildFormData in tourismApi.createTrip
    const payload = {
      Title: tripForm.title,
      TitleAr: tripForm.titleAr || tripForm.title,
      Description: tripForm.description,
      DescriptionAr: tripForm.descriptionAr || tripForm.description,
      Price: tripForm.price,
      StartDateTime: tripForm.startDateTime,
      EndDateTime: tripForm.endDateTime,
      GuideId: tripForm.guideId,
      CompanyId: tripForm.companyId,
      Image: tripForm.imageFile,
      PlaceIds: tripForm.selectedPlaces.map(Number)
    };

    try {
      await tourismApi.createTrip(payload);
      showSuccess(tAdmin.messages.tripCreated);
      setTripModal(false);
      setTripForm({
        title: "", titleAr: "", description: "", descriptionAr: "",
        price: 0, startDateTime: "", endDateTime: "",
        guideId: "", companyId: 1, imageFile: null, selectedPlaces: []
      });
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.createTripFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Trip
  const handleDeleteTrip = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteTrip)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteTrip(id);
      showSuccess(tAdmin.messages.deleteTripSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteTripFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Custom Trip
  const handleDeleteCustomTrip = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteCustomTrip)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteCustomTrip(id);
      showSuccess(tAdmin.messages.deleteCustomTripSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteCustomTripFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Confirm Booking
  const handleConfirmBooking = async (id) => {
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.confirmBooking(id);
      showSuccess(tAdmin.messages.confirmBookingSuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.confirmBookingFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.cancelBooking(cancelBookingId, { reason: cancelReason });
      showSuccess(tAdmin.messages.cancelBookingSuccess);
      setCancelBookingId(null);
      setCancelReason("");
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.cancelBookingFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Process Refund
  const handleProcessRefund = async () => {
    if (!refundReason.trim()) return;
    setActionLoading(true);
    setError("");

    const payload = {
      bookingId: Number(refundModal.id),
      reason: refundReason,
      amount: refundAmount ? Number(refundAmount) : null
    };

    try {
      await tourismApi.refundBooking(payload);
      showSuccess(tAdmin.payments.refundSuccess);
      setRefundModal(null);
      setRefundReason("");
      setRefundAmount("");
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.payments.refundFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteReview)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteReview(id);
      showSuccess(tAdmin.messages.deleteReviewSuccess);
      // Reload reviews for current place
      const res = await tourismApi.getPlaceReviews(selectedPlaceReviewsId).then(extractArray);
      setReviewsList(res);
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteReviewFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create/Update Nationality
  const handleSaveNationality = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      if (nationalityModal === "add") {
        await tourismApi.createNationality(nationalityForm);
        showSuccess(tAdmin.messages.nationalityAdded);
      } else {
        await tourismApi.updateNationality(nationalityModal.id, nationalityForm);
        showSuccess(tAdmin.messages.nationalityUpdated);
      }
      setNationalityModal(null);
      setNationalityForm({ name: "", nameAr: "" });
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.saveNationalityFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Nationality
  const handleDeleteNationality = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteNationality)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteNationality(id);
      showSuccess(tAdmin.messages.deleteNationalitySuccess);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteNationalityFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Role
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.createRole({ name: roleFormName });
      showSuccess(tAdmin.messages.roleAdded);
      setRoleModal(false);
      setRoleFormName("");
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.createRoleFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Role
  const handleDeleteRole = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteRole)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteRole(id);
      showSuccess(tAdmin.messages.roleDeleted);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteRoleFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create System Notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.content.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.createNotification(notifForm);
      showSuccess(tAdmin.messages.notificationSent);
      setNotifForm({ title: "", content: "" });
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.sendNotificationFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Notification
  const handleDeleteNotification = async (id) => {
    if (!window.confirm(tAdmin.messages.confirmDeleteNotification)) return;
    setActionLoading(true);
    setError("");
    try {
      await tourismApi.deleteNotification(id);
      showSuccess(tAdmin.messages.notificationRemoved);
      loadAllData();
    } catch (err) {
      setError(err?.message || tAdmin.messages.deleteNotificationFailed);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Place Modal
  const openEditPlace = (place) => {
    setPlaceForm({
      name: place.name || "",
      nameAr: place.nameAr || place.name || "",
      description: place.description || "",
      descriptionAr: place.descriptionAr || place.description || "",
      city: place.city || "",
      cityAr: place.cityAr || place.city || "",
      latitude: place.latitude || "",
      longitude: place.longitude || "",
      averageVisitDuration: place.averageVisitDuration || "02:00:00",
      ticketPrice: place.ticketPrice || 0,
      openingTime: place.openingTime || "08:00:00",
      closingTime: place.closingTime || "18:00:00",
      categoryId: place.categoryId || 1,
      mainImageFile: null
    });
    setPlaceModal(place);
  };

  // Open Edit Nationality Modal
  const openEditNationality = (nat) => {
    setNationalityForm({
      name: nat.name || "",
      nameAr: nat.nameAr || ""
    });
    setNationalityModal(nat);
  };

  // --- DERIVED METRICS FOR DASHBOARD ---
  const stats = useMemo(() => {
    const revenueSum = bookings
      .filter(b => b.paymentStatus?.toLowerCase().includes("paid") || b.status?.toLowerCase().includes("paid") || b.status?.toLowerCase().includes("confirm"))
      .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    return {
      users: users.length,
      guides: guides.length,
      pendingGuides: pendingGuides.length,
      places: places.length,
      trips: trips.length,
      customTrips: customTrips.length,
      bookings: bookings.length,
      revenue: revenueSum
    };
  }, [users, guides, pendingGuides, places, trips, customTrips, bookings]);

  // --- FILTERS ---
  const filteredGuides = guides.filter(g =>
    (g.fullName || g.name || g.email || "").toLowerCase().includes(searchGuide.toLowerCase())
  );

  const filteredPendingGuides = pendingGuides.filter(g =>
    (g.fullName || g.name || g.email || "").toLowerCase().includes(searchGuide.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.fullName || u.name || "").toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredPlaces = places.filter(p =>
    (p.name || "").toLowerCase().includes(searchPlace.toLowerCase()) ||
    (p.city || "").toLowerCase().includes(searchPlace.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    (b.touristName || b.touristEmail || "").toLowerCase().includes(searchBooking.toLowerCase()) ||
    (b.planName || "").toLowerCase().includes(searchBooking.toLowerCase())
  );

  const filteredTrips = trips.filter(t =>
    (t.title || "").toLowerCase().includes(searchTrip.toLowerCase())
  );

  // Paid bookings for Payments listing
  const paidBookings = bookings.filter(b =>
    b.paymentStatus?.toLowerCase().includes("paid") || b.status?.toLowerCase().includes("paid")
  );

  // Nav configuration
  const navItems = [
    { id: "dashboard", label: tAdmin.sidebar.dashboard, icon: icons.dashboard },
    { id: "guides", label: tAdmin.sidebar.guides, icon: icons.guides, badge: stats.pendingGuides },
    { id: "users", label: tAdmin.sidebar.users, icon: icons.users },
    { id: "places", label: tAdmin.sidebar.places, icon: icons.places },
    { id: "trips", label: tAdmin.sidebar.trips, icon: icons.trips },
    { id: "bookings", label: tAdmin.sidebar.bookings, icon: icons.bookings },
    { id: "payments", label: tAdmin.sidebar.payments, icon: icons.payments },
    { id: "reviews", label: tAdmin.sidebar.reviews, icon: icons.reviews },
    { id: "nationalities", label: tAdmin.sidebar.nationalities, icon: icons.nationalities },
    { id: "roles", label: tAdmin.sidebar.roles, icon: icons.roles },
    { id: "notifications", label: tAdmin.sidebar.notifications, icon: icons.notifications },
  ];

  // --- SUB-PAGES RENDER ---

  // 1. Dashboard View
  const renderDashboard = () => (
    <div>
      <div className="mb-8">
        <h1
          className="m-0 text-3xl font-black text-[#f5ecd7] tracking-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {tAdmin.dashboard.welcome}
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#9a8468]">{tAdmin.dashboard.subtitle}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-8 mb-8">
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.users}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.guides}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.activeGuides}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.pendingGuides}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.pendingGuides}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.places}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.places}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.trips}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.readyTrips}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.customTrips}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.customTrips}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px]">
          <p className="text-2xl font-black">{stats.bookings}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.bookings}</p>
        </div>
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-5 text-[#f5ecd7] shadow-xl flex flex-col justify-between min-h-[110px] border-l-[#c8860a] border-l-2">
          <p className="text-2xl font-black text-[#e8a830]">{formatAmount(stats.revenue, language)}</p>
          <p className="text-xs font-bold text-[#b79a72] mt-1">{tAdmin.dashboard.revenue}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending guides segment */}
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5 border-b border-[#3d2e1e]/60 pb-3">
            <span className="text-2xl">{icons.guides}</span>
            <div>
              <h3 className="text-lg font-black text-[#f5ecd7] m-0">{tAdmin.dashboard.pendingApprovals}</h3>
              <p className="text-xs text-[#9a8468] font-bold mt-0.5">
                {tAdmin.dashboard.waitingReview.replace("{{count}}", String(stats.pendingGuides))}
              </p>
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {pendingGuides.slice(0, 5).map(g => (
              <div key={g.userId || g.id} className="flex justify-between items-center bg-[#2e2318]/50 p-4 rounded-xl border border-[#3d2e1e]/40">
                <div>
                  <h4 className="font-bold text-[#f5ecd7] text-sm m-0">{g.fullName || g.name || g.email}</h4>
                  <p className="text-xs text-[#9a8468] mt-1 font-semibold">{g.email}</p>
                  <p className="text-[11px] text-[#6b5a45] mt-0.5 font-bold">{tAdmin.guides.licenseNumber.replace("{{number}}", g.licenseNumber || tAdmin.common.notAvailable)}</p>
                </div>
                <div className="flex gap-2">
                  <ActionBtn label={icons.approve} color={COLORS.success} onClick={() => handleApproveGuide(g.userId || g.id)} small />
                  <ActionBtn label={icons.reject} color={COLORS.danger} onClick={() => setRejectGuideId(g.userId || g.id)} small />
                </div>
              </div>
            ))}
            {pendingGuides.length === 0 && (
              <p className="text-center font-bold py-12 text-sm text-[#9a8468]">{tAdmin.dashboard.noPending}</p>
            )}
          </div>
        </div>

        {/* Recent Bookings segment */}
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5 border-b border-[#3d2e1e]/60 pb-3">
            <span className="text-2xl">{icons.bookings}</span>
            <h3 className="text-lg font-black text-[#f5ecd7] m-0">{tAdmin.dashboard.recentBookings}</h3>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex justify-between items-center bg-[#2e2318]/50 p-4 rounded-xl border border-[#3d2e1e]/40">
                <div>
                  <h4 className="font-bold text-[#f5ecd7] text-sm m-0">{b.planName || `#${b.planId}`}</h4>
                  <p className="text-xs text-[#9a8468] mt-1 font-semibold">
                    {tAdmin.bookings.tourist}: {b.touristName || b.touristEmail}
                  </p>
                  <p className="text-xs text-[#6b5a45] mt-0.5 font-bold">
                    {tAdmin.bookings.guide}: {b.guideName || tAdmin.dashboard.unassigned}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#e8a830] text-sm mb-1">{formatAmount(b.amount, language)}</p>
                  <Badge status={b.paymentStatus || b.status} />
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-center font-bold py-12 text-sm text-[#9a8468]">{tAdmin.dashboard.noBookings}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Guide Approvals Page
  const renderGuides = () => {
    const list = guideTab === "pending" ? filteredPendingGuides : filteredGuides;
    return (
      <div>
        <SectionHeader title={tAdmin.guides.title} />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setGuideTab("pending")}
              className="rounded-lg px-4 py-2 text-xs font-black transition duration-200"
              style={{
                background: guideTab === "pending" ? COLORS.primary : COLORS.surface,
                color: guideTab === "pending" ? "#fff" : COLORS.textMuted,
                border: `1px solid ${guideTab === "pending" ? COLORS.primary : COLORS.border}`,
              }}
            >
              {tAdmin.guides.pending} ({pendingGuides.length})
            </button>
            <button
              onClick={() => setGuideTab("active")}
              className="rounded-lg px-4 py-2 text-xs font-black transition duration-200"
              style={{
                background: guideTab === "active" ? COLORS.primary : COLORS.surface,
                color: guideTab === "active" ? "#fff" : COLORS.textMuted,
                border: `1px solid ${guideTab === "active" ? COLORS.primary : COLORS.border}`,
              }}
            >
              {tAdmin.guides.active} ({guides.length})
            </button>
          </div>
          <div className="w-full md:w-auto md:min-w-[300px]">
            <SearchBar placeholder={tAdmin.guides.searchPlaceholder} value={searchGuide} onChange={setSearchGuide} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map(g => (
            <div key={g.userId || g.id} className="bg-[#231c15] p-5 rounded-2xl border border-[#3d2e1e] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#c8860a]/20 flex items-center justify-center font-bold text-lg text-[#e8a830] border border-[#c8860a]/40">
                    {(g.fullName || g.name || g.email || "G")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#f5ecd7] m-0">{g.fullName || g.name}</h3>
                    <p className="text-xs text-[#9a8468] font-semibold mt-0.5">{g.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5 bg-[#2e2318]/40 p-3 rounded-xl border border-[#3d2e1e]/30 mb-4">
                  <p className="text-xs text-[#9a8468] font-bold">
                    {tAdmin.guides.phone}: <span className="text-[#f5ecd7]">{g.phoneNumber || tAdmin.common.notAvailable}</span>
                  </p>
                  <p className="text-xs text-[#9a8468] font-bold">
                    {tAdmin.guides.license}: <span className="text-[#f5ecd7]">{g.licenseNumber || tAdmin.common.notAvailable}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[#3d2e1e]/40">
                {g.licenseImageUrl && (
                  <a
                    href={resolveApiAssetUrl(g.licenseImageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#e8a830] border border-[#e8a830]/40 bg-[#e8a830]/10 hover:bg-[#e8a830] hover:text-[#1a1410] transition duration-150"
                  >
                    {tAdmin.guides.viewLicense}
                  </a>
                )}
                {guideTab === "pending" ? (
                  <>
                    <ActionBtn label={tAdmin.guides.approve} color={COLORS.success} onClick={() => handleApproveGuide(g.userId || g.id)} />
                    <ActionBtn label={tAdmin.guides.reject} color={COLORS.danger} onClick={() => setRejectGuideId(g.userId || g.id)} />
                  </>
                ) : (
                  <ActionBtn label={tAdmin.guides.suspend} color={COLORS.danger} onClick={() => handleSuspendGuide(g.userId || g.id)} />
                )}
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="col-span-2 py-12 text-center text-sm font-semibold text-[#9a8468]">
              {guideTab === "pending" ? tAdmin.guides.noPendingGuides : tAdmin.guides.noGuidesToShow}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 3. Users Management Page
  const renderUsers = () => (
    <div>
      <SectionHeader title={tAdmin.users.title} />

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <SearchBar placeholder={tAdmin.users.searchPlaceholder} value={searchUser} onChange={setSearchUser} />
      </div>

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.users.user, tAdmin.users.role, tAdmin.users.joined, tAdmin.users.actions]}
        data={filteredUsers}
        renderRow={(u) => [
          <Td key="user">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#c8860a]/20 flex items-center justify-center font-bold text-sm text-[#e8a830]">
                {(u.fullName || u.name || u.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[#f5ecd7] text-sm m-0">{u.fullName || u.name}</p>
                <p className="text-xs text-[#9a8468] mt-0.5">{u.email}</p>
              </div>
            </div>
          </Td>,
          <Td key="role">
            <span className="font-bold text-[#e8a830] text-xs uppercase tracking-wide">
              {u.role || u.userRole || tAdmin.rolesOptions.tourist}
            </span>
          </Td>,
          <Td key="joined" muted>
            {u.birthDate ? new Date(u.birthDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : tAdmin.common.notAvailable}
          </Td>,
          <Td key="actions">
            <div className="flex gap-2">
              <ActionBtn
                label={tAdmin.users.assignRole}
                color={COLORS.info}
                onClick={() => {
                  setAssignRoleUserId(u.id);
                  setSelectedRoleName(u.role || "Tourist");
                }}
                small
              />
              <ActionBtn
                label={tAdmin.users.delete}
                color={COLORS.danger}
                onClick={() => handleDeleteUser(u.id)}
                small
              />
            </div>
          </Td>,
        ]}
      />
    </div>
  );

  // 4. Places Management Page
  const renderPlaces = () => (
    <div>
      <SectionHeader
        title={tAdmin.places.title}
        action={
          <div className="flex gap-2">
            <button
              onClick={handleGeoapifyImport}
              disabled={actionLoading}
              className="rounded-lg px-4 py-2 text-xs font-black border border-[#2980b9]/40 bg-[#2980b9]/15 text-[#2980b9] hover:bg-[#2980b9] hover:text-white transition duration-150 disabled:opacity-50"
            >
              {actionLoading ? tAdmin.places.importing : tAdmin.places.importGeoapify}
            </button>
            <button
              onClick={() => {
                setPlaceForm({
                  name: "", nameAr: "", description: "", descriptionAr: "",
                  city: "", cityAr: "", latitude: "", longitude: "",
                  averageVisitDuration: "02:00:00", ticketPrice: 0,
                  openingTime: "08:00:00", closingTime: "18:00:00",
                  categoryId: 1, mainImageFile: null
                });
                setPlaceModal("add");
              }}
              className="rounded-lg px-4 py-2 text-xs font-black border border-[#c8860a] bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150"
            >
              {tAdmin.places.addPlace}
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <SearchBar placeholder={tAdmin.places.searchPlaceholder} value={searchPlace} onChange={setSearchPlace} />
      </div>

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.places.place, tAdmin.places.city, tAdmin.places.price, tAdmin.places.actions]}
        data={filteredPlaces}
        renderRow={(p) => [
          <Td key="place">
            <div className="flex items-center gap-3">
              {p.imageUrl && (
                <img
                  src={resolveApiAssetUrl(p.imageUrl)}
                  alt={p.name}
                  className="w-12 h-10 object-cover rounded-md border border-[#3d2e1e]"
                />
              )}
              <div>
                <p className="font-bold text-[#f5ecd7] text-sm m-0">
                  {language === "ar" ? (p.nameAr || p.name) : p.name}
                </p>
                <p className="text-xs text-[#9a8468] mt-0.5">ID: {p.id}</p>
              </div>
            </div>
          </Td>,
          <Td key="city" muted>
            {language === "ar" ? (p.cityAr || p.city) : p.city}
          </Td>,
          <Td key="price">
            {p.ticketPrice === 0 ? (
              <span className="text-[#27ae60] font-bold">{tAdmin.places.free}</span>
            ) : (
              <span className="font-bold text-[#e8a830]">{formatAmount(p.ticketPrice, language)}</span>
            )}
          </Td>,
          <Td key="actions">
            <div className="flex gap-2">
              <ActionBtn label={tAdmin.places.edit} color={COLORS.warning} onClick={() => openEditPlace(p)} small />
              <ActionBtn label={tAdmin.places.delete} color={COLORS.danger} onClick={() => handleDeletePlace(p.id)} small />
            </div>
          </Td>,
        ]}
      />
    </div>
  );

  // 5. Trips Management Page
  const renderTrips = () => {
    return (
      <div>
        <SectionHeader
          title={tAdmin.trips.title}
          action={
            <button
              onClick={() => {
                setTripForm({
                  title: "", titleAr: "", description: "", descriptionAr: "",
                  price: 0, startDateTime: "", endDateTime: "",
                  guideId: "", companyId: 1, imageFile: null, selectedPlaces: []
                });
                setTripModal(true);
              }}
              className="rounded-lg px-4 py-2 text-xs font-black border border-[#c8860a] bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150"
            >
              {tAdmin.trips.addTrip}
            </button>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setTripTab("ready")}
              className="rounded-lg px-4 py-2 text-xs font-black transition duration-200"
              style={{
                background: tripTab === "ready" ? COLORS.primary : COLORS.surface,
                color: tripTab === "ready" ? "#fff" : COLORS.textMuted,
                border: `1px solid ${tripTab === "ready" ? COLORS.primary : COLORS.border}`,
              }}
            >
              {tAdmin.trips.readyTrips} ({trips.length})
            </button>
            <button
              onClick={() => setTripTab("custom")}
              className="rounded-lg px-4 py-2 text-xs font-black transition duration-200"
              style={{
                background: tripTab === "custom" ? COLORS.primary : COLORS.surface,
                color: tripTab === "custom" ? "#fff" : COLORS.textMuted,
                border: `1px solid ${tripTab === "custom" ? COLORS.primary : COLORS.border}`,
              }}
            >
              {tAdmin.trips.customTrips} ({customTrips.length})
            </button>
          </div>
          <div className="w-full md:w-auto md:min-w-[300px]">
            <SearchBar placeholder={tAdmin.trips.searchPlaceholder} value={searchTrip} onChange={setSearchTrip} />
          </div>
        </div>

        {tripTab === "ready" ? (
          <Table
        emptyLabel={tAdmin.common.noRecords}
            columns={[tAdmin.trips.trip, tAdmin.trips.price, tAdmin.trips.duration, tAdmin.trips.actions]}
            data={filteredTrips}
            renderRow={(t) => [
              <Td key="trip">
                <div className="flex items-center gap-3">
                  {t.imageUrl && (
                    <img
                      src={resolveApiAssetUrl(t.imageUrl)}
                      alt={t.title}
                      className="w-12 h-10 object-cover rounded-md border border-[#3d2e1e]"
                    />
                  )}
                  <div>
                    <p className="font-bold text-[#f5ecd7] text-sm m-0">
                      {language === "ar" ? (t.titleAr || t.title) : t.title}
                    </p>
                    <p className="text-xs text-[#9a8468] mt-0.5">ID: {t.id}</p>
                  </div>
                </div>
              </Td>,
              <Td key="price">
                <span className="font-bold text-[#e8a830]">{formatAmount(t.price, language)}</span>
              </Td>,
              <Td key="dates" muted>
                {t.startDateTime ? new Date(t.startDateTime).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : ""}
              </Td>,
              <Td key="actions">
                <ActionBtn label={tAdmin.trips.delete} color={COLORS.danger} onClick={() => handleDeleteTrip(t.id)} small />
              </Td>,
            ]}
          />
        ) : (
          <Table
        emptyLabel={tAdmin.common.noRecords}
            columns={[tAdmin.trips.trip, tAdmin.bookings.tourist, tAdmin.trips.actions]}
            data={customTrips}
            renderRow={(ct) => [
              <Td key="trip">
                <div>
                  <p className="font-bold text-[#f5ecd7] text-sm m-0">
                    {language === "ar" ? (ct.titleAr || ct.title) : ct.title}
                  </p>
                  <p className="text-xs text-[#9a8468] mt-0.5">{tAdmin.trips.destination}: {ct.destination}</p>
                </div>
              </Td>,
              <Td key="tourist" muted>
                {ct.touristName || ct.touristEmail || tAdmin.rolesOptions.tourist}
              </Td>,
              <Td key="actions">
                <ActionBtn label={tAdmin.trips.delete} color={COLORS.danger} onClick={() => handleDeleteCustomTrip(ct.id)} small />
              </Td>,
            ]}
          />
        )}
      </div>
    );
  };

  // 6. Bookings Page
  const renderBookings = () => (
    <div>
      <SectionHeader title={tAdmin.bookings.title} />

      <div className="mb-4">
        <SearchBar placeholder={tAdmin.bookings.searchPlaceholder} value={searchBooking} onChange={setSearchBooking} />
      </div>

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.bookings.id, tAdmin.bookings.tourist, tAdmin.bookings.trip, tAdmin.bookings.amount, tAdmin.bookings.status, tAdmin.bookings.actions]}
        data={filteredBookings}
        renderRow={(b) => [
          <Td key="id" muted>#{b.id}</Td>,
          <Td key="tourist">
            <div>
              <p className="font-bold text-[#f5ecd7] text-sm m-0">{b.touristName || b.touristEmail}</p>
              <p className="text-xs text-[#9a8468] mt-0.5">{b.touristEmail}</p>
            </div>
          </Td>,
          <Td key="trip" muted>{b.planName || `#${b.planId}`}</Td>,
          <Td key="amt">
            <span className="font-bold text-[#e8a830]">{formatAmount(b.amount, language)}</span>
          </Td>,
          <Td key="status">
            <Badge status={b.paymentStatus || b.status} />
          </Td>,
          <Td key="actions">
            <div className="flex gap-2">
              {(b.status === "Pending" || b.paymentStatus === "Pending") && (
                <ActionBtn label={tAdmin.bookings.confirm} color={COLORS.success} onClick={() => handleConfirmBooking(b.id)} small />
              )}
              {b.status !== "Cancelled" && (
                <ActionBtn label={tAdmin.bookings.cancel} color={COLORS.danger} onClick={() => setCancelBookingId(b.id)} small />
              )}
            </div>
          </Td>,
        ]}
      />
    </div>
  );

  // 7. Payments Page
  const renderPayments = () => (
    <div>
      <SectionHeader title={tAdmin.payments.title} />

      <div className="mb-4">
        <SearchBar placeholder={tAdmin.payments.searchPlaceholder} value={searchBooking} onChange={setSearchBooking} />
      </div>

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.payments.bookingId, tAdmin.payments.tourist, tAdmin.payments.amount, tAdmin.payments.status, tAdmin.payments.actions]}
        data={paidBookings}
        renderRow={(p) => [
          <Td key="bookingId" muted>#{p.id}</Td>,
          <Td key="tourist">
            <div>
              <p className="font-bold text-[#f5ecd7] text-sm m-0">{p.touristName || p.touristEmail}</p>
            </div>
          </Td>,
          <Td key="amount">
            <span className="font-bold text-[#e8a830]">{formatAmount(p.amount, language)}</span>
          </Td>,
          <Td key="status">
            <Badge status={p.paymentStatus || p.status} />
          </Td>,
          <Td key="actions">
            <ActionBtn label={tAdmin.payments.refund} color={COLORS.warning} onClick={() => setRefundModal(p)} small />
          </Td>,
        ]}
      />
    </div>
  );

  // 8. Reviews Page
  const renderReviews = () => (
    <div>
      <SectionHeader title={tAdmin.reviews.title} />

      <div className="mb-6 bg-[#231c15] p-5 rounded-xl border border-[#3d2e1e] flex flex-col gap-3">
        <label className="text-sm font-bold text-[#f5ecd7]">{tAdmin.reviews.selectPlace}</label>
        <select
          value={selectedPlaceReviewsId}
          onChange={(e) => setSelectedPlaceReviewsId(e.target.value)}
          className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
        >
          <option value="">{tAdmin.reviews.allPlaces}</option>
          {places.map(p => (
            <option key={p.id} value={p.id}>
              {language === "ar" ? (p.nameAr || p.name) : p.name}
            </option>
          ))}
        </select>
      </div>

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.reviews.id, tAdmin.reviews.rating, tAdmin.reviews.comment, tAdmin.reviews.actions]}
        data={reviewsList}
        renderRow={(r) => [
          <Td key="id" muted>#{r.id}</Td>,
          <Td key="rating">
            <span className="text-[#f1c40f] font-black">★ {r.rating}</span>
          </Td>,
          <Td key="comment">
            <p className="max-w-[400px] whitespace-normal truncate text-xs text-[#f5ecd7] m-0">{r.comment}</p>
          </Td>,
          <Td key="actions">
            <ActionBtn label={tAdmin.reviews.delete} color={COLORS.danger} onClick={() => handleDeleteReview(r.id)} small />
          </Td>,
        ]}
      />
    </div>
  );

  // 9. Nationalities Page
  const renderNationalities = () => (
    <div>
      <SectionHeader
        title={tAdmin.nationalities.title}
        action={
          <button
            onClick={() => {
              setNationalityForm({ name: "", nameAr: "" });
              setNationalityModal("add");
            }}
            className="rounded-lg px-4 py-2 text-xs font-black border border-[#c8860a] bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150"
          >
            {tAdmin.nationalities.addNationality}
          </button>
        }
      />

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.reviews.id, tAdmin.nationalities.nameEn, tAdmin.nationalities.nameAr, tAdmin.nationalities.actions]}
        data={nationalities}
        renderRow={(n) => [
          <Td key="id" muted>{n.id}</Td>,
          <Td key="nameEn"><span className="font-bold">{n.name}</span></Td>,
          <Td key="nameAr"><span className="font-bold">{n.nameAr || n.name}</span></Td>,
          <Td key="actions">
            <div className="flex gap-2">
              <ActionBtn label={tAdmin.nationalities.edit} color={COLORS.warning} onClick={() => openEditNationality(n)} small />
              <ActionBtn label={tAdmin.nationalities.delete} color={COLORS.danger} onClick={() => handleDeleteNationality(n.id)} small />
            </div>
          </Td>,
        ]}
      />
    </div>
  );

  // 10. Roles Page
  const renderRoles = () => (
    <div>
      <SectionHeader
        title={tAdmin.roles.title}
        action={
          <button
            onClick={() => {
              setRoleFormName("");
              setRoleModal(true);
            }}
            className="rounded-lg px-4 py-2 text-xs font-black border border-[#c8860a] bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150"
          >
            {tAdmin.roles.addRole}
          </button>
        }
      />

      <Table
        emptyLabel={tAdmin.common.noRecords}
        columns={[tAdmin.reviews.id, tAdmin.roles.name, tAdmin.roles.actions]}
        data={roles}
        renderRow={(r) => [
          <Td key="id" muted>{r.id || tAdmin.common.notAvailable}</Td>,
          <Td key="name"><span className="font-bold text-[#e8a830] text-sm uppercase">{r.name}</span></Td>,
          <Td key="actions">
            <ActionBtn label={tAdmin.roles.delete} color={COLORS.danger} onClick={() => handleDeleteRole(r.id || r.name)} small />
          </Td>,
        ]}
      />
    </div>
  );

  // 11. Notifications Page
  const renderNotifications = () => (
    <div>
      <SectionHeader title={tAdmin.notifications.title} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Broadcast input form */}
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-6 shadow-xl">
          <h3 className="text-lg font-black text-[#f5ecd7] mb-4 border-b border-[#3d2e1e]/60 pb-2">
            {tAdmin.notifications.sendNotification}
          </h3>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#9a8468]">{tAdmin.notifications.notifTitle}</label>
              <input
                value={notifForm.title}
                onChange={e => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Title..."
                required
                className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#9a8468]">{tAdmin.notifications.content}</label>
              <textarea
                value={notifForm.content}
                onChange={e => setNotifForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write broadcast message details..."
                required
                rows={4}
                className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full rounded-xl bg-[#c8860a] border border-[#c8860a] p-3 text-white text-xs font-bold uppercase hover:bg-[#e8a830] transition duration-150 disabled:opacity-50"
            >
              {actionLoading ? tAdmin.notifications.sending : tAdmin.notifications.send}
            </button>
          </form>
        </div>

        {/* Existing announcements lists */}
        <div className="rounded-2xl border border-[#3d2e1e] bg-[#231c15] p-6 shadow-xl">
          <h3 className="text-lg font-black text-[#f5ecd7] mb-4 border-b border-[#3d2e1e]/60 pb-2">
            {tAdmin.notifications.sentBroadcasts}
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {notifications.map(n => (
              <div key={n.id} className="bg-[#2e2318]/50 p-4 rounded-xl border border-[#3d2e1e]/40 flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold text-[#f5ecd7] text-sm m-0">{n.title}</h4>
                  <p className="text-xs text-[#9a8468] mt-1 whitespace-normal leading-relaxed">{n.content}</p>
                </div>
                <ActionBtn label={tAdmin.notifications.delete} color={COLORS.danger} onClick={() => handleDeleteNotification(n.id)} small />
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-center font-bold py-12 text-sm text-[#9a8468]">{tAdmin.notifications.noNotifications}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivePage = () => {
    switch (page) {
      case "dashboard": return renderDashboard();
      case "guides": return renderGuides();
      case "users": return renderUsers();
      case "places": return renderPlaces();
      case "trips": return renderTrips();
      case "bookings": return renderBookings();
      case "payments": return renderPayments();
      case "reviews": return renderReviews();
      case "nationalities": return renderNationalities();
      case "roles": return renderRoles();
      case "notifications": return renderNotifications();
      default: return renderDashboard();
    }
  };

  return (
    <div
      className="min-h-screen bg-[#1a1410] text-[#f5ecd7]"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #6B5A45; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1A1410; }
        ::-webkit-scrollbar-thumb { background: #3D2E1E; border-radius: 3px; }
      `}</style>

      <div className="flex flex-row rtl:flex-row-reverse">
        {/* Desktop Sidebar Panel */}
        <div className="hidden md:block shrink-0 w-60 h-screen sticky top-0">
          <AdminSidebar
            isRTL={isRTL}
            tAdmin={tAdmin}
            navItems={navItems}
            page={page}
            setPage={setPage}
            setSidebarOpen={setSidebarOpen}
            user={user}
            logout={logout}
          />
        </div>

        {/* Mobile slide drawer overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[99] bg-black/60 flex"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-[#231c15] animate-slide-in"
            >
              <AdminSidebar
                mobile
                isRTL={isRTL}
                tAdmin={tAdmin}
                navItems={navItems}
                page={page}
                setPage={setPage}
                setSidebarOpen={setSidebarOpen}
                user={user}
                logout={logout}
              />
            </div>
          </div>
        )}

        {/* Main Panel Content container */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile responsive toolbar header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-[#231c15] border-b border-[#3d2e1e] sticky top-0 z-[90]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-[#2e2318] border border-[#3d2e1e] rounded-lg py-1.5 px-3 text-lg text-[#f5ecd7] cursor-pointer"
            >
              {icons.menu}
            </button>
            <h1
              className="text-base font-black text-[#c8860a] m-0"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {tAdmin.sidebar.title}
            </h1>
            <div className="w-10" />
          </div>

          {/* Core Page content wrapper */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-bold text-emerald-200">
                {successMsg}
              </div>
            )}

            {isLoading ? (
              <div className="py-24 text-center">
                <RefreshCw className="animate-spin text-[#c8860a] mx-auto mb-4" size={40} />
                <p className="text-sm text-[#9a8468] font-bold">{tAdmin.common.loading}</p>
              </div>
            ) : (
              renderActivePage()
            )}
          </main>
        </div>
      </div>

      {/* ========================================================
          MODALS BLOCK
         ======================================================== */}

      {/* A. Rejection Guide Modal */}
      {rejectGuideId && (
        <div
          onClick={() => setRejectGuideId(null)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-2">{tAdmin.guides.rejectReasonTitle}</h3>
            <p className="text-xs text-[#9a8468] font-bold mb-4">{tAdmin.guides.rejectReasonDesc}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={tAdmin.guides.reasonPlaceholder}
              rows={4}
              required
              className="w-full rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
            />
            <div className="flex justify-end gap-3 mt-5">
              <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setRejectGuideId(null)} />
              <ActionBtn label={tAdmin.guides.confirmReject} color={COLORS.danger} onClick={handleRejectGuide} disabled={actionLoading} />
            </div>
          </div>
        </div>
      )}

      {/* B. Role Assign Modal */}
      {assignRoleUserId && (
        <div
          onClick={() => setAssignRoleUserId(null)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-2">{tAdmin.users.assignRole}</h3>
            <p className="text-xs text-[#9a8468] font-bold mb-4">{tAdmin.users.selectRole}</p>

            <select
              value={selectedRoleName}
              onChange={(e) => setSelectedRoleName(e.target.value)}
              className="w-full rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
            >
              <option value="">-- Choose Role --</option>
              <option value="Tourist">{tAdmin.rolesOptions.tourist}</option>
              <option value="Guide">{tAdmin.rolesOptions.guide}</option>
              <option value="Admin">{tAdmin.rolesOptions.admin}</option>
            </select>

            <div className="flex justify-end gap-3 mt-5">
              <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setAssignRoleUserId(null)} />
              <ActionBtn label={tAdmin.users.assignRole} color={COLORS.primary} onClick={handleAssignRole} disabled={actionLoading} />
            </div>
          </div>
        </div>
      )}

      {/* C. Places ADD/EDIT Modal */}
      {placeModal && (
        <div
          onClick={() => setPlaceModal(null)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-xl shadow-2xl my-8"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-4">
              {placeModal === "add" ? tAdmin.places.addPlace : tAdmin.places.editPlace}
            </h3>
            <form onSubmit={handleSavePlace} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.nameEn}</label>
                  <input
                    value={placeForm.name}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.nameAr}</label>
                  <input
                    value={placeForm.nameAr}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, nameAr: e.target.value }))}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.cityEn}</label>
                  <input
                    value={placeForm.city}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, city: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.cityAr}</label>
                  <input
                    value={placeForm.cityAr}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, cityAr: e.target.value }))}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.descEn}</label>
                  <textarea
                    value={placeForm.description}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={2}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.descAr}</label>
                  <textarea
                    value={placeForm.descriptionAr}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                    rows={2}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.latitude}</label>
                  <input
                    type="number"
                    step="any"
                    value={placeForm.latitude}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, latitude: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.longitude}</label>
                  <input
                    type="number"
                    step="any"
                    value={placeForm.longitude}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, longitude: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.ticketPrice}</label>
                  <input
                    type="number"
                    value={placeForm.ticketPrice}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, ticketPrice: e.target.value }))}
                    required
                    min={0}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.categoryLabel}</label>
                  <input
                    type="number"
                    value={placeForm.categoryId}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.durationSpan}</label>
                  <input
                    value={placeForm.averageVisitDuration}
                    onChange={(e) => setPlaceForm(prev => ({ ...prev, averageVisitDuration: e.target.value }))}
                    required
                    placeholder="02:00:00"
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.openingClosingHours}</label>
                  <div className="flex gap-1">
                    <input
                      value={placeForm.openingTime}
                      onChange={(e) => setPlaceForm(prev => ({ ...prev, openingTime: e.target.value }))}
                      required
                      placeholder="08:00:00"
                      className="w-1/2 rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-xs outline-none transition focus:border-[#c8860a]"
                    />
                    <input
                      value={placeForm.closingTime}
                      onChange={(e) => setPlaceForm(prev => ({ ...prev, closingTime: e.target.value }))}
                      required
                      placeholder="18:00:00"
                      className="w-1/2 rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-xs outline-none transition focus:border-[#c8860a]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.places.mainImage}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPlaceForm(prev => ({ ...prev, mainImageFile: e.target.files[0] }))}
                  className="w-full text-xs text-[#9a8468] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#c8860a] file:text-white hover:file:bg-[#e8a830] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#3d2e1e]/60">
                <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setPlaceModal(null)} />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg px-4 py-2 text-xs font-black bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150 disabled:opacity-50"
                >
                  {actionLoading ? tAdmin.places.saving : tAdmin.places.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. Trip ADD Modal */}
      {tripModal && (
        <div
          onClick={() => setTripModal(false)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-xl shadow-2xl my-8"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-4">{tAdmin.trips.addTrip}</h3>
            <form onSubmit={handleSaveTrip} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.titleEn}</label>
                  <input
                    value={tripForm.title}
                    onChange={(e) => setTripForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.titleAr}</label>
                  <input
                    value={tripForm.titleAr}
                    onChange={(e) => setTripForm(prev => ({ ...prev, titleAr: e.target.value }))}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.descEn}</label>
                  <textarea
                    value={tripForm.description}
                    onChange={(e) => setTripForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={2}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.descAr}</label>
                  <textarea
                    value={tripForm.descriptionAr}
                    onChange={(e) => setTripForm(prev => ({ ...prev, descriptionAr: e.target.value }))}
                    rows={2}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.price} (EGP)</label>
                  <input
                    type="number"
                    value={tripForm.price}
                    onChange={(e) => setTripForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    min={0}
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.startDateTime}</label>
                  <input
                    type="datetime-local"
                    value={tripForm.startDateTime}
                    onChange={(e) => setTripForm(prev => ({ ...prev, startDateTime: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-xs outline-none transition focus:border-[#c8860a]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.endDateTime}</label>
                  <input
                    type="datetime-local"
                    value={tripForm.endDateTime}
                    onChange={(e) => setTripForm(prev => ({ ...prev, endDateTime: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-xs outline-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.guide}</label>
                  <select
                    value={tripForm.guideId}
                    onChange={(e) => setTripForm(prev => ({ ...prev, guideId: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  >
                    <option value="">{tAdmin.trips.selectGuide}</option>
                    {guides.map(g => (
                      <option key={g.userId || g.id} value={g.userId || g.id}>
                        {g.fullName || g.name} ({g.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.companyId}</label>
                  <input
                    type="number"
                    value={tripForm.companyId}
                    onChange={(e) => setTripForm(prev => ({ ...prev, companyId: e.target.value }))}
                    required
                    className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.places}</label>
                <select
                  multiple
                  value={tripForm.selectedPlaces}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setTripForm(prev => ({ ...prev, selectedPlaces: values }));
                  }}
                  required
                  className="w-full rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-2.5 text-[#f5ecd7] text-sm outline-none h-28 transition focus:border-[#c8860a]"
                >
                  {places.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === "ar" ? (p.nameAr || p.name) : p.name} ({p.city})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#9a8468] font-semibold">{tAdmin.trips.selectPlaces}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.trips.image}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTripForm(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                  className="w-full text-xs text-[#9a8468] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#c8860a] file:text-white hover:file:bg-[#e8a830]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#3d2e1e]/60">
                <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setTripModal(false)} />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg px-4 py-2 text-xs font-black bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150 disabled:opacity-50"
                >
                  {actionLoading ? tAdmin.places.saving : tAdmin.places.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. Cancel Booking Modal */}
      {cancelBookingId && (
        <div
          onClick={() => setCancelBookingId(null)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-2">{tAdmin.bookings.cancelBookingTitle}</h3>
            <p className="text-xs text-[#9a8468] font-bold mb-4">{tAdmin.bookings.cancelReasonDesc}</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={tAdmin.bookings.reasonPlaceholder}
              rows={4}
              required
              className="w-full rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none resize-none transition focus:border-[#c8860a]"
            />
            <div className="flex justify-end gap-3 mt-5">
              <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setCancelBookingId(null)} />
              <ActionBtn label={tAdmin.bookings.confirmCancel} color={COLORS.danger} onClick={handleCancelBooking} disabled={actionLoading} />
            </div>
          </div>
        </div>
      )}

      {/* F. Refund Modal */}
      {refundModal && (
        <div
          onClick={() => setRefundModal(null)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-2">{tAdmin.payments.refundTitle}</h3>
            <p className="text-xs text-[#9a8468] font-bold mb-4">{tAdmin.payments.refundDesc}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessRefund();
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.payments.reasonLabel}</label>
                <input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={tAdmin.payments.reasonPlaceholder}
                  required
                  className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.payments.amountLabel}</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max: ${refundModal.amount}`}
                  max={refundModal.amount}
                  className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setRefundModal(null)} />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg px-4 py-2 text-xs font-black bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150 disabled:opacity-50"
                >
                  {tAdmin.payments.confirmRefund}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* G. Nationality Add/Edit Modal */}
      {nationalityModal && (
        <div
          onClick={() => setNationalityModal(null)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-4">
              {nationalityModal === "add" ? tAdmin.nationalities.addNationality : tAdmin.nationalities.editNationality}
            </h3>
            <form onSubmit={handleSaveNationality} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.nationalities.nameEn}</label>
                <input
                  value={nationalityForm.name}
                  onChange={(e) => setNationalityForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.nationalities.nameAr}</label>
                <input
                  value={nationalityForm.nameAr}
                  onChange={(e) => setNationalityForm(prev => ({ ...prev, nameAr: e.target.value }))}
                  required
                  className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setNationalityModal(null)} />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg px-4 py-2 text-xs font-black bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150 disabled:opacity-50"
                >
                  {tAdmin.places.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* H. Role Add Modal */}
      {roleModal && (
        <div
          onClick={() => setRoleModal(false)}
          className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#231c15] border border-[#3d2e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-black text-[#f5ecd7] mb-4">{tAdmin.roles.addRole}</h3>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8468]">{tAdmin.roles.name}</label>
                <input
                  value={roleFormName}
                  onChange={(e) => setRoleFormName(e.target.value)}
                  required
                  placeholder={tAdmin.rolesOptions.placeholder}
                  className="rounded-xl bg-[#2e2318] border border-[#3d2e1e] p-3 text-[#f5ecd7] text-sm outline-none transition focus:border-[#c8860a]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <ActionBtn label={tAdmin.guides.cancel} color={COLORS.textMuted} onClick={() => setRoleModal(false)} />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg px-4 py-2 text-xs font-black bg-[#c8860a] text-white hover:bg-[#e8a830] transition duration-150 disabled:opacity-50"
                >
                  {tAdmin.places.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
