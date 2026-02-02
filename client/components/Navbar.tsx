import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">

        {/* ✅ LOGO BISA KLIK KE HOME */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="text-lg font-bold text-foreground">
            GALERIA WEDDING
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-8">
          <button
            onClick={() => scrollToSection("home")}
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            About
          </button>

          <Link
            to="/wedding-show"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Wedding Show
          </Link>
     
          <Link
            to="/gallery"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Gallery
          </Link>
          <Link
            to="/packages"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Packages
          </Link>

          <Link
            to="/contact"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Contact
          </Link>
        </div>
{/* ... other nav links ... */}

{process.env.NODE_ENV === 'development' && (
  <a
    href="/admin"
    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
  >
    Admin
  </a>
)}
        {/* CTA */}
        <button
          onClick={() => scrollToSection("booking")}
          className="hidden md:block px-6 py-2 bg-primary text-white rounded-md"
        >
          Book Now
        </button>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t py-4 space-y-3 px-4">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button onClick={() => scrollToSection("about")}>About</button>

          <Link to="/wedding-show" onClick={() => setIsMobileMenuOpen(false)}>
            Wedding Show
          </Link>
          <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
            Gallery
          </Link>
          <Link to="/packages" onClick={() => setIsMobileMenuOpen(false)}>
            Packages
          </Link>

          <button onClick={() => scrollToSection("contact")}>Contact</button>
          <button onClick={() => scrollToSection("booking")}>Book Now</button>
        </div>
      )}
    </nav>
  );
}
