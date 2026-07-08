import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../hooks/useSettings";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              Admin
            </Link>
            <motion.button
              onClick={() => scrollToSection("booking")}
              className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 btn-magnetic"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Book Now
            </motion.button>
          </div>

          {/* MOBILE TOGGLE */}
          <motion.button
            className="lg:hidden relative z-[60] p-2"
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
                <button
                  onClick={() => {
                    scrollToSection("booking");
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary/25"
                >
                  Book Now
                </button>
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
