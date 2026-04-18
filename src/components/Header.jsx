import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarksContext";

const NAV_LINKS = [
  { label: "Home", href: "#home", icon: MapPin },
  { label: "Explore", href: "#explore", icon: Compass },
  { label: "About Us", href: "#about-us", icon: Info },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 26, stiffness: 300 },
  },
  exit: {
    x: "100%",
    transition: { type: "spring", damping: 30, stiffness: 350 },
  },
};

const listVariants = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 20 } },
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bookmarkCount } = useBookmarks();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearchClick = () => {
    navigate("/search");
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
          <a href="/" aria-label="Discover Egypt Home">
            <img
              src="/images/DiscoverEgyptLogo.png"
              alt="Discover Egypt"
              className="h-32 w-auto mt-2"
              width={120}
              height={48}
            />
          </a>

          {/* Search Bar - Clickable to navigate */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 w-64 cursor-pointer hover:bg-gray-200 transition-colors"
            aria-label="Open search"
          >
            <Search size={18} className="text-muted" aria-hidden="true" />
            <span className="text-sm text-muted">
              What&apos;s on your mind?
            </span>
          </button>

          {/* Navigation - Desktop */}
          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-800 hover:text-primary transition-colors font-medium"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth & Language - Desktop */}
          <div className="flex items-center gap-4">
            <Link
              to="/bookmarks"
              className="relative hidden sm:flex items-center justify-center w-10 h-10 text-gray-800 hover:text-primary transition-colors"
              aria-label="My bookmarks"
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
                <span className="hidden sm:block text-gray-800 font-medium">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden sm:flex items-center gap-1 text-gray-800 hover:text-primary transition-colors font-medium"
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
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:block px-6 py-2 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors font-medium"
                >
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              className="hidden sm:flex items-center gap-1 text-muted hover:text-gray-800 transition-colors"
              aria-label="Select language"
            >
              <span>EN</span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
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
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 z-[70] h-full w-[80%] max-w-[340px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <span className="text-lg font-semibold text-secondary tracking-tight">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Close menu"
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
                    What&apos;s on your mind?
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
                  <motion.li key={link.label} variants={itemVariants}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-soft hover:text-primary transition-colors"
                    >
                      <link.icon size={20} className="text-primary/70" />
                      {link.label}
                    </a>
                  </motion.li>
                ))}

                {/* Bookmarks */}
                <motion.li variants={itemVariants}>
                  <Link
                    to="/bookmarks"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-soft hover:text-primary transition-colors"
                  >
                    <Bookmark size={20} className="text-primary/70" />
                    Bookmarks
                    {bookmarkCount > 0 && (
                      <span className="ml-auto w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {bookmarkCount}
                      </span>
                    )}
                  </Link>
                </motion.li>
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
                        <p className="text-sm font-semibold text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted">Welcome back</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Log out
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
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold shadow-btn hover:brightness-105 transition-all"
                    >
                      <UserPlus size={18} />
                      Sign up
                    </Link>
                  </>
                )}

                {/* Language toggle */}
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 w-full py-2 text-sm text-muted hover:text-gray-800 transition-colors"
                >
                  <span>EN</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
