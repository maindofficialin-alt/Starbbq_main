"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { Send, User, Mail, MessageSquare, Phone, Menu, X } from "lucide-react";
import Link from 'next/link';

// Assets
const PORTAL_BG = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779707217/image_1_vdzwae.png";
const CURTAIN_LEFT = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706559/curtain_left_znkmva.png";
const CURTAIN_RIGHT = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706564/curtain_right_paeyym.png";
const BOTTOM_CLOUDS = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706555/bottom_clouds_xskut6.png";
const WORLD_BG = "/images/platter.jpg";

const SCENE1_CARDS = [
  "/images/shawarma-hero.jpeg",
  "/frames/ezgif-frame-018.jpg",
  "/images/charcoal-chicken.jpeg"
];

const SCENE2_CARDS = [
  { title: 'Whole Charcoal Chicken', desc: '24hr marinated, live oak charcoal grilled', image: '/images/charcoal-chicken.jpeg' },
  { title: 'Signature Shawarma', desc: 'Flame-grilled thigh, house tahini, fresh pita', image: '/images/shawarma-hero.jpeg' },
  { title: 'BBQ Mutton Seekh', desc: 'Hand-minced with charred onions & 7-spice', image: '/images/bbq_mutton_seekh.png' },
  { title: 'Star Special Platter', desc: 'Half chicken, 2 seekh, shawarma, fries & drinks', image: '/frames/ezgif-frame-072.jpg' },
  { title: 'Protein Grill Chicken', desc: 'High protein, flame kissed, perfect macros', image: '/images/protein_grill_chicken.png' },
];

// Helper functions
const easeInOut = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

// ═══════════════════════════════════════════════════════════════
// RESPONSIVE HOOKS
// ═══════════════════════════════════════════════════════════════

type DeviceTier = 'mobile-sm' | 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';

