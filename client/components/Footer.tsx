import {
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">
                {(settings['logo-letter'] || (settings['site-name'] || 'G').charAt(0))}
              </div>
              <span className="text-xl font-bold">{settings['site-name'] || 'GALERIA WEDDING'}</span>
            </div>
            <p className="text-gray-300 text-sm">
              {settings['description'] || 'Creating unforgettable wedding experiences with elegance, professionalism, and passion for every detail.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("home")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-primary transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-primary transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("faq")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:text-primary transition-colors"
                >
                  Kontak & Lokasi
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href={settings['facebook'] || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={settings['instagram'] || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={settings['youtube'] || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {settings['footer-copyright'] || `© ${new Date().getFullYear()} ${settings['site-name'] || 'GALERIA WEDDING'}. All rights reserved.`}
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
