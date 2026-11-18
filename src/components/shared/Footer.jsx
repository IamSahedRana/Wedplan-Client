import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/Logo";

const SERVICE_LINKS = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
];

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/dashboard", label: "Dashboard" },
];

const SOCIALS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            WedPlan is your one-stop wedding services marketplace — discover trusted vendors for
            photography, venues, catering, decor, styling and fashion, and book them in minutes.
          </p>
          <div className="flex gap-2">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-secondary-foreground transition hover:border-primary hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-foreground">Services</h4>
          <ul className="space-y-2">
            {SERVICE_LINKS.map((label) => (
              <li key={label}>
                <Link
                  href={`/services?category=${encodeURIComponent(label)}`}
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-foreground">Quick Links</h4>
          <ul className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-foreground">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              Dhaka, Bangladesh
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              +880 1700-000000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              support@wedplan.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page py-5 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} WedPlan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