function useBreakpoint(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('laptop');

  useEffect(() => {
    const evaluate = (): DeviceTier => {
      const w = window.innerWidth;
      if (w <= 375) return 'mobile-sm'; // Strict small mobile bound (320px-375px)
      if (w <= 768) return 'mobile';
      if (w <= 1024) return 'tablet';
      if (w <= 1536) return 'laptop';
      if (w <= 2560) return 'desktop';
      return 'tv';
    };
    setTier(evaluate());
    const onResize = () => setTier(evaluate());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return tier;
}

function useIsLandscape(): boolean {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const update = () => setLandscape(window.innerWidth > window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return landscape;
}

function tierIsMobile(tier: DeviceTier): boolean {
  return tier === 'mobile-sm' || tier === 'mobile' || tier === 'tablet'; // tablet gets hamburger too for cleaner UI
}

function rv<T>(tier: DeviceTier, v: { 'mobile-sm': T; mobile: T; tablet: T; laptop: T; desktop: T; tv: T }): T {
  return v[tier];
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const tier = useBreakpoint();
  const isLandscape = useIsLandscape();
  const isMobile = tierIsMobile(tier);

  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Entrance Sequence & Menus
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ──── SCROLL LISTENER (rAF + scroll event for reliability) ────
  useEffect(() => {
    let ticking = false;
    let currentScroll = window.scrollY;

    const compute = () => {
      const el = document.getElementById("outer-container");
      if (!el) return;
      const maxScroll = el.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      
      currentScroll += (window.scrollY - currentScroll) * 0.12;
      
      const p = clamp(currentScroll / maxScroll, 0, 1);
      if (Math.abs(p - scrollRef.current) > 0.0001) {
        scrollRef.current = p;
        setScrollProgress(p);
      }
      
      if (Math.abs(window.scrollY - currentScroll) > 1) {
        requestAnimationFrame(compute);
      } else {
        ticking = false;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // Entrance triggers
  useEffect(() => {
    const t1 = setTimeout(() => setCurtainsOpen(true), 100);
    const t2 = setTimeout(() => setUiVisible(true), 600);
    const t3 = setTimeout(() => setEntranceDone(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Mouse Parallax (pointer devices only)
  useEffect(() => {
    const mouse = { tx: 0, ty: 0, cx: 0, cy: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.ty = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (hasFinePointer) window.addEventListener("mousemove", onMove);

    let id: number;
    const tick = () => {
      mouse.cx += (mouse.tx - mouse.cx) * 0.07;
      mouse.cy += (mouse.ty - mouse.cy) * 0.07;
      setMousePos({ x: mouse.cx, y: mouse.cy });
      id = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(id);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION TIMELINE
  // ═══════════════════════════════════════════════════════════════
  const ep = easeInOut(scrollProgress);

  // ── FULL SCREEN LOGO SPLASH (0% → 12%) ──
  const splashProg = clamp(scrollProgress / 0.12, 0, 1);
  const splashT = easeInOut(splashProg);
  const splashOpacity = 1 - splashT;
  const splashScale = lerp(1, 0.3, splashT);

  // SCENE 1 (Hero): fades out 0% → 18%
  const scene1Opacity = clamp(1 - scrollProgress / 0.18, 0, 1);

  // SCENE 2 (Arc Slider): in 22%→30%, out 55%→62%
  let scene2Opacity = 0;
  if (scrollProgress >= 0.22 && scrollProgress <= 0.55) {
    scene2Opacity = clamp((scrollProgress - 0.22) / 0.08, 0, 1);
  } else if (scrollProgress > 0.55) {
    scene2Opacity = clamp(1 - (scrollProgress - 0.55) / 0.07, 0, 1);
  }

  // SCENE 2.5 (Video): in 62%→68%, out 78%→84%
  let sceneVideoOpacity = 0;
  if (scrollProgress >= 0.62 && scrollProgress <= 0.78) {
    sceneVideoOpacity = clamp((scrollProgress - 0.62) / 0.06, 0, 1);
  } else if (scrollProgress > 0.78) {
    sceneVideoOpacity = clamp(1 - (scrollProgress - 0.78) / 0.06, 0, 1);
  }

  // SCENE 3 (Contact): in 84%→90%
  const scene3Opacity = clamp((scrollProgress - 0.84) / 0.06, 0, 1);

  // Background scales
  const worldScale = lerp(1, 1.3, ep);
  const cloudsScale = lerp(1, 1.5, ep);
  const portalScale = lerp(1, 7.5, ep);
  const portalOpacity = clamp(1 - (scrollProgress - 0.25) / 0.15, 0, 1);

  // Arc Slider rotation
  const sliderProg = clamp((scrollProgress - 0.30) / 0.25, 0, 1);
  const cardSpacingDeg = rv(tier, { 'mobile-sm': 15, mobile: 12, tablet: 10, laptop: 9, desktop: 8, tv: 7 }); // wider angle on mobile to prevent squishing
  const arcSweepDeg = (SCENE2_CARDS.length - 1) * cardSpacingDeg;
  const sliderRotationOffset = lerp(0, arcSweepDeg, sliderProg);

  // Coal background
  let coalOpacity = 0;
  if (scrollProgress >= 0.20 && scrollProgress <= 0.55) {
    coalOpacity = clamp((scrollProgress - 0.20) / 0.08, 0, 1);
  } else if (scrollProgress > 0.55) {
    coalOpacity = clamp(1 - (scrollProgress - 0.55) / 0.07, 0, 1);
  }

  // Mouse parallax — disabled on touch devices
  const pI = isMobile ? 0 : (tier === 'tablet' ? 0.5 : 1);
  const mx = mousePos.x * pI;
  const my = mousePos.y * pI;

  const fireFilter = "sepia(1) hue-rotate(-20deg) saturate(2) brightness(0.6)";

  // ── Curtains (Hardware accelerated) ──
  const curtainLX = !entranceDone ? (curtainsOpen ? -62 : 0) : -62 - lerp(0, 150, ep);
  const curtainRX = !entranceDone ? (curtainsOpen ? 62 : 0) : 62 + lerp(0, 150, ep);
  const curtainTrans = !entranceDone ? "transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)" : "none";

  // ── Responsive values ──
  const navPadX = rv(tier, { 'mobile-sm': '16px', mobile: '24px', tablet: '24px', laptop: '40px', desktop: '48px', tv: '64px' });
  const navPadY = rv(tier, { 'mobile-sm': '16px', mobile: '20px', tablet: '20px', laptop: '20px', desktop: '22px', tv: '28px' });
  const navFontSize = rv(tier, { 'mobile-sm': '14px', mobile: '16px', tablet: '16px', laptop: '16px', desktop: '18px', tv: '22px' });
  const navGap = rv(tier, { 'mobile-sm': '20px', mobile: '24px', tablet: '24px', laptop: '32px', desktop: '40px', tv: '52px' });
  const logoFinalSize = rv(tier, { 'mobile-sm': 44, mobile: 48, tablet: 48, laptop: 48, desktop: 52, tv: 60 });
  const heroTextLeft = rv(tier, { 'mobile-sm': '20px', mobile: '32px', tablet: '36px', laptop: '52px', desktop: '72px', tv: '100px' });
  const heroTextMaxW = rv(tier, { 'mobile-sm': '340px', mobile: '400px', tablet: '400px', laptop: '420px', desktop: '520px', tv: '660px' });
  const heroCardSize = rv(tier, { 'mobile-sm': 120, mobile: 160, tablet: 160, laptop: 160, desktop: 190, tv: 240 });
  const heroCardRight = rv(tier, { 'mobile-sm': '16px', mobile: '24px', tablet: '28px', laptop: '40px', desktop: '60px', tv: '100px' });
  const heroDescFS = rv(tier, { 'mobile-sm': '16px', mobile: '18px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '28px' });
  const heroTempFS = rv(tier, { 'mobile-sm': 28, mobile: 38, tablet: 38, laptop: 40, desktop: 46, tv: 56 });
  const heroLabelFS = rv(tier, { 'mobile-sm': '12px', mobile: '14px', tablet: '14px', laptop: '14px', desktop: '15px', tv: '18px' });
  const arcSliderBottom = rv(tier, { 'mobile-sm': '20px', mobile: '40px', tablet: '30px', laptop: '30px', desktop: '36px', tv: '50px' });

  // Handle closing menu
  const handleNavClick = (isContact = false) => {
    setMenuOpen(false);
    if (isContact) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div id="outer-container" style={{ height: "800vh", position: "relative", backgroundColor: "#0a0608" }}>

      {/* ═══ STICKY VIEWPORT ═══ */}
      <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", maxWidth: "100vw", overflow: "hidden", backgroundColor: "#0a0608" }}>

        {/* ═══ FULL-SCREEN LOGO SPLASH (z-index: 100) ═══ */}
        {splashOpacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `rgba(10, 6, 8, ${splashOpacity * 0.85})`,
              opacity: splashOpacity,
              pointerEvents: splashOpacity > 0.1 ? "auto" : "none",
              transition: "opacity 0.15s ease",
            }}
          >
            <div
              style={{
                transform: `scale(${splashScale}) translate3d(0,0,0)`,
                willChange: "transform, opacity",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isMobile ? "20px" : "24px",
              }}
            >
              <div
                style={{
                  width: isMobile ? "220px" : "320px",
                  height: isMobile ? "220px" : "320px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `${isMobile ? 4 : 6}px solid #FF5500`,
                  boxShadow: "0 0 80px rgba(255, 85, 0, 0.6), 0 0 160px rgba(255, 85, 0, 0.3)",
                }}
              >
                <img
                  src="/logo.jpg"
                  alt="Star BBQ"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                {/* Text "STAR BBQ" removed per request, retaining tagline */}
                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: isMobile ? "18px" : "24px",
                    letterSpacing: "0.35em",
                    color: "rgba(245, 237, 216, 0.9)",
                    textTransform: "uppercase",
                    marginTop: "8px",
                  }}
                >
                  Eppudu ostunav!!!
                </p>
              </div>
            </div>

            {/* Bouncing Scroll Indicator - Moved to bottom right */}
            <div style={{ position: "absolute", bottom: "40px", right: "32px", display: "flex", flexDirection: "column", alignItems: "center", opacity: uiVisible ? 1 : 0, transition: "opacity 1s ease" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", letterSpacing: "0.2em", color: "#F5EDD8", textTransform: "uppercase", marginBottom: "8px", opacity: 0.8, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Scroll</span>
              <div className="animate-bob" style={{ width: "24px", height: "40px", border: "2px solid rgba(255,85,0,0.6)", borderRadius: "12px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
                <div style={{ width: "2px", height: "6px", backgroundColor: "#FF5500", borderRadius: "1px", animation: "bobUp 1s ease-in-out infinite alternate" }} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ NAVBAR (z-index: 50) ═══ */}
        <nav
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            zIndex: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${navPadY} ${navPadX}`,
          }}
        >
          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "flex-end" }}>
            {isMobile ? (
              <button 
                onClick={() => setMenuOpen(true)}
                style={{ background: "none", border: "none", color: "#FF5500", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px" }}
                aria-label="Open Menu"
              >
                <Menu size={32} />
              </button>
            ) : (
              <div style={{ display: "flex", gap: navGap, alignItems: "center" }}>
                <Link href="/gallery" style={{ textDecoration: "none" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9, cursor: "pointer", transition: "color 0.2s" }}>Gallery</span>
                </Link>
                <Link href="/reviews" style={{ textDecoration: "none" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9, cursor: "pointer", transition: "color 0.2s" }}>Reviews</span>
                </Link>
                <span onClick={() => handleNavClick(true)} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FF5500", fontWeight: "bold", opacity: 0.9, cursor: "pointer" }}>Contact</span>
              </div>
            )}
          </div>
        </nav>

        {/* ═══ MOBILE HAMBURGER MENU OVERLAY (z: 200) ═══ */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: "rgba(10, 6, 8, 0.98)",
          backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <button 
            onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", top: navPadY, right: navPadX, background: "none", border: "none", color: "#FF5500", cursor: "pointer", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close Menu"
          >
            <X size={36} />
          </button>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center", transform: menuOpen ? "translateY(0)" : "translateY(20px)", transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <Link href="/gallery" onClick={() => handleNavClick()} style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "0.1em", color: "#F5EDD8" }}>GALLERY</span>
            </Link>
            <Link href="/reviews" onClick={() => handleNavClick()} style={{ textDecoration: "none" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "0.1em", color: "#F5EDD8" }}>REVIEWS</span>
            </Link>
            <span onClick={() => handleNavClick(true)} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "0.1em", color: "#FF5500", cursor: "pointer" }}>CONTACT</span>
          </div>
        </div>

        {/* Top Fade (z: 45) */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "42vh", background: "linear-gradient(to bottom, rgba(10,6,8,0.8) 0%, transparent 100%)", pointerEvents: "none", zIndex: 45 }} />

        {/* Layer 1: World BG (z: 0) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `scale(${worldScale}) translate3d(${-mx * 6}px, ${-my * 6}px, 0)`, willChange: "transform", zIndex: 0 }}>
          <img src={WORLD_BG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) contrast(1.2)" }} />
        </div>

        {/* Layer 1.2: Coal BG (z: 1) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `scale(${worldScale}) translate3d(${-mx * 6}px, ${-my * 6}px, 0)`, opacity: coalOpacity, willChange: "transform, opacity", zIndex: 1 }}>
          <img src="/images/coal.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) contrast(1.1)" }} />
        </div>

        {/* Layer 2: Bottom Clouds (z: 10) */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, transformOrigin: "50% 100%", transform: `scale(${cloudsScale}) translate3d(${-mx * 9}px, ${-my * 9 * 0.4}px, 0)`, opacity: lerp(0.5, 1.0, clamp(scrollProgress / 0.05, 0, 1)), filter: fireFilter, willChange: "transform", zIndex: 10 }}>
          <img src={BOTTOM_CLOUDS} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* Layer 2.5: Arc Slider (z: 9) */}
        <div style={{ position: "absolute", bottom: arcSliderBottom, left: 0, right: 0, opacity: scene2Opacity, willChange: "opacity", zIndex: 9, pointerEvents: scene2Opacity > 0.1 ? "auto" : "none" }}>
          <ArcCardSlider cards={SCENE2_CARDS} rotationOffset={sliderRotationOffset} tier={tier} />
        </div>

        {/* Layer 3: Portal (z: 15) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "52% 38%", transform: `scale(${portalScale}) translate3d(${-mx * 7}px, ${-my * 7}px, 0)`, opacity: portalOpacity, filter: fireFilter, willChange: "transform, opacity", zIndex: 15 }}>
          <img src={PORTAL_BG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Bottom Fade (z: 16) */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(10,6,8,0.8) 0%, transparent 100%)", pointerEvents: "none", zIndex: 16 }} />

        {/* Curtain Left (z: 16) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "left center", transform: `translate3d(${curtainLX}%, 0, 0) scale(${lerp(1, 1.3, ep)}) translate3d(${-mx * 14}px, ${-my * 14 * 0.3}px, 0)`, transition: curtainTrans, willChange: "transform", filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)", zIndex: 16 }}>
          <img src={CURTAIN_LEFT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />
        </div>

        {/* Curtain Right (z: 16) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "right center", transform: `translate3d(${curtainRX}%, 0, 0) scale(${lerp(1, 1.3, ep)}) translate3d(${-mx * 14}px, ${-my * 14 * 0.3}px, 0)`, transition: curtainTrans, willChange: "transform", filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)", zIndex: 16 }}>
          <img src={CURTAIN_RIGHT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center" }} />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 1 UI: HERO (z: 20)                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 20, opacity: scene1Opacity, pointerEvents: scene1Opacity > 0.1 ? "auto" : "none" }}>

          {/* ── Mobile Hero ── */}
          {tierIsMobile(tier) && (
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                height: "100%",
                padding: isLandscape ? "60px 20px 40px" : '100px 20px 60px',
                opacity: uiVisible ? 0.9 : 0,
                transform: uiVisible ? "translate3d(0,0,0)" : "translate3d(0,20px,0)",
                transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
              }}
            >
              <div style={{ textAlign: "center", marginTop: isLandscape ? "4vh" : "15vh" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(30px, 8vw, 50px)", letterSpacing: "0.12em", color: "#FF5500", margin: 0 }}>
                  STAR <span style={{ color: "#F5EDD8", fontSize: "0.8em" }}>›</span> BBQ
                </h2>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 12vw, 80px)", lineHeight: 1.0, color: "#F5EDD8", margin: "8px 0 16px 0", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
                  FIRE-CRAFTED
                </h1>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(15px, 4vw, 18px)', lineHeight: "1.6", color: "rgba(245,237,216,0.9)", maxWidth: "340px", margin: "0 auto", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
                  Hyderabad&apos;s finest fire kitchen. Slow-marinated, live-flame grilled. No gas, no shortcuts.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <InfoCard image={SCENE1_CARDS[1]} size={heroCardSize} value="800°" label="Charcoal Temp" valueFS={heroTempFS} labelFS={heroLabelFS} />
                <InfoCard image={SCENE1_CARDS[0]} size={heroCardSize} value="24 Hrs" label="Slow Marinated" valueFS={heroTempFS} labelFS={heroLabelFS} />
              </div>
            </div>
          )}

          {/* ── Desktop / Tablet Hero ── */}
          {!tierIsMobile(tier) && (
            <>
              <div style={{ position: "absolute", top: "46%", left: heroTextLeft, maxWidth: heroTextMaxW, transform: "translate3d(0, -50%, 0)", opacity: uiVisible ? 1 : 0, transition: "opacity 0.9s ease 0.3s" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(30px, 5vw, 72px)", lineHeight: "1.1", letterSpacing: "0.08em", color: "#FF5500", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: 0 }}>
                  STAR <span style={{ color: "#F5EDD8" }}>›</span> BBQ
                </h2>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 7vw, 110px)", lineHeight: "0.9", color: "#F5EDD8", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: "12px 0 24px 0" }}>
                  FIRE-CRAFTED<br />SINCE DAY ONE
                </h1>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: heroDescFS, lineHeight: "1.6", color: "rgba(245,237,216,0.85)", maxWidth: heroTextMaxW, textShadow: "0 1px 12px rgba(0,0,0,0.8)", margin: 0 }}>
                  Hyderabad&apos;s finest fire kitchen. Slow-marinated, live-flame grilled. No gas, no shortcuts. Real charcoal BBQ.
                </p>
              </div>

              <div style={{ position: "absolute", right: heroCardRight, top: "50%", transform: "translate3d(0, -50%, 0)", display: "flex", gap: `${Math.max(10, heroCardSize * 0.08)}px`, opacity: uiVisible ? 1 : 0, transition: "opacity 0.9s ease 0.55s" }}>
                <InfoCard image={SCENE1_CARDS[1]} size={heroCardSize} value="800°" label="Charcoal Temp" valueFS={heroTempFS} labelFS={heroLabelFS} />
                <InfoCard image={SCENE1_CARDS[0]} size={heroCardSize} value="24 Hrs" label="Slow Marinated" valueFS={heroTempFS} labelFS={heroLabelFS} />
              </div>
            </>
          )}

          {/* Dots */}
          <div style={{ position: "absolute", bottom: isMobile ? "24px" : "40px", left: isMobile ? "50%" : heroTextLeft, transform: isMobile ? "translate3d(-50%, 0, 0)" : "none", display: "flex", gap: "8px", opacity: uiVisible ? 1 : 0, transition: "opacity 0.9s ease 0.8s" }}>
            {[28, 14, 14, 14].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: "4px", borderRadius: "2px", backgroundColor: i === 0 ? "#FF5500" : "rgba(255,85,0,0.3)" }} />
            ))}
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 2 UI: MENU HEADING (z: 46)                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 46, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "start", opacity: scene2Opacity, pointerEvents: scene2Opacity > 0.1 ? "auto" : "none", paddingTop: rv(tier, { 'mobile-sm': '8vh', mobile: '8vh', tablet: '6vh', laptop: '8vh', desktop: '9vh', tv: '10vh' }) }}>
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: rv(tier, { 'mobile-sm': '40px', mobile: '54px', tablet: '64px', laptop: '90px', desktop: '100px', tv: '120px' }),
              color: "#F5EDD8", letterSpacing: "0.05em", lineHeight: 1.05, textShadow: "0 2px 20px rgba(0,0,0,0.8)", margin: 0,
            }}>
              FIRE CRAFTED <span style={{ color: "#FF5500" }}>FAVOURITES</span>
            </h2>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: rv(tier, { 'mobile-sm': '15px', mobile: '18px', tablet: '18px', laptop: '22px', desktop: '24px', tv: '30px' }),
              lineHeight: "1.6", color: "rgba(245,237,216,0.85)",
              maxWidth: rv(tier, { 'mobile-sm': '280px', mobile: '360px', tablet: '400px', laptop: '500px', desktop: '600px', tv: '750px' }),
              margin: "12px auto 0 auto", textShadow: "0 1px 10px rgba(0,0,0,0.8)",
            }}>
              Singular voyages to astonishing flavor, shaped for those who seek the authentic taste of live charcoal.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 2.5: VIDEO (z: 48)                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 48, opacity: sceneVideoOpacity, pointerEvents: sceneVideoOpacity > 0.1 ? "auto" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0608" }}>
          <video src="/Demo 2.mp4" autoPlay loop muted playsInline style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 20%, rgba(10,6,8,0.7) 100%), linear-gradient(to top, rgba(10,6,8,0.9) 0%, transparent 40%, transparent 60%, rgba(10,6,8,0.9) 100%)", zIndex: 1 }} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: rv(tier, { 'mobile-sm': '360px', mobile: '420px', tablet: '600px', laptop: '800px', desktop: '900px', tv: '1100px' }), display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 20px" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: rv(tier, { 'mobile-sm': '14px', mobile: '16px', tablet: '16px', laptop: '18px', desktop: '20px', tv: '24px' }), letterSpacing: "0.4em", color: "#FF5500", fontWeight: "bold", textTransform: "uppercase", marginBottom: "16px" }}>The Fire Craft</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: rv(tier, { 'mobile-sm': '36px', mobile: '48px', tablet: '56px', laptop: '80px', desktop: '100px', tv: '120px' }), color: "#F5EDD8", letterSpacing: "0.03em", lineHeight: 0.95, margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
              CRAFTED BY <span style={{ color: "#FF5500" }}>HEAT & EMBER</span>
            </h2>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: rv(tier, { 'mobile-sm': '15px', mobile: '18px', tablet: '18px', laptop: '22px', desktop: '24px', tv: '30px' }), lineHeight: "1.6", color: "rgba(245,237,216,0.85)", maxWidth: rv(tier, { 'mobile-sm': '300px', mobile: '380px', tablet: '480px', laptop: '600px', desktop: '700px', tv: '850px' }), margin: "24px auto 36px auto", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              Watch the dance of fire and charcoal. No shortcuts, no compromise. Only genuine flame-kissed gastronomy.
            </p>
            <div style={{ display: "flex", gap: rv(tier, { 'mobile-sm': '8px', mobile: '16px', tablet: '20px', laptop: '28px', desktop: '36px', tv: '44px' }), flexWrap: "wrap", justifyContent: "center" }}>
              {[{ title: "800° HEAT", desc: "Live Oak Charcoal" }, { title: "24HR PREP", desc: "Slow Marination" }, { title: "100% RAW", desc: "No Gas Cookers" }].map((item, i) => (
                <div key={i} style={{ border: "1px solid rgba(255,85,0,0.3)", backgroundColor: "rgba(10,6,8,0.6)", backdropFilter: "blur(8px)", borderRadius: rv(tier, { 'mobile-sm': '12px', mobile: '16px', tablet: '16px', laptop: '16px', desktop: '18px', tv: '20px' }), padding: rv(tier, { 'mobile-sm': '10px 14px', mobile: '14px 20px', tablet: '12px 18px', laptop: '14px 24px', desktop: '16px 28px', tv: '20px 36px' }), minWidth: rv(tier, { 'mobile-sm': '130px', mobile: '110px', tablet: '110px', laptop: '120px', desktop: '140px', tv: '170px' }), textAlign: "center" as const }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: rv(tier, { 'mobile-sm': '18px', mobile: '22px', tablet: '20px', laptop: '24px', desktop: '28px', tv: '34px' }), color: "#FF5500", letterSpacing: "0.05em" }}>{item.title}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: rv(tier, { 'mobile-sm': '11px', mobile: '12px', tablet: '12px', laptop: '13px', desktop: '14px', tv: '17px' }), color: "rgba(245,237,216,0.6)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginTop: "4px" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 3: CONTACT (z: 60)                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 60, opacity: scene3Opacity, pointerEvents: scene3Opacity > 0.1 ? "auto" : "none", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `rgba(10,6,8,${scene3Opacity * 0.96})`, backdropFilter: `blur(${scene3Opacity * 12}px)`, backgroundImage: "radial-gradient(circle at center, transparent 10%, #0a0608 85%), linear-gradient(rgba(255,85,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.02) 1px, transparent 1px)", backgroundSize: "100% 100%, 40px 40px, 40px 40px", overflowY: "auto", overflowX: "hidden" }}>
          <ContactUI tier={tier} isMobile={isMobile} />
        </div>

        {/* ═══ Navbar Logo (small, stays after splash, moved up to avoid text clash) ═══ */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${logoFinalSize / 2 + 10}px`,
            transform: "translate3d(-50%, -50%, 0)",
            width: `${logoFinalSize}px`,
            height: `${logoFinalSize}px`,
            zIndex: 51,
            pointerEvents: "none",
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #FF5500",
            boxShadow: "0 0 15px rgba(255, 85, 0, 0.5)",
            opacity: clamp((scrollProgress - 0.08) / 0.06, 0, 1),
            willChange: "opacity"
          }}
        >
          <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// InfoCard Component — reusable hero stat card
// ═══════════════════════════════════════════════════════════════
function InfoCard({ image, size, value, label, valueFS, labelFS }: { image: string; size: number; value: string; label: string; valueFS: number; labelFS: string }) {
  return (
    <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: "22px", backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 32px rgba(255,85,0,0.2)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
      <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
        <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: `${valueFS}px`, lineHeight: "1.0" }}>{value}</span>
        <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: labelFS, opacity: 0.9 }}>{label}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Arc Card Slider — fully responsive
// ═══════════════════════════════════════════════════════════════
interface ArcSliderProps { cards: typeof SCENE2_CARDS; rotationOffset: number; tier: DeviceTier; }

function ArcCardSlider({ cards, rotationOffset, tier }: ArcSliderProps) {
  // Tightened mobile radii and dimensions to prevent edge clipping on 320px
  const cardSpacingDeg = rv(tier, { 'mobile-sm': 18, mobile: 14, tablet: 10, laptop: 9, desktop: 8, tv: 7 });
  const arcRadius = rv(tier, { 'mobile-sm': 500, mobile: 1000, tablet: 1400, laptop: 1800, desktop: 2200, tv: 3000 });
  const cardW = rv(tier, { 'mobile-sm': 130, mobile: 170, tablet: 210, laptop: 260, desktop: 300, tv: 380 });
  const cardH = rv(tier, { 'mobile-sm': 170, mobile: 220, tablet: 260, laptop: 320, desktop: 370, tv: 460 });
  const containerH = rv(tier, { 'mobile-sm': '230px', mobile: '290px', tablet: '330px', laptop: '400px', desktop: '440px', tv: '560px' });
  const cardBR = rv(tier, { 'mobile-sm': '16px', mobile: '20px', tablet: '22px', laptop: '28px', desktop: '30px', tv: '36px' });
  const titleFS = rv(tier, { 'mobile-sm': '18px', mobile: '22px', tablet: '26px', laptop: '32px', desktop: '36px', tv: '44px' });
  const descFS = rv(tier, { 'mobile-sm': '11px', mobile: '13px', tablet: '14px', laptop: '16px', desktop: '18px', tv: '22px' });
  const pad = rv(tier, { 'mobile-sm': '10px', mobile: '14px', tablet: '18px', laptop: '24px', desktop: '28px', tv: '36px' });
  const badgeSz = rv(tier, { 'mobile-sm': 20, mobile: 26, tablet: 28, laptop: 28, desktop: 32, tv: 38 });
  const bottomOffset = rv(tier, { 'mobile-sm': 50, mobile: 80, tablet: 100, laptop: 120, desktop: 140, tv: 180 });

  const centerIdx = Math.floor(cards.length / 2);

  return (
    <div style={{ position: "relative", width: "100%", height: containerH, display: "flex", justifyContent: "center" }}>
      {cards.map((card, i) => {
        const baseDeg = (i - centerIdx) * cardSpacingDeg;
        const deg = baseDeg - rotationOffset + (centerIdx * cardSpacingDeg);
        const rad = (deg * Math.PI) / 180;
        const x = Math.sin(rad) * arcRadius;
        const y = arcRadius - Math.cos(rad) * arcRadius;
        const idx = String(i + 1).padStart(2, "0");

        return (
          <div key={i} style={{ position: "absolute", bottom: `${-y + bottomOffset}px`, left: `calc(50% + ${x}px - ${cardW / 2}px)`, width: `${cardW}px`, height: `${cardH}px`, borderRadius: cardBR, boxShadow: "0 12px 40px rgba(255,85,0,0.15)", transform: `rotate(${deg}deg) translateZ(0)`, transformOrigin: `${cardW / 2}px ${arcRadius}px`, overflow: "hidden", display: "flex", flexDirection: "column", backgroundImage: `url(${card.image})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,85,0,0.2)", willChange: "transform" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,6,8,0.95) 0%, rgba(10,6,8,0.4) 50%, transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2, padding: pad, display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: `${badgeSz}px`, height: `${badgeSz}px`, borderRadius: "50%", border: "1.5px solid rgba(255,85,0,0.5)", color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: `${Math.max(12, badgeSz * 0.5)}px`, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,6,8,0.6)", backdropFilter: "blur(4px)" }}>{idx}</div>
            </div>
            <div style={{ position: "relative", zIndex: 2, marginTop: "auto", padding: pad, textAlign: "left" }}>
              <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: titleFS, letterSpacing: "0.05em", lineHeight: 1.1, margin: "0 0 4px 0", color: "#F5EDD8" }}>{card.title}</h4>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: descFS, lineHeight: 1.4, color: "rgba(245,237,216,0.75)", margin: 0 }}>{card.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Contact UI — Redesigned for Premium Fire Theme
// ═══════════════════════════════════════════════════════════════
function ContactUI({ tier, isMobile }: { tier: DeviceTier; isMobile: boolean }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [btnHover, setBtnHover] = useState(false);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setIsSending(true);
    const text = `*New Portfolio Inquiry* 🍢\n\n👤 *Name:* ${formData.name}\n📞 *Mobile:* ${formData.phone}\n✉️ *Email:* ${formData.email}\n💬 *Message:* \n${formData.message}`;
    setTimeout(() => {
      window.open(`https://wa.me/918985925737?text=${encodeURIComponent(text)}`, "_blank");
      setIsSending(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 800);
  };

  const fieldStyle = (name: string): CSSProperties => ({
    width: "100%", borderRadius: "12px",
    padding: `${rv(tier, { 'mobile-sm': '12px', mobile: '14px', tablet: '14px', laptop: '16px', desktop: '16px', tv: '20px' })} 16px ${rv(tier, { 'mobile-sm': '12px', mobile: '14px', tablet: '14px', laptop: '16px', desktop: '16px', tv: '20px' })} 48px`,
    fontSize: rv(tier, { 'mobile-sm': '15px', mobile: '16px', tablet: '16px', laptop: '16px', desktop: '18px', tv: '22px' }),
    color: "#fff", backgroundColor: "rgba(10,6,8,0.7)",
    border: focusedField === name ? "1px solid #FF5500" : "1px solid rgba(255,85,0,0.2)",
    boxShadow: focusedField === name ? "0 0 20px rgba(255,85,0,0.15)" : "none",
    outline: "none", fontFamily: "'Barlow Condensed', sans-serif", transition: "all 0.3s ease",
  });

  const containerMaxW = rv(tier, { 'mobile-sm': '100%', mobile: '100%', tablet: '680px', laptop: '700px', desktop: '800px', tv: '1000px' });
  const containerPx = rv(tier, { 'mobile-sm': '16px', mobile: '24px', tablet: '28px', laptop: '24px', desktop: '32px', tv: '48px' });
  const headingFS = rv(tier, { 'mobile-sm': '40px', mobile: '48px', tablet: '56px', laptop: '64px', desktop: '72px', tv: '90px' });

  return (
    <div style={{ width: "100%", maxWidth: containerMaxW, padding: `0 ${containerPx}`, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: isMobile ? "24px" : "48px" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: headingFS, color: "#F5EDD8", letterSpacing: "0.05em", margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
          GET IN <span style={{ color: "#FF5500" }}>TOUCH</span>
        </h2>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: rv(tier, { 'mobile-sm': '15px', mobile: '18px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '26px' }), color: "rgba(245,237,216,0.8)", marginTop: "12px", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>Connect with our fire masters directly via WhatsApp.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", borderRadius: "24px", padding: rv(tier, { 'mobile-sm': '20px', mobile: '32px', tablet: '40px', laptop: '48px', desktop: '56px', tv: '70px' }), display: "flex", flexDirection: "column", gap: rv(tier, { 'mobile-sm': '14px', mobile: '20px', tablet: '24px', laptop: '24px', desktop: '28px', tv: '36px' }), border: "1px solid rgba(255,85,0,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,85,0,0.05)", backgroundColor: "rgba(20,10,10,0.6)", backdropFilter: "blur(20px)" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: rv(tier, { 'mobile-sm': '14px', mobile: '20px', tablet: '24px', laptop: '24px', desktop: '28px', tv: '36px' }) }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translate3d(0, -50%, 0)", color: "rgba(255,85,0,0.7)", zIndex: 10, display: "flex" }}><User style={{ width: 18, height: 18 }} /></span>
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} style={fieldStyle("name")} placeholder="Full Name" />
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translate3d(0, -50%, 0)", color: "rgba(255,85,0,0.7)", zIndex: 10, display: "flex" }}><Phone style={{ width: 18, height: 18 }} /></span>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} style={fieldStyle("phone")} placeholder="Mobile Number" />
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translate3d(0, -50%, 0)", color: "rgba(255,85,0,0.7)", zIndex: 10, display: "flex" }}><Mail style={{ width: 18, height: 18 }} /></span>
            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} style={fieldStyle("email")} placeholder="Email Address" />
          </div>

          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "18px", color: "rgba(255,85,0,0.7)", zIndex: 10, display: "flex" }}><MessageSquare style={{ width: 18, height: 18 }} /></span>
            <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} onFocus={() => setFocusedField("message")} onBlur={() => setFocusedField(null)} rows={isMobile ? 3 : 4} style={{ ...fieldStyle("message"), paddingTop: "18px", resize: "none" }} placeholder="Your message..." />
          </div>

          <button type="submit" disabled={isSending} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)} style={{ width: "100%", marginTop: "12px", padding: rv(tier, { 'mobile-sm': '16px', mobile: '18px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '28px' }), backgroundColor: btnHover ? "#FF4400" : "#FF5500", borderRadius: "12px", color: "#fff", fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: rv(tier, { 'mobile-sm': '16px', mobile: '18px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '26px' }), fontFamily: "'Bebas Neue', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", border: "none", cursor: isSending ? "not-allowed" : "pointer", opacity: isSending ? 0.7 : 1, boxShadow: btnHover ? "0 0 30px rgba(255,85,0,0.6)" : "0 8px 25px rgba(255,85,0,0.3)", transition: "all 0.3s ease" }}>
            {isSending ? "Initiating..." : "Send Request"} <Send style={{ width: 18, height: 18 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
