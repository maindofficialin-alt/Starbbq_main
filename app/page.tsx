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

const wAnchors = [320, 390, 768, 1024, 1440, 1920];
function f(w: number, v: number[]): number {
  if (w <= wAnchors[0]) return v[0];
  if (w >= wAnchors[5]) return v[5];
  for (let i = 0; i < 5; i++) {
    if (w >= wAnchors[i] && w <= wAnchors[i+1]) {
      const t = (w - wAnchors[i]) / (wAnchors[i+1] - wAnchors[i]);
      return v[i] + t * (v[i+1] - v[i]);
    }
  }
  return v[5];
}

function fs(w: number, v: (number | string)[]): string {
  const vals = v.map(s => typeof s === "string" ? parseFloat(s) : s);
  return `${f(w, vals)}px`;
}


function useWindowSize() {
  const [size, setSize] = useState({ w: 1024, h: 768, isMobile: false });

  useEffect(() => {
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
      setSize({ w, h, isMobile: w <= 768 });
    };
    
    update();
    
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w !== lastW || Math.abs(h - lastH) > 150) {
        lastW = w;
        lastH = h;
        update();
      }
    };
    
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
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



// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const { w, isMobile } = useWindowSize();
  const isLandscape = useIsLandscape();
  

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

    const triggerCompute = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };

    compute();
    const observer = new ResizeObserver(triggerCompute);
    observer.observe(document.body);
    
    window.addEventListener("scroll", triggerCompute, { passive: true });
    window.addEventListener("resize", triggerCompute, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", triggerCompute);
      window.removeEventListener("resize", triggerCompute);
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
  const cardSpacingDeg = f(w, [15, 12, 10, 9, 8, 7]); // wider angle on mobile to prevent squishing
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
  const pI = isMobile ? 0 : (w <= 1024 ? 0.5 : 1);
  const mx = mousePos.x * pI;
  const my = mousePos.y * pI;

  const fireFilter = "sepia(1) hue-rotate(-20deg) saturate(2) brightness(0.6)";

  // ── Curtains (Hardware accelerated) ──
  const curtainLX = !entranceDone ? (curtainsOpen ? -62 : 0) : -62 - lerp(0, 150, ep);
  const curtainRX = !entranceDone ? (curtainsOpen ? 62 : 0) : 62 + lerp(0, 150, ep);
  const curtainTrans = !entranceDone ? "transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)" : "none";

  // ── Responsive values ──
  const navPadX = fs(w, [16, 24, 24, 40, 48, 64]);
  const navPadY = fs(w, [16, 20, 20, 20, 22, 28]);
  const navFontSize = fs(w, [14, 16, 16, 16, 18, 22]);
  const navGap = fs(w, [20, 24, 24, 32, 40, 52]);
  const logoFinalSize = f(w, [56, 64, 56, 48, 52, 60]);
  const heroTextLeft = fs(w, [20, 32, 36, 52, 72, 100]);
  const heroTextMaxW = fs(w, [340, 400, 400, 420, 520, 660]);
  const heroCardSize = f(w, [120, 160, 160, 160, 190, 240]);
  const heroCardRight = fs(w, [16, 24, 28, 40, 60, 100]);
  const heroDescFS = fs(w, [16, 18, 18, 20, 22, 28]);
  const heroTempFS = f(w, [28, 38, 38, 40, 46, 56]);
  const heroLabelFS = fs(w, [12, 14, 14, 14, 15, 18]);
  const arcSliderBottom = fs(w, [20, 40, 30, 30, 36, 50]);

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
    <div id="outer-container" style={{ height: "calc(var(--vh, 1vh) * 800)", position: "relative", backgroundColor: "#0a0608", contain: "paint layout" }}>

      {/* ═══ STICKY VIEWPORT ═══ */}
      <div style={{ position: "sticky", top: 0, height: "calc(var(--vh, 1vh) * 100)", width: "100%", maxWidth: "100vw", overflow: "hidden", backgroundColor: "#0a0608", contain: "paint layout" }}>

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
                WebkitBackfaceVisibility: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isMobile ? "20px" : "24px",
              }}
            >
              <div
                style={{
                  width: isMobile ? "300px" : "320px",
                  height: isMobile ? "300px" : "320px",
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
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `scale(${worldScale}) translate3d(${-mx * 6}px, ${-my * 6}px, 0)`, WebkitBackfaceVisibility: "hidden", zIndex: 0 }}>
          <img src={WORLD_BG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6) contrast(1.2)" }} />
        </div>

        {/* Layer 1.2: Coal BG (z: 1) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `scale(${worldScale}) translate3d(${-mx * 6}px, ${-my * 6}px, 0)`, opacity: coalOpacity, WebkitBackfaceVisibility: "hidden", zIndex: 1 }}>
          <img src="/images/coal.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) contrast(1.1)" }} />
        </div>

        {/* Layer 2: Bottom Clouds (z: 10) */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, transformOrigin: "50% 100%", transform: `scale(${cloudsScale}) translate3d(${-mx * 9}px, ${-my * 9 * 0.4}px, 0)`, opacity: lerp(0.5, 1.0, clamp(scrollProgress / 0.05, 0, 1)), filter: fireFilter, WebkitBackfaceVisibility: "hidden", zIndex: 10 }}>
          <img src={BOTTOM_CLOUDS} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* Layer 2.5: Arc Slider (z: 9) */}
        <div style={{ position: "absolute", bottom: arcSliderBottom, left: 0, right: 0, opacity: scene2Opacity, WebkitBackfaceVisibility: "hidden", zIndex: 9, pointerEvents: scene2Opacity > 0.1 ? "auto" : "none" }}>
          <ArcCardSlider cards={SCENE2_CARDS} rotationOffset={sliderRotationOffset} w={w} />
        </div>

        {/* Layer 3: Portal (z: 15) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "52% 38%", transform: `scale(${portalScale}) translate3d(${-mx * 7}px, ${-my * 7}px, 0)`, opacity: portalOpacity, filter: fireFilter, WebkitBackfaceVisibility: "hidden", zIndex: 15 }}>
          <img src={PORTAL_BG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Bottom Fade (z: 16) */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(10,6,8,0.8) 0%, transparent 100%)", pointerEvents: "none", zIndex: 16 }} />

        {/* Curtain Left (z: 16) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "left center", transform: `translate3d(${curtainLX}%, 0, 0) scale(${lerp(1, 1.3, ep)}) translate3d(${-mx * 14}px, ${-my * 14 * 0.3}px, 0)`, transition: curtainTrans, WebkitBackfaceVisibility: "hidden", filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)", zIndex: 16 }}>
          <img src={CURTAIN_LEFT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />
        </div>

        {/* Curtain Right (z: 16) */}
        <div style={{ position: "absolute", inset: 0, transformOrigin: "right center", transform: `translate3d(${curtainRX}%, 0, 0) scale(${lerp(1, 1.3, ep)}) translate3d(${-mx * 14}px, ${-my * 14 * 0.3}px, 0)`, transition: curtainTrans, WebkitBackfaceVisibility: "hidden", filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)", zIndex: 16 }}>
          <img src={CURTAIN_RIGHT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center" }} />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 1 UI: HERO (z: 20)                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 20, opacity: scene1Opacity, pointerEvents: scene1Opacity > 0.1 ? "auto" : "none" }}>

          {/* ── Mobile Hero ── */}
          {isMobile && (
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
          {!isMobile && (
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
        <div style={{ position: "absolute", inset: 0, zIndex: 46, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "start", opacity: scene2Opacity, pointerEvents: scene2Opacity > 0.1 ? "auto" : "none", paddingTop: fs(w, [8vh, 8vh, 6vh, 8vh, 9vh, 10vh]) }}>
          <div style={{ textAlign: "center", padding: "0 24px" }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: fs(w, [40, 54, 64, 90, 100, 120]),
              color: "#F5EDD8", letterSpacing: "0.05em", lineHeight: 1.05, textShadow: "0 2px 20px rgba(0,0,0,0.8)", margin: 0,
            }}>
              FIRE CRAFTED <span style={{ color: "#FF5500" }}>FAVOURITES</span>
            </h2>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: fs(w, [15, 18, 18, 22, 24, 30]),
              lineHeight: "1.6", color: "rgba(245,237,216,0.85)",
              maxWidth: fs(w, [280, 360, 400, 500, 600, 750]),
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
          <div style={{ position: "relative", zIndex: 2, maxWidth: fs(w, [360, 420, 600, 800, 900, 1100]), display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 20px" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: fs(w, [14, 16, 16, 18, 20, 24]), letterSpacing: "0.4em", color: "#FF5500", fontWeight: "bold", textTransform: "uppercase", marginBottom: "16px" }}>The Fire Craft</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: fs(w, [36, 48, 56, 80, 100, 120]), color: "#F5EDD8", letterSpacing: "0.03em", lineHeight: 0.95, margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
              CRAFTED BY <span style={{ color: "#FF5500" }}>HEAT & EMBER</span>
            </h2>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: fs(w, [15, 18, 18, 22, 24, 30]), lineHeight: "1.6", color: "rgba(245,237,216,0.85)", maxWidth: fs(w, [300, 380, 480, 600, 700, 850]), margin: "24px auto 36px auto", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
              Watch the dance of fire and charcoal. No shortcuts, no compromise. Only genuine flame-kissed gastronomy.
            </p>
            <div style={{ display: "flex", gap: fs(w, [8, 16, 20, 28, 36, 44]), flexWrap: "wrap", justifyContent: "center" }}>
              {[{ title: "800° HEAT", desc: "Live Oak Charcoal" }, { title: "24HR PREP", desc: "Slow Marination" }, { title: "100% RAW", desc: "No Gas Cookers" }].map((item, i) => (
                <div key={i} style={{ border: "1px solid rgba(255,85,0,0.3)", backgroundColor: "rgba(10,6,8,0.6)", backdropFilter: "blur(8px)", borderRadius: fs(w, [12, 16, 16, 16, 18, 20]), padding: isMobile ? "14px 20px" : "16px 28px", minWidth: fs(w, [130, 110, 110, 120, 140, 170]), textAlign: "center" as const }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: fs(w, [18, 22, 20, 24, 28, 34]), color: "#FF5500", letterSpacing: "0.05em" }}>{item.title}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: fs(w, [11, 12, 12, 13, 14, 17]), color: "rgba(245,237,216,0.6)", letterSpacing: "0.05em", textTransform: "uppercase" as const, marginTop: "4px" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 3: CONTACT (z: 60)                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 60, opacity: scene3Opacity, pointerEvents: scene3Opacity > 0.1 ? "auto" : "none", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `rgba(10,6,8,${scene3Opacity * 0.96})`, backdropFilter: `blur(${scene3Opacity * 12}px)`, backgroundImage: "radial-gradient(circle at center, transparent 10%, #0a0608 85%), linear-gradient(rgba(255,85,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.02) 1px, transparent 1px)", backgroundSize: "100% 100%, 40px 40px, 40px 40px", overflowY: "auto", overflowX: "hidden" }}>
          <ContactUI w={w} isMobile={isMobile} />
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
interface ArcSliderProps { cards: typeof SCENE2_CARDS; rotationOffset: number; w: number; }

function ArcCardSlider({ cards, rotationOffset, w }: ArcSliderProps) {
  // Relaxed mobile radii and dimensions so cards look massive and don't clip off
  const cardSpacingDeg = f(w, [18, 14, 10, 9, 8, 7]);
  const arcRadius = f(w, [1200, 1400, 1400, 1800, 2200, 3000]);
  const cardW = f(w, [220, 260, 240, 260, 300, 380]);
  const cardH = f(w, [300, 340, 320, 320, 370, 460]);
  const containerH = fs(w, [360, 420, 380, 400, 440, 560]);
  const cardBR = fs(w, [16, 20, 22, 28, 30, 36]);
  const titleFS = fs(w, [22, 26, 26, 32, 36, 44]);
  const descFS = fs(w, [14, 16, 14, 16, 18, 22]);
  const pad = fs(w, [14, 18, 18, 24, 28, 36]);
  const badgeSz = f(w, [24, 30, 28, 28, 32, 38]);
  const bottomOffset = f(w, [180, 220, 140, 120, 140, 180]);

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
          <div key={i} style={{ position: "absolute", bottom: `${-y + bottomOffset}px`, left: `calc(50% + ${x}px - ${cardW / 2}px)`, width: `${cardW}px`, height: `${cardH}px`, borderRadius: cardBR, boxShadow: "0 12px 40px rgba(255,85,0,0.15)", transform: `rotate(${deg}deg) translateZ(0)`, transformOrigin: `${cardW / 2}px ${arcRadius}px`, overflow: "hidden", display: "flex", flexDirection: "column", backgroundImage: `url(${card.image})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,85,0,0.2)", WebkitBackfaceVisibility: "hidden" }}>
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
function ContactUI({ w, isMobile }: { w: number; isMobile: boolean }) {
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
    padding: `${fs(w, [12, 14, 14, 16, 16, 20])} 16px ${fs(w, [12, 14, 14, 16, 16, 20])} 48px`,
    fontSize: fs(w, [15, 16, 16, 16, 18, 22]),
    color: "#fff", backgroundColor: "rgba(10,6,8,0.7)",
    border: focusedField === name ? "1px solid #FF5500" : "1px solid rgba(255,85,0,0.2)",
    boxShadow: focusedField === name ? "0 0 20px rgba(255,85,0,0.15)" : "none",
    outline: "none", fontFamily: "'Barlow Condensed', sans-serif", transition: "all 0.3s ease",
  });

  const containerMaxW = isMobile ? "100%" : fs(w, [680, 680, 680, 700, 800, 1000]);
  const containerPx = fs(w, [16, 24, 28, 24, 32, 48]);
  const headingFS = fs(w, [40, 48, 56, 64, 72, 90]);

  return (
    <div style={{ width: "100%", maxWidth: containerMaxW, padding: `0 ${containerPx}`, boxSizing: "border-box", marginTop: isMobile ? "calc(var(--vh, 1vh) * 12)" : "0" }}>
      <div style={{ textAlign: "center", marginBottom: isMobile ? "24px" : "48px" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: headingFS, color: "#F5EDD8", letterSpacing: "0.05em", margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
          GET IN <span style={{ color: "#FF5500" }}>TOUCH</span>
        </h2>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: fs(w, [15, 18, 18, 20, 22, 26]), color: "rgba(245,237,216,0.8)", marginTop: "12px", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>Connect with our fire masters directly via WhatsApp.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", borderRadius: "24px", padding: fs(w, [20, 32, 40, 48, 56, 70]), display: "flex", flexDirection: "column", gap: fs(w, [14, 20, 24, 24, 28, 36]), border: "1px solid rgba(255,85,0,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,85,0,0.05)", backgroundColor: "rgba(20,10,10,0.6)", backdropFilter: "blur(20px)" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: fs(w, [14, 20, 24, 24, 28, 36]) }}>
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

          <button type="submit" disabled={isSending} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)} style={{ width: "100%", marginTop: "12px", padding: fs(w, [16, 18, 18, 20, 22, 28]), backgroundColor: btnHover ? "#FF4400" : "#FF5500", borderRadius: "12px", color: "#fff", fontWeight: "bold", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: fs(w, [16, 18, 18, 20, 22, 26]), fontFamily: "'Bebas Neue', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", border: "none", cursor: isSending ? "not-allowed" : "pointer", opacity: isSending ? 0.7 : 1, boxShadow: btnHover ? "0 0 30px rgba(255,85,0,0.6)" : "0 8px 25px rgba(255,85,0,0.3)", transition: "all 0.3s ease" }}>
            {isSending ? "Initiating..." : "Send Request"} <Send style={{ width: 18, height: 18 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
