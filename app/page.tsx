"use client";

import { useEffect, useRef, useState, useMemo, CSSProperties } from "react";
import { Send, User, Mail, MessageSquare, FileText, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  { title: 'BBQ Mutton Seekh', desc: 'Hand-minced with charred onions & 7-spice', image: '/frames/ezgif-frame-018.jpg' },
  { title: 'Star Special Platter', desc: 'Half chicken, 2 seekh, shawarma, fries & drinks', image: '/frames/ezgif-frame-072.jpg' },
  { title: 'Tandoor Fish Tikka', desc: 'Fresh Rawas fillet, turmeric-ajwain marinade', image: '/frames/ezgif-frame-045.jpg' },
  { title: 'Chicken Malai Boti', desc: 'Cashew-cream marinade, pale gold perfection', image: '/frames/ezgif-frame-054.jpg' }
];

// Helper functions
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

// ═══════════════════════════════════════════════════════════════
// RESPONSIVE HOOKS
// ═══════════════════════════════════════════════════════════════

type DeviceTier = 'mobile-sm' | 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';

function useBreakpoint(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('laptop');

  useEffect(() => {
    const evaluate = () => {
      const w = window.innerWidth;
      if (w < 480) return 'mobile-sm';
      if (w < 768) return 'mobile';
      if (w < 1024) return 'tablet';
      if (w < 1536) return 'laptop';
      if (w < 2560) return 'desktop';
      return 'tv';
    };

    const update = () => setTier(evaluate());
    update();

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return tier;
}

function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isLandscape;
}

// Convenience: is the device mobile-ish (for existing mobile/desktop splits)?
function tierIsMobile(tier: DeviceTier): boolean {
  return tier === 'mobile-sm' || tier === 'mobile';
}

// Get responsive value based on tier
function responsiveVal<T>(tier: DeviceTier, values: { 'mobile-sm': T; mobile: T; tablet: T; laptop: T; desktop: T; tv: T }): T {
  return values[tier];
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const tier = useBreakpoint();
  const isLandscape = useIsLandscape();
  const isMobile = tierIsMobile(tier);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Entrance Sequence States
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);

  // Parallax Refs
  const worldRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const curtainLRef = useRef<HTMLDivElement>(null);
  const curtainRRef = useRef<HTMLDivElement>(null);

  // Scroll container height — adaptive to aspect ratio
  const scrollHeight = useMemo(() => {
    if (typeof window === 'undefined') return '600vh';
    // Wide screens need more scroll, tall screens need less
    if (tier === 'tv') return '650vh';
    if (tier === 'desktop') return '620vh';
    if (isLandscape && isMobile) return '700vh'; // phone landscape needs more
    return '600vh';
  }, [tier, isLandscape, isMobile]);

  // Scroll Progress Listener
  useEffect(() => {
    let animId: number;

    const updateScroll = () => {
      const container = document.getElementById("outer-container");
      if (container) {
        const progress = window.scrollY / (container.scrollHeight - window.innerHeight);
        setScrollProgress(clamp(progress, 0, 1));
      }
      animId = requestAnimationFrame(updateScroll);
    };

    animId = requestAnimationFrame(updateScroll);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Entrance triggers
  useEffect(() => {
    const t1 = setTimeout(() => setCurtainsOpen(true), 100);
    const t2 = setTimeout(() => setUiVisible(true), 600);
    const t3 = setTimeout(() => setEntranceDone(true), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Smooth Mouse Parallax Loop (desktop/laptop only)
  useEffect(() => {
    const mouse = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const mq = window.matchMedia("(pointer: fine)");
    if (mq.matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    let animId: number;
    const update = () => {
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.07;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.07;
      setMousePos({ x: mouse.currentX, y: mouse.currentY });
      animId = requestAnimationFrame(update);
    };
    update();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION TIMELINE & MATH
  // ═══════════════════════════════════════════════════════════════
  const ep = easeInOut(scrollProgress);

  // SCENE 1 (Hero): 0% to 20%
  const scene1Opacity = clamp(1 - scrollProgress / 0.18, 0, 1);

  // SCENE 2 (Arc Slider): Fades in 22%-30%, Fades out 55%-62%
  let scene2Opacity = 0;
  if (scrollProgress >= 0.22 && scrollProgress <= 0.55) {
    scene2Opacity = clamp((scrollProgress - 0.22) / 0.08, 0, 1);
  } else if (scrollProgress > 0.55) {
    scene2Opacity = clamp(1 - (scrollProgress - 0.55) / 0.07, 0, 1);
  }

  // SCENE 2.5 (Video Section): Fades in 62%-68%, Fades out 78%-84%
  let sceneVideoOpacity = 0;
  if (scrollProgress >= 0.62 && scrollProgress <= 0.78) {
    sceneVideoOpacity = clamp((scrollProgress - 0.62) / 0.06, 0, 1);
  } else if (scrollProgress > 0.78) {
    sceneVideoOpacity = clamp(1 - (scrollProgress - 0.78) / 0.06, 0, 1);
  }

  // SCENE 3 (Contact): Fades in 84%-90%
  const scene3Opacity = clamp((scrollProgress - 0.84) / 0.06, 0, 1);

  // Background scales
  const worldScale = lerp(1, 1.3, ep);
  const cloudsScale = lerp(1, 1.5, ep);
  const portalScale = lerp(1, 7.5, ep);

  // Portal opacity: fades out 25%-40%
  const portalOpacity = clamp(1 - (scrollProgress - 0.25) / 0.15, 0, 1);

  // Arc Slider rotation progress (0 to 1 between 30% and 55%)
  const sliderProg = clamp((scrollProgress - 0.30) / 0.25, 0, 1);
  const cardSpacingDeg = responsiveVal(tier, {
    'mobile-sm': 15, mobile: 12, tablet: 10, laptop: 9, desktop: 8, tv: 7
  });
  const arcSweepDeg = (SCENE2_CARDS.length - 1) * cardSpacingDeg;
  const sliderRotationOffset = lerp(0, arcSweepDeg, sliderProg);

  // Floating Logo Anim calculations — responsive
  const logoProg = clamp(scrollProgress / 0.18, 0, 1);
  const logoT = easeInOut(logoProg);
  const logoInitSize = responsiveVal(tier, {
    'mobile-sm': 70, mobile: 90, tablet: 110, laptop: 130, desktop: 150, tv: 180
  });
  const logoFinalSize = responsiveVal(tier, {
    'mobile-sm': 36, mobile: 42, tablet: 44, laptop: 48, desktop: 52, tv: 60
  });
  const logoTargetY = responsiveVal(tier, {
    'mobile-sm': 32, mobile: 38, tablet: 40, laptop: 46, desktop: 48, tv: 54
  });
  const logoSize = lerp(logoInitSize, logoFinalSize, logoT);
  const logoBorderWidth = lerp(isMobile ? 3 : 4, 2, logoT);
  const logoShadowBlur = lerp(isMobile ? 25 : 35, 15, logoT);
  const logoShadowOpacity = lerp(0.8, 0.5, logoT);

  // Mouse Parallax offsets — reduce on touch devices
  const parallaxIntensity = isMobile ? 0 : (tier === 'tablet' ? 0.5 : 1);
  const mx = mousePos.x * parallaxIntensity;
  const my = mousePos.y * parallaxIntensity;

  // Filter to make reference assets look like fire/smoke
  const fireFilter = "sepia(1) hue-rotate(-20deg) saturate(2) brightness(0.6)";

  const worldStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: "50% 50%",
    transform: `scale(${worldScale}) translate(${-mx * 6}px, ${-my * 6}px)`,
    zIndex: 0,
  };

  let coalOpacity = 0;
  if (scrollProgress >= 0.20 && scrollProgress <= 0.55) {
    coalOpacity = clamp((scrollProgress - 0.20) / 0.08, 0, 1);
  } else if (scrollProgress > 0.55) {
    coalOpacity = clamp(1 - (scrollProgress - 0.55) / 0.07, 0, 1);
  }
  const coalStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: "50% 50%",
    transform: `scale(${worldScale}) translate(${-mx * 6}px, ${-my * 6}px)`,
    opacity: coalOpacity,
    zIndex: 1,
  };

  const cloudOpacity = lerp(0.5, 1.0, clamp(scrollProgress / 0.05, 0, 1));
  const cloudsStyle: CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    transformOrigin: "50% 100%",
    transform: `scale(${cloudsScale}) translate(${-mx * 9}px, ${-my * 9 * 0.4}px)`,
    opacity: cloudOpacity,
    filter: fireFilter,
    zIndex: 10,
  };

  const portalStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: "52% 38%",
    transform: `scale(${portalScale}) translate(${-mx * 7}px, ${-my * 7}px)`,
    opacity: portalOpacity,
    filter: fireFilter,
    zIndex: 15,
  };

  const curtainLTranslateX = !entranceDone
    ? curtainsOpen ? -62 : 0
    : -62 - lerp(0, 150, ep);

  const curtainRTranslateX = !entranceDone
    ? curtainsOpen ? 62 : 0
    : 62 + lerp(0, 150, ep);

  const curtainTransition = !entranceDone ? "transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)" : "none";

  const curtainLStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: "left center",
    transform: `translate(${curtainLTranslateX}%, 0%) scale(${lerp(1, 1.3, ep)}) translate(${-mx * 14}px, ${-my * 14 * 0.3}px)`,
    transition: curtainTransition,
    filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)",
    zIndex: 16,
  };

  const curtainRStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    transformOrigin: "right center",
    transform: `translate(${curtainRTranslateX}%, 0%) scale(${lerp(1, 1.3, ep)}) translate(${-mx * 14}px, ${-my * 14 * 0.3}px)`,
    transition: curtainTransition,
    filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)",
    zIndex: 16,
  };

  // Responsive nav values
  const navPadX = responsiveVal(tier, {
    'mobile-sm': '12px', mobile: '16px', tablet: '24px', laptop: '40px', desktop: '48px', tv: '64px'
  });
  const navPadY = responsiveVal(tier, {
    'mobile-sm': '12px', mobile: '14px', tablet: '16px', laptop: '20px', desktop: '22px', tv: '28px'
  });
  const navFontSize = responsiveVal(tier, {
    'mobile-sm': '12px', mobile: '13px', tablet: '14px', laptop: '15px', desktop: '16px', tv: '20px'
  });
  const navGap = responsiveVal(tier, {
    'mobile-sm': '16px', mobile: '20px', tablet: '24px', laptop: '32px', desktop: '40px', tv: '52px'
  });

  // Responsive hero values
  const heroTextLeft = responsiveVal(tier, {
    'mobile-sm': '24px', mobile: '24px', tablet: '36px', laptop: '52px', desktop: '72px', tv: '100px'
  });
  const heroTextMaxW = responsiveVal(tier, {
    'mobile-sm': '280px', mobile: '300px', tablet: '340px', laptop: '420px', desktop: '520px', tv: '660px'
  });
  const heroCardSize = responsiveVal(tier, {
    'mobile-sm': 120, mobile: 140, tablet: 150, laptop: 160, desktop: 190, tv: 240
  });
  const heroCardRight = responsiveVal(tier, {
    'mobile-sm': '16px', mobile: '20px', tablet: '28px', laptop: '40px', desktop: '60px', tv: '100px'
  });
  const heroDescFontSize = responsiveVal(tier, {
    'mobile-sm': '14px', mobile: '15px', tablet: '17px', laptop: '20px', desktop: '22px', tv: '28px'
  });
  const heroCardTempFontSize = responsiveVal(tier, {
    'mobile-sm': 28, mobile: 36, tablet: 38, laptop: 40, desktop: 46, tv: 56
  });
  const heroCardLabelFontSize = responsiveVal(tier, {
    'mobile-sm': '11px', mobile: '12px', tablet: '13px', laptop: '14px', desktop: '15px', tv: '18px'
  });

  // Arc slider bottom offset
  const arcSliderBottom = responsiveVal(tier, {
    'mobile-sm': '10px', mobile: '20px', tablet: '24px', laptop: '30px', desktop: '36px', tv: '50px'
  });

  return (
    <div id="outer-container" style={{ height: scrollHeight, position: "relative", backgroundColor: "#0a0608" }}>

      {/* Sticky Viewport */}
      <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#0a0608" }}>

        {/* ═══ NAVIGATION BAR (z-index: 50) ═══ */}
        <nav
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
            padding: `${navPadY} ${navPadX}`,
          }}
        >
          {/* Mobile Nav Links (< tablet) */}
          {isMobile && (
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FF5500", opacity: 0.9 }}>
                Menu
              </span>
              <div style={{ width: `${logoFinalSize}px`, height: `${logoFinalSize}px`, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FF5500", opacity: 0.9 }}>
                Contact
              </span>
            </div>
          )}

          {/* Desktop Nav Links (>= tablet) */}
          {!isMobile && (
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: navGap }}>
                {["Our Story", "Menu", "Craft"].map((link) => (
                  <span key={link} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9, cursor: "pointer" }}>
                    {link}
                  </span>
                ))}
              </div>
              <div style={{ width: `${logoFinalSize}px`, height: `${logoFinalSize}px`, flexShrink: 0 }} />
              <div style={{ display: "flex", gap: navGap }}>
                {["Gallery", "Reviews", "Contact"].map((link) => (
                  <span key={link} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: navFontSize, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9, cursor: "pointer" }}>
                    {link}
                  </span>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Top Fade Gradient (z-index: 45) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "42vh",
            background: "linear-gradient(to bottom, rgba(10,6,8,0.8) 0%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 45,
          }}
        />

        {/* Layer 1: World Background (z-index: 0) */}
        <div ref={worldRef} style={worldStyle}>
          <img src={WORLD_BG} alt="World Background" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) contrast(1.2)" }} />
        </div>

        {/* Layer 1.2: Coal Background (z-index: 1) */}
        <div style={coalStyle}>
          <img src="/images/coal.jpg" alt="Coal Background" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) contrast(1.1)" }} />
        </div>

        {/* Layer 2: Bottom Clouds (z-index: 10) */}
        <div ref={cloudsRef} style={cloudsStyle}>
          <img src={BOTTOM_CLOUDS} alt="Bottom Clouds" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* Layer 2.5: Arc Card Slider (z-index: 9) */}
        <div
          style={{
            position: "absolute",
            bottom: arcSliderBottom,
            left: 0,
            right: 0,
            opacity: scene2Opacity,
            zIndex: 9,
            pointerEvents: scene2Opacity > 0.1 ? "auto" : "none",
            transition: "opacity 0.4s ease",
          }}
        >
          <ArcCardSlider cards={SCENE2_CARDS} rotationOffset={sliderRotationOffset} tier={tier} />
        </div>

        {/* Layer 3: Portal Frame (z-index: 15) */}
        <div ref={portalRef} style={portalStyle}>
          <img src={PORTAL_BG} alt="Portal Frame" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Layer 3.5: Bottom Fade (z-index: 16) */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to top, rgba(10,6,8,0.8) 0%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 16,
          }}
        />

        {/* Layer 4L: Curtain Left (z-index: 16) */}
        <div ref={curtainLRef} style={curtainLStyle}>
          <img src={CURTAIN_LEFT} alt="Curtain Left" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />
        </div>

        {/* Layer 4R: Curtain Right (z-index: 16) */}
        <div ref={curtainRRef} style={curtainRStyle}>
          <img src={CURTAIN_RIGHT} alt="Curtain Right" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center" }} />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 1 UI: HERO (z-index: 20)                          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            opacity: scene1Opacity,
            pointerEvents: scene1Opacity > 0.1 ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
        >
          {/* Mobile layout */}
          {isMobile && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                padding: isLandscape ? "60px 20px 40px" : `${tier === 'mobile-sm' ? '70px 16px 80px' : '80px 24px 100px'}`,
                boxSizing: "border-box",
                opacity: uiVisible ? 0.9 : 0,
                transform: uiVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
              }}
            >
              <div style={{ textAlign: "center", marginTop: isLandscape ? "4vh" : "12vh" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 9vw, 50px)", letterSpacing: "0.12em", color: "#FF5500", margin: 0 }}>
                  STAR <span style={{ color: "#F5EDD8", fontSize: "0.8em" }}>›</span> BBQ
                </h2>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 14vw, 80px)", lineHeight: 1.0, color: "#F5EDD8", margin: "8px 0 16px 0" }}>
                  FIRE-CRAFTED
                </h1>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: tier === 'mobile-sm' ? '14px' : '16px', lineHeight: "1.6", color: "rgba(245,237,216,0.7)", maxWidth: "280px", margin: "0 auto" }}>
                  Hyderabad&apos;s finest fire kitchen. Slow-marinated, live-flame grilled. No gas, no shortcuts. Real charcoal BBQ.
                </p>
              </div>

              <div style={{
                width: `${heroCardSize}px`,
                height: `${heroCardSize}px`,
                borderRadius: "22px",
                backgroundImage: `url(${SCENE1_CARDS[1]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 8px 32px rgba(255,85,0,0.2)",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
                <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: `${heroCardTempFontSize}px`, lineHeight: "1.0" }}>800°</span>
                  <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: heroCardLabelFontSize, opacity: 0.9 }}>Charcoal Temp</span>
                </div>
              </div>
            </div>
          )}

          {/* Desktop / Tablet layout */}
          {!isMobile && (
            <div>
              <div
                style={{
                  position: "absolute",
                  top: "46%",
                  left: heroTextLeft,
                  maxWidth: heroTextMaxW,
                  transform: "translateY(-50%)",
                  opacity: uiVisible ? 1 : 0,
                  transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
                }}
              >
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(30px, 5vw, 72px)", lineHeight: "1.1", letterSpacing: "0.08em", color: "#FF5500", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: 0 }}>
                  STAR <span style={{ color: "#F5EDD8" }}>›</span> BBQ
                </h2>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 7vw, 110px)", lineHeight: "0.9", color: "#F5EDD8", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: "12px 0 24px 0" }}>
                  FIRE-CRAFTED<br />SINCE DAY ONE
                </h1>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: heroDescFontSize, lineHeight: "1.6", color: "rgba(245,237,216,0.85)", maxWidth: heroTextMaxW, textShadow: "0 1px 12px rgba(0,0,0,0.8)", margin: 0 }}>
                  Hyderabad&apos;s finest fire kitchen. Slow-marinated, live-flame grilled. No gas, no shortcuts. Real charcoal BBQ.
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  right: heroCardRight,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  gap: `${Math.max(10, heroCardSize * 0.08)}px`,
                  opacity: uiVisible ? 1 : 0,
                  transition: "opacity 0.9s ease 0.55s, transform 0.9s ease 0.55s",
                }}
              >
                {/* Card 1: 800 Degree Temp */}
                <div style={{ width: `${heroCardSize}px`, height: `${heroCardSize}px`, borderRadius: "24px", backgroundImage: `url(${SCENE1_CARDS[1]})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 32px rgba(255,85,0,0.2)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
                  <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: `${heroCardTempFontSize}px`, lineHeight: "1.0" }}>800°</span>
                    <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: heroCardLabelFontSize, opacity: 0.9 }}>Charcoal Temp</span>
                  </div>
                </div>

                {/* Card 2: 24hr Marination */}
                <div style={{ width: `${heroCardSize}px`, height: `${heroCardSize}px`, borderRadius: "24px", backgroundImage: `url(${SCENE1_CARDS[0]})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 32px rgba(255,85,0,0.2)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
                  <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: `${heroCardTempFontSize}px`, lineHeight: "1.0" }}>24 Hrs</span>
                    <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: heroCardLabelFontSize, opacity: 0.9 }}>Slow Marinated</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slider Dots */}
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? "28px" : "40px",
              left: isMobile ? "50%" : heroTextLeft,
              transform: isMobile ? "translateX(-50%)" : "none",
              display: "flex",
              gap: "8px",
              opacity: uiVisible ? 1 : 0,
              transition: "opacity 0.9s ease 0.8s",
            }}
          >
            {[28, 14, 14, 14].map((width, idx) => (
              <div
                key={idx}
                style={{
                  width: `${width}px`,
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: idx === 0 ? "#FF5500" : "rgba(255,85,0,0.3)",
                }}
              />
            ))}
          </div>

          {/* Scroll Cue (non-mobile only) */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                bottom: "36px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                opacity: uiVisible ? 1 : 0,
                transition: "opacity 0.9s ease 0.9s",
              }}
            >
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,237,216,0.6)" }}>
                Descend Into Fire
              </span>
              <div
                className="animate-bob"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255,85,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronDownIcon />
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 2 UI: MENU (z-index: 46)                          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 46,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "start",
            opacity: scene2Opacity,
            pointerEvents: scene2Opacity > 0.1 ? "auto" : "none",
            transition: "opacity 0.3s ease",
            paddingTop: responsiveVal(tier, {
              'mobile-sm': '4vh', mobile: '5vh', tablet: '6vh', laptop: '8vh', desktop: '9vh', tv: '10vh'
            }),
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: responsiveVal(tier, {
                  'mobile-sm': 'clamp(30px, 8vw, 42px)',
                  mobile: 'clamp(36px, 8vw, 50px)',
                  tablet: 'clamp(42px, 6vw, 64px)',
                  laptop: 'clamp(50px, 6.5vw, 90px)',
                  desktop: 'clamp(60px, 5vw, 100px)',
                  tv: 'clamp(72px, 4vw, 120px)',
                }),
                color: "#F5EDD8",
                letterSpacing: "0.05em",
                lineHeight: 1.05,
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                margin: 0,
              }}
            >
              FIRE-CRAFTED <span style={{ color: "#FF5500" }}>FAVOURITES</span>
            </h2>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: responsiveVal(tier, {
                  'mobile-sm': '14px', mobile: '16px', tablet: '18px', laptop: '22px', desktop: '24px', tv: '30px'
                }),
                lineHeight: "1.6",
                letterSpacing: "0.02em",
                color: "rgba(245,237,216,0.85)",
                maxWidth: responsiveVal(tier, {
                  'mobile-sm': '260px', mobile: '300px', tablet: '400px', laptop: '500px', desktop: '600px', tv: '750px'
                }),
                margin: "12px auto 0 auto",
                textShadow: "0 1px 10px rgba(0,0,0,0.8)",
              }}
            >
              Singular voyages to astonishing flavor, shaped for those who seek the authentic taste of live charcoal.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 2.5 UI: VIDEO BACKGROUND SECTION (z-index: 48)    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 48,
            opacity: sceneVideoOpacity,
            pointerEvents: sceneVideoOpacity > 0.1 ? "auto" : "none",
            transition: "opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0608",
          }}
        >
          {/* Background Video */}
          <video
            src="/Demo 2.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />

          {/* Vignette Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle, transparent 20%, rgba(10, 6, 8, 0.7) 100%), linear-gradient(to top, rgba(10,6,8,0.9) 0%, transparent 40%, transparent 60%, rgba(10,6,8,0.9) 100%)",
              zIndex: 1,
            }}
          />

          {/* Content Overlay */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: responsiveVal(tier, {
                'mobile-sm': '340px', mobile: '400px', tablet: '600px', laptop: '800px', desktop: '900px', tv: '1100px'
              }),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: responsiveVal(tier, {
                  'mobile-sm': '12px', mobile: '14px', tablet: '16px', laptop: '18px', desktop: '20px', tv: '24px'
                }),
                letterSpacing: "0.4em",
                color: "#FF5500",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              The Fire Craft
            </span>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: responsiveVal(tier, {
                  'mobile-sm': 'clamp(32px, 9vw, 50px)',
                  mobile: 'clamp(40px, 9vw, 60px)',
                  tablet: 'clamp(48px, 7vw, 72px)',
                  laptop: 'clamp(60px, 7vw, 100px)',
                  desktop: 'clamp(72px, 5vw, 110px)',
                  tv: 'clamp(84px, 4vw, 130px)',
                }),
                color: "#F5EDD8",
                letterSpacing: "0.03em",
                lineHeight: 0.95,
                margin: 0,
                textShadow: "0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              CRAFTED BY <span style={{ color: "#FF5500" }}>HEAT & EMBER</span>
            </h2>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: responsiveVal(tier, {
                  'mobile-sm': '14px', mobile: '16px', tablet: '18px', laptop: '22px', desktop: '24px', tv: '30px'
                }),
                lineHeight: "1.6",
                color: "rgba(245,237,216,0.85)",
                maxWidth: responsiveVal(tier, {
                  'mobile-sm': '300px', mobile: '360px', tablet: '480px', laptop: '600px', desktop: '700px', tv: '850px'
                }),
                margin: "24px auto 36px auto",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              Watch the dance of fire and charcoal. No shortcuts, no compromise. Only genuine flame-kissed gastronomy.
            </p>

            {/* Badges/Highlights */}
            <div
              style={{
                display: "flex",
                gap: responsiveVal(tier, {
                  'mobile-sm': '10px', mobile: '14px', tablet: '20px', laptop: '28px', desktop: '36px', tv: '44px'
                }),
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                { title: "800° HEAT", desc: "Live Oak Charcoal" },
                { title: "24HR PREP", desc: "Slow Marination" },
                { title: "100% RAW", desc: "No Gas Cookers" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid rgba(255, 85, 0, 0.3)",
                    backgroundColor: "rgba(10, 6, 8, 0.6)",
                    backdropFilter: "blur(8px)",
                    borderRadius: responsiveVal(tier, {
                      'mobile-sm': '12px', mobile: '14px', tablet: '16px', laptop: '16px', desktop: '18px', tv: '20px'
                    }),
                    padding: responsiveVal(tier, {
                      'mobile-sm': '8px 12px', mobile: '10px 14px', tablet: '12px 18px', laptop: '14px 24px', desktop: '16px 28px', tv: '20px 36px'
                    }),
                    minWidth: responsiveVal(tier, {
                      'mobile-sm': '85px', mobile: '100px', tablet: '110px', laptop: '120px', desktop: '140px', tv: '170px'
                    }),
                    textAlign: "center" as const,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: responsiveVal(tier, {
                        'mobile-sm': '15px', mobile: '18px', tablet: '20px', laptop: '24px', desktop: '28px', tv: '34px'
                      }),
                      color: "#FF5500",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: responsiveVal(tier, {
                        'mobile-sm': '9px', mobile: '11px', tablet: '12px', laptop: '13px', desktop: '14px', tv: '17px'
                      }),
                      color: "rgba(245, 237, 216, 0.6)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase" as const,
                      marginTop: "2px",
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 3 UI: CONTACT (z-index: 60)                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 60,
            opacity: scene3Opacity,
            pointerEvents: scene3Opacity > 0.1 ? "auto" : "none",
            transition: "opacity 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `rgba(10, 6, 8, ${scene3Opacity * 0.96})`,
            backdropFilter: `blur(${scene3Opacity * 12}px)`,
            backgroundImage: `radial-gradient(circle at center, transparent 10%, #0a0608 85%), linear-gradient(rgba(37, 211, 102, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 211, 102, 0.03) 1px, transparent 1px)`,
            backgroundSize: "100% 100%, 36px 36px, 36px 36px",
            overflowY: "auto",
          }}
        >
          <ContactUI tier={tier} isLandscape={isLandscape} />
        </div>

        {/* Floating Star Logo (Animated from portal hole to navbar) */}
        <div
          style={{
            position: "absolute",
            left: `${lerp(52, 50, logoT)}%`,
            top: `calc(${(38 * (1 - logoT))}% + ${logoTargetY * logoT}px)`,
            transform: "translate(-50%, -50%)",
            width: `${logoSize}px`,
            height: `${logoSize}px`,
            zIndex: 51,
            pointerEvents: "none",
            borderRadius: "50%",
            overflow: "hidden",
            border: `${logoBorderWidth}px solid #FF5500`,
            boxShadow: `0 0 ${logoShadowBlur}px rgba(255, 85, 0, ${logoShadowOpacity})`,
            transition: "border 0.1s ease, box-shadow 0.1s ease",
          }}
        >
          <img
            src="/logo.jpg"
            alt="Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

interface ArcSliderProps {
  cards: typeof SCENE2_CARDS;
  rotationOffset: number;
  tier: DeviceTier;
}

function ArcCardSlider({ cards, rotationOffset, tier }: ArcSliderProps) {
  const isMobile = tierIsMobile(tier);

  const cardSpacingDeg = responsiveVal(tier, {
    'mobile-sm': 15, mobile: 12, tablet: 10, laptop: 9, desktop: 8, tv: 7
  });
  const arcRadius = responsiveVal(tier, {
    'mobile-sm': 700, mobile: 1000, tablet: 1400, laptop: 1800, desktop: 2200, tv: 3000
  });
  const cardW = responsiveVal(tier, {
    'mobile-sm': 130, mobile: 170, tablet: 210, laptop: 260, desktop: 300, tv: 380
  });
  const cardH = responsiveVal(tier, {
    'mobile-sm': 170, mobile: 210, tablet: 260, laptop: 320, desktop: 370, tv: 460
  });
  const containerH = responsiveVal(tier, {
    'mobile-sm': '230px', mobile: '270px', tablet: '330px', laptop: '400px', desktop: '440px', tv: '560px'
  });
  const cardBorderRadius = responsiveVal(tier, {
    'mobile-sm': '16px', mobile: '18px', tablet: '22px', laptop: '28px', desktop: '30px', tv: '36px'
  });
  const cardTitleSize = responsiveVal(tier, {
    'mobile-sm': '18px', mobile: '22px', tablet: '26px', laptop: '32px', desktop: '36px', tv: '44px'
  });
  const cardDescSize = responsiveVal(tier, {
    'mobile-sm': '11px', mobile: '13px', tablet: '14px', laptop: '16px', desktop: '18px', tv: '22px'
  });
  const cardPad = responsiveVal(tier, {
    'mobile-sm': '10px', mobile: '14px', tablet: '18px', laptop: '24px', desktop: '28px', tv: '36px'
  });
  const indexBadgeSize = responsiveVal(tier, {
    'mobile-sm': 22, mobile: 26, tablet: 28, laptop: 28, desktop: 32, tv: 38
  });

  const totalCards = cards.length;
  const centerIndex = Math.floor(totalCards / 2);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: containerH,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {cards.map((card, i) => {
        const baseDeg = (i - centerIndex) * cardSpacingDeg;
        const deg = baseDeg - rotationOffset + (centerIndex * cardSpacingDeg);
        const rad = (deg * Math.PI) / 180;
        const x = Math.sin(rad) * arcRadius;
        const y = arcRadius - Math.cos(rad) * arcRadius;

        const bottomOffset = responsiveVal(tier, {
          'mobile-sm': 60, mobile: 75, tablet: 100, laptop: 120, desktop: 140, tv: 180
        });
        const bottomVal = -y + bottomOffset;
        const leftVal = `calc(50% + ${x}px - ${cardW / 2}px)`;
        const indexStr = String(i + 1).padStart(2, "0");

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: `${bottomVal}px`,
              left: leftVal,
              width: `${cardW}px`,
              height: `${cardH}px`,
              borderRadius: cardBorderRadius,
              boxShadow: "0 12px 40px rgba(255, 85, 0, 0.15)",
              transform: `rotate(${deg}deg)`,
              transformOrigin: `${cardW / 2}px ${arcRadius}px`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              backgroundImage: `url(${card.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255,85,0,0.15)",
            }}
          >
            {/* Dark gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,6,8,0.95) 0%, rgba(10,6,8,0.4) 50%, transparent 100%)" }} />

            {/* Top Right index */}
            <div style={{ position: "relative", zIndex: 2, padding: cardPad, display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: `${indexBadgeSize}px`,
                  height: `${indexBadgeSize}px`,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255, 85, 0, 0.5)",
                  color: "#FF5500",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: `${Math.max(10, indexBadgeSize * 0.5)}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(10,6,8,0.6)",
                  backdropFilter: "blur(4px)"
                }}
              >
                {indexStr}
              </div>
            </div>

            {/* Bottom Title + Description */}
            <div style={{ position: "relative", zIndex: 2, marginTop: "auto", padding: cardPad, textAlign: "left" }}>
              <h4
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: cardTitleSize,
                  letterSpacing: "0.05em",
                  lineHeight: 1.1,
                  margin: "0 0 6px 0",
                  color: "#F5EDD8",
                }}
              >
                {card.title}
              </h4>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: cardDescSize,
                  lineHeight: 1.4,
                  color: "rgba(245,237,216,0.75)",
                  margin: 0,
                }}
              >
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTACT UI — Fully Responsive
// ═══════════════════════════════════════════════════════════════

