import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, Star, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../hooks/useSettings";
import { useGoogleUser } from "../hooks/useGoogleUser";

const NAV_LINKS = [
  { label: "Home", type: "scroll", target: "home" },
  { label: "About", type: "scroll", target: "about" },
  { label: "Wedding", type: "link", target: "/packages" },
  { label: "Umrah & Haji", type: "link", target: "/umrah-haji" },
  { label: "Printing", type: "link", target: "/printing" },
  { label: "Gallery", type: "link", target: "/gallery" },
  { label: "Wedding Show", type: "link", target: "/wedding-show" },
  { label: "Contact", type: "link", target: "/contact" },
] as const;

export default function Navbar() {
  const { settings } = useSettings();
  const { user: googleUser, loading: googleLoading, login: googleLogin, logout: googleLogout } = useGoogleUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLElement | null)[]>([]);

  const siteName = settings["site-name"] || "GALERIA WEDDING";
  const logoLetter = settings["logo-letter"] || siteName.charAt(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  // Calculate underline position
  const getUnderlineStyle = () => {
    if (hoveredIdx === null || !linkRefs.current[hoveredIdx] || !navRef.current) {
      return { opacity: 0, width: 0, left: 0 };
    }
    const el = linkRefs.current[hoveredIdx]!;
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      opacity: 1,
      width: elRect.width,
      left: elRect.left - navRect.left,
    };
  };

  const underlineStyle = getUnderlineStyle();

  const mobileMenuVariants = {
    closed: {
      clipPath: "circle(0% at calc(100% - 2.5rem) 2rem)",
      opacity: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
    open: {
      clipPath: "circle(150% at calc(100% - 2.5rem) 2rem)",
      opacity: 1,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const mobileItemVariants = {
    closed: { x: 30, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.15 + i * 0.06, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-navbar shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {logoLetter}
            </motion.div>
            <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? "text-foreground" : "text-foreground"
            }`}>
              {siteName}
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div
            ref={navRef}
            className="hidden lg:flex items-center gap-1 relative"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Sliding underline indicator */}
            <motion.div
              className="absolute bottom-0 h-[2px] bg-primary rounded-full"
              animate={underlineStyle}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ pointerEvents: "none" }}
            />

            {NAV_LINKS.map((item, idx) => {
              const isActive =
                item.type === "link" && location.pathname === item.target;

              const el =
                item.type === "scroll" ? (
                  <button
                    key={idx}
                    ref={(r) => { linkRefs.current[idx] = r; }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onClick={() => scrollToSection(item.target)}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:text-primary ${
                      scrolled ? "text-foreground/80" : "text-foreground/80"
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={idx}
                    ref={(r) => { linkRefs.current[idx] = r; }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    to={item.target}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:text-primary ${
                      isActive
                        ? "text-primary"
                        : scrolled
                          ? "text-foreground/80"
                          : "text-foreground/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                );

              return el;
            })}
          </div>

          {/* CTA + Admin */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Google Login */}
            {googleUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2 bg-white/80 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all"
                >
                  <img src={googleUser.picture} alt={googleUser.name} referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{googleUser.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-foreground/50 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <img src={googleUser.picture} alt={googleUser.name} referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20" />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{googleUser.name}</p>
                            <p className="text-xs text-gray-500 truncate">{googleUser.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            // Scroll ke section review terdekat di halaman ini
                            const reviewSection = document.querySelector('[id$="-reviews"]') || document.getElementById('packages');
                            if (reviewSection) {
                              reviewSection.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              navigate('/packages#wedding-reviews');
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>Tulis Ulasan</span>
                        </button>

                        <div className="h-px bg-gray-100 my-1" />

                        <button
                          onClick={() => { googleLogout(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={googleLogin} disabled={googleLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground border border-gray-200 hover:border-gray-300 bg-white/70 backdrop-blur-sm transition-all hover:shadow-sm disabled:opacity-60">
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>Login</span>
              </button>
            )}

            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* MOBILE: Google avatar + toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Google avatar di mobile header */}
            {googleUser ? (
              <button onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-1.5 bg-white/80 border border-gray-200 rounded-full px-2.5 py-1 shadow-sm">
                <img src={googleUser.picture} alt={googleUser.name} referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-medium text-foreground max-w-[70px] truncate">{googleUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button onClick={googleLogin} disabled={googleLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white/80 text-xs font-medium text-gray-700 shadow-sm">
                {googleLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Login
              </button>
            )}

            {/* Hamburger */}
            <motion.button
              className="relative z-[60] p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-[55] bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-5 w-full px-8">
              {NAV_LINKS.map((item, idx) =>
                item.type === "scroll" ? (
                  <motion.button
                    key={idx}
                    custom={idx}
                    variants={mobileItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    onClick={() => scrollToSection(item.target)}
                    className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </motion.button>
                ) : (
                  <motion.div
                    key={idx}
                    custom={idx}
                    variants={mobileItemVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <Link
                      to={item.target}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ),
              )}

              <motion.div
                custom={NAV_LINKS.length}
                variants={mobileItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="pt-6 flex flex-col items-center gap-4"
              >
                {/* Google Login mobile */}
                {googleUser ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                      <img src={googleUser.picture} alt={googleUser.name} referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-sm font-medium">{googleUser.name.split(' ')[0]}</span>
                    </div>
                    <button onClick={() => { googleLogout(); setIsMobileMenuOpen(false); }}
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { googleLogin(); setIsMobileMenuOpen(false); }} disabled={googleLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary/30 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-md">
                    {googleLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    {googleLoading ? "Memuat..." : "Login dengan Google"}
                  </button>
                )}

                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-foreground/50 hover:text-primary transition-colors"
                >
                  Admin Panel
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
