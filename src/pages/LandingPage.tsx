import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight, Trophy, Users, Calendar, Zap, Star, ArrowRight, Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

// ─── Hero Carousel ────────────────────────────────────────────────────────────
const slides = [
  {
    img: heroBg,
    tag: "Season 2024/25",
    headline: "Legit Boys FA",
    sub: "Where passion meets the pitch",
  },
  {
    img: gallery1,
    tag: "Training",
    headline: "Train Hard,\nWin Together",
    sub: "Elite coaching for every level",
  },
  {
    img: gallery2,
    tag: "Matchday",
    headline: "Every Game\nTells a Story",
    sub: "Follow us through every kick",
  },
  {
    img: gallery3,
    tag: "Brotherhood",
    headline: "More Than\nA Football Club",
    sub: "Family, community, and football",
  },
];

const HeroSection: React.FC = () => {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative h-[92vh] min-h-[600px] overflow-hidden">
      {/* Slides */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
        >
          <img src={slide.img} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-pitch/80 via-pitch/50 to-pitch/90" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative pitch lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current + "-content"}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Tag pill */}
            <span className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 text-secondary px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              {slide.tag}
            </span>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading font-black text-white leading-none mb-6 drop-shadow-2xl whitespace-pre-line">
              {slide.headline}
            </h1>

            <p className="text-lg md:text-xl text-white/75 font-body mb-3 max-w-md">
              {slide.sub}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-white/50 text-sm mb-10">
              <MapPin className="h-3.5 w-3.5" />
              <span>{t("hero.location")}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading font-bold text-sm px-8 h-12 shadow-lg shadow-secondary/20">
                <Link to="/team">{t("hero.cta.join")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10 font-heading font-bold text-sm px-8 h-12 backdrop-blur-sm">
                <Link to="/matches">View Fixtures</Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? "w-8 h-2 bg-secondary" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const stats = [
  { icon: Trophy, value: "10+", label: "Trophies Won" },
  { icon: Users, value: "40+", label: "Squad Members" },
  { icon: Calendar, value: "6", label: "Years Active" },
  { icon: Zap, value: "87%", label: "Win Rate" },
];

const StatsBar: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="bg-pitch py-10 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center px-6"
            >
              <s.icon className="h-6 w-6 text-secondary mb-2" />
              <span className="text-4xl font-heading font-black text-white">{s.value}</span>
              <span className="text-white/50 text-xs font-body mt-1 uppercase tracking-wider">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── About Section ────────────────────────────────────────────────────────────
const AboutSection: React.FC = () => {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-secondary font-heading font-bold text-xs uppercase tracking-widest mb-4 block">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-6 leading-tight">
              {t("about.title")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {t("about.text")}
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold gap-2">
              <Link to="/team">Meet the Squad <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </motion.div>

          {/* Visual card stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative h-80 md:h-96"
          >
            <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-2xl rotate-3">
              <img src={gallery2} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-2xl -rotate-2 border-4 border-background">
              <img src={gallery1} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-secondary flex items-center justify-center shadow-xl shadow-secondary/30 z-10">
              <Trophy className="h-7 w-7 text-secondary-foreground" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Next Match Banner ────────────────────────────────────────────────────────
const NextMatchSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-6 px-4 bg-muted/40">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-pitch rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div>
            <span className="text-secondary text-xs font-heading font-bold uppercase tracking-widest mb-2 block">Next Match</span>
            <h3 className="text-2xl md:text-3xl font-heading font-black text-white mb-1">Legit Boys FA <span className="text-white/40 mx-3">vs</span> Rivals FC</h3>
            <div className="flex items-center gap-4 text-white/60 text-sm mt-2">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Sat 15 Jan, 3:00 PM</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Home Ground</span>
            </div>
          </div>
          <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading font-bold whitespace-nowrap shrink-0">
            <Link to="/matches">All Fixtures →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Features / Why Us ────────────────────────────────────────────────────────
const features = [
  { icon: Trophy, title: "Winning Culture", desc: "We've built a squad mentality that turns good players into great teammates." },
  { icon: Zap, title: "Elite Training", desc: "Structured sessions designed to develop technical skill, fitness, and tactical awareness." },
  { icon: Users, title: "Real Community", desc: "Beyond the pitch — events, socials, and a brotherhood that lasts a lifetime." },
  { icon: Star, title: "Player Development", desc: "Individual feedback and stat tracking to help every player reach their potential." },
];

const FeaturesSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-secondary font-heading font-bold text-xs uppercase tracking-widest mb-3 block">Why Legit Boys</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground">More Than Just Football</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-card border border-border rounded-2xl p-6 group cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Gallery Section ──────────────────────────────────────────────────────────
const GallerySection: React.FC = () => {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const images = [
    { src: gallery1, alt: "Training drill", span: "md:col-span-2 md:row-span-2" },
    { src: gallery2, alt: "Match action", span: "" },
    { src: gallery3, alt: "Team celebration", span: "" },
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-secondary font-heading font-bold text-xs uppercase tracking-widest mb-2 block">Gallery</span>
            <h2 className="text-4xl font-heading font-black text-foreground">{t("gallery.title")}</h2>
          </div>
          <Link to="/matches" className="text-primary text-sm font-heading font-bold hover:underline hidden md:flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-4 h-80 md:h-[420px]">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`${img.span} rounded-2xl overflow-hidden group`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA Join Section ─────────────────────────────────────────────────────────
const JoinSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-pitch-gradient opacity-90" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
      }} />
      <div className="relative z-10 container mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
        >
          <span className="text-secondary font-heading font-bold text-xs uppercase tracking-widest mb-4 block">Join the Squad</span>
          <h2 className="text-4xl md:text-6xl font-heading font-black text-white mb-6 leading-tight">
            Ready to Play<br />with the Best?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Trials are open. Whether you're a seasoned player or just getting started, there's a place for you at Legit Boys FA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading font-bold text-base px-10 h-13">
              <Link to="/team">Apply Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10 font-heading font-bold text-base px-10 h-13">
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
  <>
    <HeroSection />
    <StatsBar />
    <AboutSection />
    <NextMatchSection />
    <FeaturesSection />
    <GallerySection />
    <JoinSection />
  </>
);

export default LandingPage;