function ContactUI({ tier, isLandscape }: { tier: DeviceTier; isLandscape: boolean }) {
  const isMobile = tierIsMobile(tier);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
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
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 800);
  };

  const getFieldStyle = (fieldName: string) => ({
    paddingLeft: "48px",
    backgroundColor: "rgba(24, 24, 27, 0.6)",
    border: focusedField === fieldName ? "1px solid #25D366" : "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: focusedField === fieldName ? "0 0 15px rgba(37, 211, 102, 0.25)" : "none",
    transition: "all 0.3s ease",
  });

  // Use grid or stack depending on screen
  const useGrid = tier === 'laptop' || tier === 'desktop' || tier === 'tv';

  const containerMaxW = responsiveVal(tier, {
    'mobile-sm': '100%', mobile: '100%', tablet: '680px', laptop: '960px', desktop: '1100px', tv: '1400px'
  });
  const containerPadX = responsiveVal(tier, {
    'mobile-sm': '16px', mobile: '20px', tablet: '28px', laptop: '24px', desktop: '32px', tv: '48px'
  });
  const headingSize = responsiveVal(tier, {
    'mobile-sm': 'clamp(28px, 8vw, 40px)',
    mobile: 'clamp(32px, 7vw, 48px)',
    tablet: 'clamp(40px, 6vw, 56px)',
    laptop: 'clamp(48px, 5vw, 64px)',
    desktop: 'clamp(56px, 4vw, 72px)',
    tv: 'clamp(64px, 3vw, 90px)',
  });
  const subTextSize = responsiveVal(tier, {
    'mobile-sm': '14px', mobile: '16px', tablet: '17px', laptop: '18px', desktop: '20px', tv: '24px'
  });
  const inputFontSize = responsiveVal(tier, {
    'mobile-sm': '13px', mobile: '14px', tablet: '14px', laptop: '15px', desktop: '16px', tv: '18px'
  });
  const inputPadY = responsiveVal(tier, {
    'mobile-sm': '10px', mobile: '12px', tablet: '12px', laptop: '14px', desktop: '14px', tv: '18px'
  });
  const chatBubbleSize = responsiveVal(tier, {
    'mobile-sm': '13px', mobile: '14px', tablet: '14px', laptop: '14px', desktop: '15px', tv: '18px'
  });

  const inputClass = `w-full rounded-xl px-5 text-white focus:outline-none placeholder:text-white/30 font-['Barlow_Condensed']`;

  return (
    <div style={{ width: "100%", maxWidth: containerMaxW, padding: `0 ${containerPadX}`, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: isMobile ? "24px" : "40px" }}>
        <span style={{ fontFamily: "monospace", fontSize: tier === 'mobile-sm' ? "10px" : "12px", color: "#25D366", letterSpacing: "0.3em", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
          [ ZONE 03: COMMUNICATIONS PORTAL ]
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: headingSize, color: "#F5EDD8", letterSpacing: "0.05em", margin: 0 }}>
          LET&apos;S <span style={{ color: "#25D366" }}>CONNECT</span>
        </h2>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: subTextSize, color: "rgba(245,237,216,0.7)", marginTop: "8px" }}>
          Reach out via our WhatsApp portal instantly.
        </p>
      </div>

      <div style={{
        display: useGrid ? "grid" : "flex",
        gridTemplateColumns: useGrid ? "2fr 3fr" : undefined,
        flexDirection: useGrid ? undefined : "column",
        gap: responsiveVal(tier, {
          'mobile-sm': '20px', mobile: '24px', tablet: '28px', laptop: '32px', desktop: '36px', tv: '48px'
        }),
        alignItems: "start",
      }}>
        {/* Left: Mock Chat */}
        <div
          style={{
            borderRadius: "24px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "280px" : (isLandscape ? "50vh" : "400px"),
            border: "1px solid rgba(37, 211, 102, 0.25)",
            boxShadow: "0 0 25px rgba(37, 211, 102, 0.12)",
            backgroundColor: "rgba(12, 12, 14, 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              padding: `${responsiveVal(tier, { 'mobile-sm': '12px', mobile: '14px', tablet: '16px', laptop: '16px', desktop: '18px', tv: '22px' })} ${responsiveVal(tier, { 'mobile-sm': '14px', mobile: '16px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '28px' })}`,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderBottom: "1px solid rgba(37, 211, 102, 0.15)",
              backgroundColor: "rgba(31, 44, 52, 0.4)",
            }}
          >
            <img src="/logo.jpg" alt="Star BBQ" style={{ width: responsiveVal(tier, { 'mobile-sm': '32px', mobile: '36px', tablet: '38px', laptop: '40px', desktop: '44px', tv: '52px' }), height: responsiveVal(tier, { 'mobile-sm': '32px', mobile: '36px', tablet: '38px', laptop: '40px', desktop: '44px', tv: '52px' }), borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />
            <div>
              <h4 style={{ fontSize: chatBubbleSize, fontWeight: "bold", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", margin: 0 }}>Star BBQ Support</h4>
              <p style={{ fontSize: "10px", color: "#25D366", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: "bold", fontFamily: "monospace", margin: 0 }}>● STATUS: SECURE_ON</p>
            </div>
          </div>
          <div style={{ padding: responsiveVal(tier, { 'mobile-sm': '14px', mobile: '16px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '28px' }), flexGrow: 1, display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", background: "rgba(11, 20, 26, 0.3)" }}>
            <div style={{ backgroundColor: "rgba(32, 44, 51, 0.8)", border: "1px solid rgba(255,255,255,0.05)", color: "#F5EDD8", padding: responsiveVal(tier, { 'mobile-sm': '10px', mobile: '12px', tablet: '14px', laptop: '16px', desktop: '16px', tv: '20px' }), borderRadius: "16px", borderTopLeftRadius: "0", maxWidth: "90%", fontSize: chatBubbleSize, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
              Hey there! Welcome to the Star BBQ website. 🍗🔥
            </div>
            <div style={{ backgroundColor: "rgba(32, 44, 51, 0.8)", border: "1px solid rgba(255,255,255,0.05)", color: "#F5EDD8", padding: responsiveVal(tier, { 'mobile-sm': '10px', mobile: '12px', tablet: '14px', laptop: '16px', desktop: '16px', tv: '20px' }), borderRadius: "16px", borderTopLeftRadius: "0", maxWidth: "90%", fontSize: chatBubbleSize, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
              Have questions about catering or private orders? Fill the form!
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            style={{
              borderRadius: "24px",
              padding: responsiveVal(tier, { 'mobile-sm': '18px', mobile: '22px', tablet: '26px', laptop: '32px', desktop: '36px', tv: '48px' }),
              display: "flex",
              flexDirection: "column",
              gap: responsiveVal(tier, { 'mobile-sm': '14px', mobile: '16px', tablet: '18px', laptop: '20px', desktop: '22px', tv: '28px' }),
              border: "1px solid rgba(255, 85, 0, 0.25)",
              boxShadow: "0 0 25px rgba(255, 85, 0, 0.1)",
              backgroundColor: "rgba(26, 21, 16, 0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: tier === 'mobile-sm' ? "9px" : "11px", color: "rgba(245,237,216,0.4)", letterSpacing: "0.15em", borderBottom: "1px solid rgba(255,85,0,0.15)", paddingBottom: "12px", textTransform: "uppercase" }}>
              // COMMUNICATIONS CHANNEL TRANSMISSION PORTAL
            </div>

            {/* Name */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 10, display: "flex" }}><User style={{ width: "18px", height: "18px" }} /></span>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={inputClass}
                style={{ ...getFieldStyle("name"), width: "100%", borderRadius: "12px", padding: `${inputPadY} 16px ${inputPadY} 48px`, fontSize: inputFontSize, color: "#fff" }}
                placeholder="Full Name"
              />
            </div>

            {/* Email */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 10, display: "flex" }}><Mail style={{ width: "18px", height: "18px" }} /></span>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className={inputClass}
                style={{ ...getFieldStyle("email"), width: "100%", borderRadius: "12px", padding: `${inputPadY} 16px ${inputPadY} 48px`, fontSize: inputFontSize, color: "#fff" }}
                placeholder="Email Address"
              />
            </div>

            {/* Phone */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", zIndex: 10, display: "flex" }}><Phone style={{ width: "18px", height: "18px" }} /></span>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                className={inputClass}
                style={{ ...getFieldStyle("phone"), width: "100%", borderRadius: "12px", padding: `${inputPadY} 16px ${inputPadY} 48px`, fontSize: inputFontSize, color: "#fff" }}
                placeholder="Mobile Number"
              />
            </div>

            {/* Message */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "18px", color: "rgba(255,255,255,0.4)", zIndex: 10, display: "flex" }}><MessageSquare style={{ width: "18px", height: "18px" }} /></span>
              <textarea
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                rows={isMobile ? 2 : 3}
                className={inputClass}
                style={{ ...getFieldStyle("message"), width: "100%", borderRadius: "12px", padding: `18px 16px 12px 48px`, fontSize: inputFontSize, color: "#fff", resize: "none" }}
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: "100%",
                padding: responsiveVal(tier, { 'mobile-sm': '12px', mobile: '14px', tablet: '14px', laptop: '16px', desktop: '16px', tv: '20px' }),
                backgroundColor: "#25D366",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: "bold",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: responsiveVal(tier, { 'mobile-sm': '14px', mobile: '15px', tablet: '15px', laptop: '16px', desktop: '17px', tv: '20px' }),
                fontFamily: "'Bebas Neue', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                border: "none",
                cursor: isSending ? "not-allowed" : "pointer",
                opacity: isSending ? 0.5 : 1,
                boxShadow: btnHover ? "0 0 25px rgba(37, 211, 102, 0.6)" : "0 0 10px rgba(37, 211, 102, 0.2)",
                transition: "all 0.3s ease",
              }}
            >
              {isSending ? "Opening WhatsApp..." : "Send via WhatsApp"} <Send style={{ width: "18px", height: "18px" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ICON COMPONENTS
// ═══════════════════════════════════════════════════════════════

function StarLogo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img src="/logo.jpg" alt="Logo" style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid #FF5500", boxShadow: "0 0 15px rgba(255,85,0,0.5)" }} />
    </div>
  );
}

function PlayIcon({ size = 12, color = "#000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF5500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
