import { Facebook, Twitter, Youtube, Mail } from 'lucide-react';

const USEFUL_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Explore', href: '#explore' },
  { label: 'About Us', href: '#about-us' },
];
const RESOURCES = ['Become a guide', 'Support', 'Help'];

const SOCIAL_LINKS = [
  { id: 'facebook', icon: Facebook, label: 'Facebook', href: '#' },
  { id: 'twitter', icon: Twitter, label: 'Twitter', href: '#' },
  { id: 'youtube', icon: Youtube, label: 'YouTube', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-soft pt-16 pb-8" role="contentinfo">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xl font-bold text-secondary mb-4">
              Discover Egypt
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              We bring authentic Egyptian experiences to the world with culture,
              history, and adventure.
            </p>
          </div>

          {/* Useful Links */}
          <nav aria-label="Useful links">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Useful Links
            </h3>
            <ul className="space-y-3">
              {USEFUL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {RESOURCES.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted hover:text-primary transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Contact Us
            </h3>
            <a
              href="mailto:infomail@gmail.com"
              className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm mb-4"
            >
              <Mail size={18} aria-hidden="true" />
              <span>infomail@gmail.com</span>
            </a>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center bg-secondary text-white rounded-full hover:bg-primary transition-colors"
                >
                  <social.icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border">
          <p className="text-muted text-sm">
            &copy;2025 DiscoverEgypt
          </p>
        </div>
      </div>
    </footer>
  );
}
