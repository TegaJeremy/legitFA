import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin, ChevronLeft, ChevronRight, Trophy, Users, Calendar,
  Zap, Star, ArrowRight, Shield, Target, Clock, ChevronDown,
  Instagram, Twitter, Facebook, Mail, Phone, Quote, Play,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMatches, usePlayersWithStats } from "@/hooks/use-data";
import heroBg from "@/assets/hero-bg.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import sunny from "@/assets/sunny.png";
import gideonB from "@/assets/gideonB.jpeg";
import TeamA from "@/assets/TeamA.jpeg";
import TeamB from "@/assets/TeamB.jpeg";
import Jeremy from "@/assets/Jeremy.jpeg";

// ─── Design Philosophy ────────────────────────────────────────────────────────
// Dark mode:  bg = #0a0a0a / #111111   accent = #C9A84C (gold)
// Light mode: bg = #ffffff / #f8f8f8   accent = #B8922A (deep gold)
//             text = #0a0a0a           borders = #e5e5e5
// Uses CSS variables (bg-background, bg-card, text-foreground etc.)
// so it switches properly with the ThemeProvider class toggle.
// Hardcoded dark sections (hero, gallery overlays) use dark: variants.

const slides = [
  { img: TeamA,   tag: "Season 2024 / 25", headline: "Legit Boys\nFootball Academy", sub: "Where Lagos builds its next generation of football talent." },
  { img: gallery1, tag: "Training",          headline: "Train Hard.\nWin Together.",    sub: "Structured elite coaching every Saturday at 4 PM." },
  { img: gallery2, tag: "Matchday",          headline: "Every Game\nTells a Story.",    sub: "Competitive fixtures that sharpen players for the next level." },
  { img: gallery3, tag: "Brotherhood",       headline: "More Than\nA Football Club.",   sub: "Family, discipline, community — built on the beautiful game." },
  { img: Jeremy, tag: "Brotherhood",       headline: "More Than\nA Football Club.",   sub: "Family, discipline, community — built on the beautiful game." },
  { img: TeamB, tag: "Brotherhood",       headline: "More Than\nA Football Club.",   sub: "Family, discipline, community — built on the beautiful game." },
];

// ─── Hero — always dark (photo overlay), unaffected by theme ─────────────────
const HeroSection: React.FC = () => {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => { setDirection(idx > current ? 1 : -1); setCurrent(idx); };
  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slide = slides[current];
  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden bg-[#0a0a0a]">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          <img src={slide.img} alt="" className="w-full h-full object-cover opacity-40" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
      <div className="absolute left-[clamp(1rem,8vw,6rem)] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/60 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center pl-[clamp(2rem,12vw,8rem)] pr-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current + "-c"}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs font-bold uppercase tracking-[0.25em]">{slide.tag}</span>
            </div>
            <h1
              className="text-[clamp(3rem,8vw,7rem)] font-black text-white leading-[0.88] mb-8 whitespace-pre-line"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "-0.02em" }}
            >
              {slide.headline}
            </h1>
            <p className="text-white/55 text-lg mb-3 max-w-md leading-relaxed">{slide.sub}</p>
            <div className="flex items-center gap-2 text-white/30 text-sm mb-12">
              <MapPin className="h-3.5 w-3.5 text-[#C9A84C]" />
              <span>{t("hero.location")}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg"
                className="bg-[#C9A84C] hover:bg-[#B8922A] text-[#0a0a0a] font-bold text-sm px-10 h-12 rounded-none shadow-2xl">
                <Link to="/team">{t("hero.cta.join")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg"
                className="border-white/25 text-white hover:bg-white/8 hover:border-white/40 font-bold text-sm px-10 h-12 rounded-none">
                <Link to="/matches">View Fixtures</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
          className="absolute bottom-10 left-[clamp(2rem,12vw,8rem)] flex items-center gap-3 text-white/20"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        </motion.div>
      </div>

      <div className="absolute bottom-10 right-8 md:right-12 flex items-center gap-4 z-20">
        <span className="text-white/25 text-xs font-mono">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className={`transition-all duration-300 h-0.5 ${i === current ? "w-10 bg-[#C9A84C]" : "w-4 bg-white/20 hover:bg-white/40"}`} />
          ))}
        </div>
        <div className="flex gap-2 ml-4">
          <button onClick={prev} className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Fade into page background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const statsData = [
  { icon: Trophy,   value: "10+", label: "Trophies Won" },
  { icon: Users,    value: "40+", label: "Squad Members" },
  { icon: Calendar, value: "6",   label: "Years Active" },
  { icon: Zap,      value: "87%", label: "Win Rate" },
];

