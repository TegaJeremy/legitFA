import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n, LANGUAGES, type Language } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Menu, X, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Navbar: React.FC = () => {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();

  // Admin link removed — access via /admin/login directly
  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/team", label: t("nav.team") },
    { to: "/matches", label: t("nav.matches") },
    { to: "/stats", label: t("nav.stats") },
    { to: "/training", label: t("nav.training") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Legit Boys FA" className="h-10 w-10" />
          <span className="font-heading font-bold text-lg text-foreground hidden sm:block">Legit Boys FA</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setLangOpen(!langOpen)}>
              <Globe className="h-4 w-4" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Language); setLangOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${lang === l.code ? "text-primary font-semibold" : "text-foreground"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm font-medium ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;