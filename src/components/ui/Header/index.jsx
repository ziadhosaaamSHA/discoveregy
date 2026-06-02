import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Bookmark,
  LogOut,
  Menu,
  X,
  MapPin,
  Compass,
  Info,
  User,
  UserPlus,
  Globe,
  Check,
  CircleDollarSign,
  Bell,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useBookmarks } from "../../../context/BookmarksContext";
import { useLanguage } from "../../../context/LanguageContext";
import { tourismApi } from "../../../services/tourism-api";
import { ConfirmModal } from "..";
import { normalizeNotifications } from "../../../services/mappers/notification.mapper";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = (isRTL) => ({
  hidden: { x: isRTL ? "-100%" : "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 26, stiffness: 300 },
  },
  exit: {
    x: isRTL ? "-100%" : "100%",
    transition: { type: "spring", damping: 30, stiffness: 350 },
  },
});

const listVariants = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const itemVariants = (isRTL) => ({
  hidden: { opacity: 0, x: isRTL ? -30 : 30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 20 } },
});

function getDisplayName(user) {
  const name = String(user?.name || "").trim();
  if (name && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name)) return name;
  return "User";
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [points, setPoints] = useState(null);
  const langRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bookmarkCount } = useBookmarks();
  const { language, setLanguage, t, supportedLanguages, isRTL } = useLanguage();
  const displayName = getDisplayName(user);

  const roleHome =
    user?.type === "admin"
      ? "/admin"
      : user?.type === "guide"
        ? "/guide/home"
        : user?.type === "tourist"
          ? "/tourist/home"
          : "/";
  const NAV_LINKS = user?.type === "guide"
    ? [
        { label: t("common.home"), href: roleHome, icon: MapPin },
        { label: t("requests.title"), href: "/requests", icon: MapPin },
      ]
    : user?.type === "admin"
      ? [
          { label: "Dashboard", href: "/admin", icon: MapPin },
          { label: t("common.aboutUs"), href: "/#about-us", icon: Info },
        ]
      : user?.type === "tourist"
        ? [
            { label: t("common.home"), href: roleHome, icon: MapPin },
            { label: t("myTrips.title") || (language === "ar" ? "رحلاتي" : "My Trips"), href: "/tourist/my-trips", icon: MapPin },
          ]
        : [
            { label: t("common.home"), href: "/", icon: MapPin },
            { label: t("common.aboutUs"), href: "/#about-us", icon: Info },
          ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click for language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadPoints = async () => {
      if (!user) {
        setPoints(null);
        return;
      }
      try {
        const response = await tourismApi.getUserPoints();
        const value =
          typeof response === "number"
            ? response
            : response?.points ?? response?.balance ?? response?.data?.points ?? response?.data?.balance ?? null;
        if (!cancelled && Number.isFinite(Number(value))) {
          setPoints(Number(value));
        }
      } catch {
        if (!cancelled) setPoints(null);
      }
    };

    loadPoints();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      if (!user) {
        setChatCount(0);
        return;
      }

      try {
        const response = await tourismApi.getNotifications();
        const unread = normalizeNotifications(response).filter((notification) => !notification.isRead);

        if (!cancelled) {
          setChatCount(unread.length);
        }
      } catch {
        if (!cancelled) {
          setChatCount(0);
        }
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSearchClick = () => {
    const role = String(user?.type || "").toLowerCase();
    if (role.includes("guide") || role.includes("tour guide") || role.includes("tourguide")) {
      navigate("/guide/search");
    } else if (role.includes("tourist") || role.includes("tour")) {
      navigate("/tourist/search");
    } else {
      navigate("/search");
    }
  };

  const requestSignout = () => {
    setMobileOpen(false);
    setIsSignoutModalOpen(true);
  };

  const confirmSignout = async () => {
    setIsSignoutModalOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };


  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" aria-label="Discover Egypt Home">
            <img
              src="/images/DiscoverEgyptLogo.png"
              alt="Discover Egypt"
              className="h-32 w-auto mt-2"
              width={120}
              height={48}
            />
          </Link>

          {/* Search Bar - Clickable to navigate */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 w-64 cursor-pointer hover:bg-gray-200 transition-colors"
            aria-label={t("search.ariaLabel")}
          >
            <Search size={18} className="text-muted" aria-hidden="true" />
            <span className="text-sm text-muted">
              {t("common.searchPrompt")}
            </span>
          </button>

          {/* Navigation - Desktop */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-gray-800 hover:text-primary transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth & Language - Desktop */}
          <div className="flex items-center gap-4">
            {/* Chats - only shown when logged in */}
            {user && (
              <Link
                to="/chats"
                className="relative hidden sm:flex items-center justify-center w-10 h-10 text-gray-800 hover:text-primary transition-colors"
                aria-label={t("common.chats")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-current">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor"/>
                </svg>
                {chatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d43e0b] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {chatCount}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <Link
                to="/notifications"
                className="relative hidden sm:flex items-center justify-center w-10 h-10 text-gray-800 hover:text-primary transition-colors"
                aria-label={t("common.notifications")}
              >
                <Bell size={20} />
                {chatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d43e0b] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {chatCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/bookmarks"
              className="relative hidden sm:flex items-center justify-center w-10 h-10 text-gray-800 hover:text-primary transition-colors"
              aria-label={t("common.bookmarks")}
            >
              <Bookmark size={20} />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {bookmarkCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {points !== null && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#fff3e0] text-[#b97407] text-xs font-semibold">
                    <CircleDollarSign size={14} />
                    {points} {t("common.points")}
                  </span>
                )}
                <Link to="/profile" className="hidden sm:block text-gray-800 font-medium hover:text-primary transition-colors">
                  {displayName}
                </Link>
                <button
                  type="button"
                  onClick={requestSignout}
                  className="hidden sm:flex items-center gap-1 text-gray-800 hover:text-primary transition-colors font-medium"
                  aria-label={t("common.logout")}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-gray-800 hover:text-primary transition-colors font-medium"
                >
                  {t("common.login")}
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:block px-6 py-2 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors font-medium"
                >
                  {t("common.signup")}
                </Link>
              </>
            )}

            {/* Language Selection Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted hover:text-gray-800 hover:bg-gray-100 transition-all font-medium"
                aria-label={t("common.selectLanguage")}
                aria-expanded={langOpen}
              >
                <Globe size={18} />
                <span>{language === 'ar' ? 'العربية' : 'English'}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full mt-2 ${
                      isRTL ? "left-0" : "right-0"
                    } w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[60]`}
                  >
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          language === lang.code
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {lang.label}
                        {language === lang.code && (
                          <Check size={16} className="text-primary" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label={t("common.menu")}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              variants={drawerVariants(isRTL)}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`fixed top-0 ${
                isRTL ? "left-0" : "right-0"
              } z-[70] h-full w-[80%] max-w-[340px] bg-white shadow-2xl flex flex-col`}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <span className="text-lg font-semibold text-secondary tracking-tight">
                  {t("common.menu")}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label={t("common.close")}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search (mobile) */}
              <div className="px-6 pt-5 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/search");
                  }}
                  className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-3 gap-3 hover:bg-gray-200 transition-colors"
                >
                  <Search size={18} className="text-muted" />
                  <span className="text-sm text-muted">
                    {t("common.searchPrompt")}
                  </span>
                </button>
              </div>

              {/* Nav links */}
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1 px-4 pt-4"
              >
                {NAV_LINKS.map((link) => (
                  <motion.li key={link.label} variants={itemVariants(isRTL)}>
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-soft hover:text-primary transition-colors"
                    >
                      <link.icon size={20} className="text-primary/70" />
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                {/* Bookmarks */}
                <motion.li variants={itemVariants(isRTL)}>
                  <Link
                    to="/bookmarks"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-soft hover:text-primary transition-colors"
                  >
                    <Bookmark size={20} className="text-primary/70" />
                    {t("common.bookmarks")}
                    {bookmarkCount > 0 && (
                      <span className="ml-auto w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {bookmarkCount}
                      </span>
                    )}
                  </Link>
                </motion.li>

                {user && (
                  <motion.li variants={itemVariants(isRTL)}>
                    <Link
                      to="/notifications"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-soft hover:text-primary transition-colors"
                    >
                      <Bell size={20} className="text-primary/70" />
                      {t("common.notifications")}
                      {chatCount > 0 && (
                        <span className="ml-auto w-6 h-6 bg-[#d43e0b] text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {chatCount}
                        </span>
                      )}
                    </Link>
                  </motion.li>
                )}
              </motion.ul>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Auth section at bottom */}
              <div className="px-6 pb-8 pt-4 border-t border-gray-100 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={20} className="text-primary" />
                      </div>
                      <div>
                        <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-gray-800 hover:text-primary transition-colors">
                          {displayName}
                        </Link>
                        <p className="text-xs text-muted">{t("common.welcomeBack")}</p>
                        {points !== null && (
                          <p className="text-xs text-[#b97407] font-semibold mt-0.5">
                            {points} {t("common.points")}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={requestSignout}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={18} />
                      {t("common.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-secondary text-secondary font-semibold hover:bg-secondary hover:text-white transition-colors"
                    >
                      <User size={18} />
                      {t("common.login")}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold shadow-btn hover:brightness-105 transition-all"
                    >
                      <UserPlus size={18} />
                      {t("common.signup")}
                    </Link>
                  </>
                )}

                {/* Mobile Language selector */}
                <div className="flex items-center gap-2 pt-2 px-2">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setMobileOpen(false);
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        language === lang.code
                          ? "bg-secondary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isSignoutModalOpen}
        title={t("common.signoutConfirmTitle") || "Sign out?"}
        message={t("common.signoutConfirmBody") || "Are you sure you want to sign out of your account?"}
        cancelLabel={t("common.cancel") || "Cancel"}
        confirmLabel={t("common.logout") || "Log out"}
        onCancel={() => setIsSignoutModalOpen(false)}
        onConfirm={confirmSignout}
      />
    </>
  );
}