const StatsBar: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="bg-card border-y border-border py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {statsData.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center px-6 py-4"
            >
              <s.icon className="h-5 w-5 text-primary mb-4" />
              <span className="text-5xl font-black text-foreground mb-1" style={{ fontFamily: "Georgia, serif" }}>
                {s.value}
              </span>
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── About ────────────────────────────────────────────────────────────────────
const AboutSection: React.FC = () => {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-4 bg-background overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-24 items-center">

          {/* Image collage */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] order-2 md:order-1"
          >
            <div className="absolute top-0 left-0 w-[72%] h-[75%] overflow-hidden border border-border shadow-xl">
              <img src={gallery1} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-[55%] h-[55%] overflow-hidden border-2 border-primary/40 shadow-xl">
              <img src={gallery2} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-[58%] left-[58%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary flex items-center justify-center shadow-2xl z-10">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute bottom-6 left-4 bg-card border border-border px-4 py-2.5 z-10 shadow-lg">
              <span className="text-muted-foreground text-[10px] uppercase tracking-widest block">Est.</span>
              <span className="text-foreground font-black text-xl" style={{ fontFamily: "Georgia, serif" }}>2019</span>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="order-1 md:order-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-[0.25em]">Our Story</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 leading-[0.9]"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
              {t("about.title")}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-4">{t("about.text")}</p>
            <p className="text-muted-foreground text-base leading-relaxed mb-10">
              From casual kickabouts to organized competitive football — Legit Boys FA is the home for serious players across Lagos who want to grow, compete, and belong.
            </p>
            <Link
              to="/team"
              className="inline-flex items-center gap-3 text-foreground font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors"
            >
              Meet the Squad <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Next Match ───────────────────────────────────────────────────────────────
const NextMatchSection: React.FC = () => {
  const { data: matches } = useMatches();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const upcoming = matches?.find((m) => new Date(m.date) >= new Date()) ?? matches?.[0];

  return (
    <section ref={ref} className="py-6 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
          style={{ borderLeft: "4px solid hsl(var(--primary))" }}
        >
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8rem] font-black text-foreground/[0.03] select-none pointer-events-none"
            style={{ fontFamily: "Georgia, serif" }}>VS</div>

          <div className="pl-2">
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.25em] mb-4 block">
              {upcoming ? "Next Match" : "Recent Match"}
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Legit Boys FA
              <span className="text-muted-foreground mx-5 font-light text-2xl">vs</span>
              <span className="text-primary">{upcoming?.opponent ?? "TBA"}</span>
            </h3>
            <div className="flex flex-wrap gap-6 text-muted-foreground text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {upcoming?.date ?? "Date TBA"}{upcoming?.time ? ` · ${upcoming.time}` : ""}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Home Ground, Lagos
              </span>
            </div>
          </div>
          <Button asChild size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none px-8 whitespace-nowrap shrink-0">
            <Link to="/matches">All Fixtures →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Trophy,  title: "Winning Culture",    desc: "A squad mentality forged over 6 seasons — we don't just play, we compete for every result." },
  { icon: Zap,     title: "Elite Training",      desc: "Structured Saturday sessions at 4 PM — technique, fitness, and tactical shape every week." },
  { icon: Shield,  title: "Brotherhood",         desc: "Events, socials, and a community of brothers that extends well beyond the 90 minutes." },
  { icon: Target,  title: "Stat Tracking",       desc: "Individual goals and assists tracked every month so every player can see their growth." },
  { icon: Star,    title: "Player Development",  desc: "Personal feedback from coaches and data-driven improvement plans per player." },
  { icon: Clock,   title: "Consistent Fixtures", desc: "Regular competitive matches year-round — no off-season, only improvement." },
];

const FeaturesSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-32 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-[0.25em]">Why Legit Boys</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-foreground leading-[0.9]"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
            More Than<br />Just Football.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-border">
          {features.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.08 }}
              className="group border-r border-b border-border p-8 hover:bg-background transition-colors cursor-default"
            >
              <div className="w-10 h-10 border border-border group-hover:border-primary/50 flex items-center justify-center mb-6 transition-colors">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-foreground font-bold text-base mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Top Scorers ──────────────────────────────────────────────────────────────
const TopScorersSection: React.FC = () => {
  const { data: players, isLoading } = usePlayersWithStats();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const top = players ? [...players].sort((a, b) => b.goals_total - a.goals_total).slice(0, 5) : [];
  if (!isLoading && top.length === 0) return null;

  const rankStyle = [
    "bg-primary text-primary-foreground",
    "bg-muted text-foreground",
    "bg-muted text-muted-foreground",
    "bg-muted text-muted-foreground",
    "bg-muted text-muted-foreground",
  ];

  return (
    <section ref={ref} className="py-28 px-4 bg-background">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-[0.25em]">Leaderboard</span>
          </div>
          <h2 className="text-5xl font-black text-foreground" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
            Top Scorers
          </h2>
        </motion.div>

        <div className="space-y-1">
          {(isLoading ? Array.from({ length: 5 }) : top).map((p: any, i) => (
            <motion.div key={p?.id ?? i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-5 border border-border bg-card hover:border-primary/30 transition-colors p-4"
            >
              <span className={`w-8 h-8 flex items-center justify-center font-black text-xs flex-shrink-0 ${rankStyle[i] ?? rankStyle[4]}`}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center border border-border">
                {p?.avatar_url
                  ? <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                  : <Users className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                {isLoading
                  ? <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  : <>
                      <p className="font-bold text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.position}</p>
                    </>}
              </div>
              <div className="text-right flex-shrink-0">
                {isLoading
                  ? <div className="h-8 w-10 bg-muted rounded animate-pulse" />
                  : <>
                      <span className="text-3xl font-black text-primary" style={{ fontFamily: "Georgia, serif" }}>
                        {p.goals_total}
                      </span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">goals</p>
                    </>}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <Button asChild variant="outline"
            className="border-border text-foreground hover:bg-card hover:border-primary font-bold rounded-none px-8 w-full">
            <Link to="/stats">Full Stats Table →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

// ─── Gallery — always has dark overlay on images ──────────────────────────────
const GallerySection: React.FC = () => {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-28 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-xs font-bold uppercase tracking-[0.25em]">Gallery</span>
            </div>
            <h2 className="text-5xl font-black text-foreground" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
              {t("gallery.title")}
            </h2>
          </div>
          <Link to="/matches" className="text-muted-foreground text-sm font-bold hover:text-primary hidden md:flex items-center gap-2 transition-colors">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-12 grid-rows-2 gap-2 h-[480px]">
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0 }}
            className="col-span-7 row-span-2 overflow-hidden group relative border border-border">
            <img src={gallery1} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.1 }}
            className="col-span-5 row-span-1 overflow-hidden group border border-border">
            <img src={gallery2} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}
            className="col-span-5 row-span-1 overflow-hidden group relative border-2 border-primary/30">
            <img src={gallery3} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3 text-white font-bold text-sm uppercase tracking-widest">
                <Play className="h-4 w-4 text-[#C9A84C]" /> View Gallery
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Training + Contact ───────────────────────────────────────────────────────
const TrainingSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-28 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-2">
          {/* Training card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="bg-card border border-border p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <Clock className="h-8 w-8 text-primary mb-6" />
            <span className="text-primary text-[10px] uppercase tracking-[0.25em] font-bold block mb-3">Training Schedule</span>
            <h3 className="text-3xl font-black text-foreground mb-5" style={{ fontFamily: "Georgia, serif" }}>
              Every Saturday
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-14 bg-primary" />
              <div>
                <p className="text-foreground font-bold text-2xl">4:00 PM</p>
                <p className="text-muted-foreground text-sm">Kickoff — arrive by 3:45</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Structured sessions covering tactical shape, technical drills, and competitive small-sided games. All skill levels welcome — serious commitment required.
            </p>
          </motion.div>

          {/* Gold contact card — always gold regardless of theme */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.12 }}
            className="bg-primary p-10 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-black/10 rounded-full pointer-events-none" />
            <div>
              <Phone className="h-8 w-8 text-primary-foreground mb-6" />
              <span className="text-primary-foreground/60 text-[10px] uppercase tracking-[0.25em] font-bold block mb-3">Get In Touch</span>
              <h3 className="text-3xl font-black text-primary-foreground mb-6" style={{ fontFamily: "Georgia, serif" }}>
                Ready to Join?
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { href: "tel:+2348081825445", label: "0808 182 5445" },
                { href: "tel:+2349071726550", label: "+234 907 172 6550" },
                { href: "tel:+2347082824209", label: "+234 708 282 4209" },
              ].map(({ href, label }) => (
                <a key={href} href={href}
                  className="flex items-center gap-3 text-primary-foreground font-bold hover:opacity-65 transition-opacity">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: "Chukwuemeka O.", role: "Midfielder", quote: "Legit Boys gave me the platform to grow as a player and a person. The coaches push you every single session." },
  { name: "Adebayo T.",     role: "Defender",   quote: "Best football community in Lagos. The brotherhood here is something you genuinely can't find anywhere else." },
  { name: "Segun A.",       role: "Attacker",   quote: "Went from local kickabouts to competitive football in one season. This club is the real deal." },
];

const TestimonialsSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-28 px-4 bg-card border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-[0.25em]">Testimonials</span>
          </div>
          <h2 className="text-5xl font-black text-foreground" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
            What Players Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-2">
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="border border-border bg-background p-8 hover:border-primary/30 transition-colors"
            >
              <Quote className="h-6 w-6 text-primary mb-5 opacity-60" />
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="text-primary text-xs font-black">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA Join ─────────────────────────────────────────────────────────────────
const JoinSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-36 px-4 bg-background relative overflow-hidden">
      {/* subtle gold diagonal stripes */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 1px, transparent 1px, transparent 60px)" }} />
      <div className="relative z-10 container mx-auto max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65 }}>
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-[0.25em]">Join the Squad</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-foreground mb-8 leading-[0.88]"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>
            Ready to Play<br />with the Best?
          </h2>
          <p className="text-muted-foreground text-base mb-12 max-w-lg mx-auto leading-relaxed">
            Trials are open year-round. Whether you're a seasoned player or just getting started — there's a place for you at Legit Boys FA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-12 h-13 rounded-none shadow-xl">
              <Link to="/team">Apply Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg"
              className="border-border text-foreground hover:bg-card hover:border-primary font-bold text-base px-12 h-13 rounded-none">
              <Link to="/training">Training Schedule</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => (
  <div className="bg-background">
    <HeroSection />
    <StatsBar />
    <AboutSection />
    <NextMatchSection />
    <FeaturesSection />
    <TopScorersSection />
    <GallerySection />
    <TrainingSection />
    <TestimonialsSection />
    <JoinSection />
  </div>
);

export default LandingPage;