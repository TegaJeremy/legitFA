import React from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Clock, Trophy, Instagram, Twitter, Facebook, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ── Brand ── */}
          <div className="lg:col-span-1">
            {/* Logo mark */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
                <Trophy className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-black text-xl text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                Legit Boys FA
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1 pl-11">Ajegunle, Lagos · Est. 2019</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 mt-4">
              {t("footer.tagline")}
            </p>
            {/* Social icons */}
            <div className="flex gap-2">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-foreground font-bold text-[10px] uppercase tracking-[0.2em] mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: "/team",     label: "Our Squad" },
                { to: "/matches",  label: "Fixtures & Results" },
                { to: "/stats",    label: "Statistics" },
                { to: "/training", label: "Training Info" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all text-primary" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Schedule ── */}
          <div>
            <h4 className="text-foreground font-bold text-[10px] uppercase tracking-[0.2em] mb-5">Schedule</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground text-sm font-bold">Training</p>
                  <p className="text-muted-foreground text-xs">Every Saturday · 4:00 PM</p>
                  <p className="text-muted-foreground text-xs">Arrive by 3:45 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground text-sm font-bold">Matches</p>
                  <p className="text-muted-foreground text-xs">Any day — fixtures posted weekly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground text-sm font-bold">Location</p>
                  <p className="text-muted-foreground text-xs">{t("hero.location")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Contact + Newsletter ── */}
          <div>
            <h4 className="text-foreground font-bold text-[10px] uppercase tracking-[0.2em] mb-5">Contact Us</h4>
            <div className="space-y-3 mb-7">
              <a href="mailto:info@legitboysfa.com"
                className="flex items-center gap-2.5 text-muted-foreground text-sm hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                info@legitboysfa.com
              </a>
              {[
                { href: "tel:+2348081825445",  label: "0808 182 5445" },
                { href: "tel:+2349071726550",  label: "+234 907 172 6550" },
                { href: "tel:+2347082824209",  label: "+234 708 282 4209" },
              ].map(({ href, label }) => (
                <a key={href} href={href}
                  className="flex items-center gap-2.5 text-muted-foreground text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  {label}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <p className="text-foreground font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Newsletter</p>
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
              />
              <Button size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-bold rounded-none px-4">
                Go
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
          <span>© {new Date().getFullYear()} Legit Boys Football Academy. All rights reserved.</span>
          <span>Built with ❤️ for the beautiful game · Lagos, Nigeria</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;