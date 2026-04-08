import React from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Calendar, Trophy, Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-heading text-2xl font-black text-foreground mb-3">Legit Boys FA</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{t("footer.tagline")}</p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Facebook, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/team", label: "Our Squad" },
                { to: "/matches", label: "Fixtures & Results" },
                { to: "/stats", label: "Statistics" },
                { to: "/training", label: "Training" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Schedule */}
          <div>
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider mb-4">Location</h4>
            <div className="space-y-3 text-muted-foreground text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{t("hero.location")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>Training: Tue &amp; Thu, 7 PM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Trophy className="h-4 w-4 text-primary shrink-0" />
                <span>Matches: Saturdays, 3 PM</span>
              </div>
            </div>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="space-y-3 text-muted-foreground text-sm mb-6">
              <a
                href="mailto:info@legitboysfa.com"
                className="flex items-center gap-2.5 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>info@legitboysfa.com</span>
              </a>
              <a
                href="tel:+000000000"
                className="flex items-center gap-2.5 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+000 000 0000</span>
              </a>
            </div>

            <p className="text-xs font-heading font-bold text-foreground mb-2 uppercase tracking-wider">Newsletter</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button size="sm" className="bg-primary text-primary-foreground shrink-0 font-heading font-bold">
                Go
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
          <span>© {new Date().getFullYear()} Legit Boys Football Academy. All rights reserved.</span>
          <span>Built with ❤️ for the beautiful game</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;