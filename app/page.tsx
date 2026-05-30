"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import { Send, User, Mail, MessageSquare, FileText, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Assets
const PORTAL_BG = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779707217/image_1_vdzwae.png";
const CURTAIN_LEFT = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706559/curtain_left_znkmva.png";
const CURTAIN_RIGHT = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706564/curtain_right_paeyym.png";
const BOTTOM_CLOUDS = "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1779706555/bottom_clouds_xskut6.png";
const WORLD_BG = "/images/platter.jpg"; // Our Star BBQ charcoal pit frame

const SCENE1_CARDS = [
  "/images/shawarma-hero.jpeg",
  "/frames/ezgif-frame-018.jpg",
  "/images/charcoal-chicken.jpeg"
];

// Card Data for Scene 2
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

// Custom responsive hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();
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

  // Scroll Progress Listener (Optimized for Mobile Touch Scrolling)
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

  // Smooth Mouse Parallax Loop
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

  // ---------------------------------------------------------------------------
  // ANIMATION TIMELINE & MATH (600vh total scroll)
  // ---------------------------------------------------------------------------
  const ep = easeInOut(scrollProgress); // 0 to 1

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
  const arcSweepDeg = (SCENE2_CARDS.length - 1) * (isMobile ? 12 : 9);
  const sliderRotationOffset = lerp(0, arcSweepDeg, sliderProg);

  // Floating Logo Anim calculations
  const logoProg = clamp(scrollProgress / 0.18, 0, 1);
  const logoT = easeInOut(logoProg);
  const logoTargetY = isMobile ? 42 : 46;
  const logoSize = lerp(isMobile ? 90 : 130, 48, logoT);
  const logoBorderWidth = lerp(isMobile ? 3 : 4, 2, logoT);
  const logoShadowBlur = lerp(isMobile ? 25 : 35, 15, logoT);
  const logoShadowOpacity = lerp(0.8, 0.5, logoT);

  // Mouse Parallax offsets
  const mx = mousePos.x;
  const my = mousePos.y;

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
    filter: "sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.4)", // Dark red velvet / smoke
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

  return (
    <div id="outer-container" style={{ height: "600vh", position: "relative", backgroundColor: "#0a0608" }}>
      
      {/* Sticky Viewport */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", backgroundColor: "#0a0608" }}>
        
        {/* Navigation Bar (z-index: 50) */}
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
          }}
          className="px-5 py-[18px] md:px-12 md:py-[22px]"
        >
          {/* Mobile Nav Links */}
          <div className="flex md:hidden w-full items-center justify-between">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FF5500", opacity: 0.9 }}>
              Menu
            </span>
            <div className="w-12 h-12 flex-shrink-0" />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FF5500", opacity: 0.9 }}>
              Contact
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex w-full items-center justify-between">
            <div style={{ display: "flex", gap: "36px" }}>
              {["Our Story", "Menu", "Craft"].map((link) => (
                <span key={link} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9, cursor: "pointer" }}>
                  {link}
                </span>
              ))}
            </div>
            <div className="w-12 h-12 flex-shrink-0" />
            <div style={{ display: "flex", gap: "36px" }}>
              {["Gallery", "Reviews", "Contact"].map((link) => (
                <span key={link} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9, cursor: "pointer" }}>
                  {link}
                </span>
              ))}
            </div>
          </div>
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
            bottom: isMobile ? "20px" : "30px",
            left: 0,
            right: 0,
            opacity: scene2Opacity,
            zIndex: 9,
            pointerEvents: scene2Opacity > 0.1 ? "auto" : "none",
            transition: "opacity 0.4s ease",
          }}
        >
          <ArcCardSlider cards={SCENE2_CARDS} rotationOffset={sliderRotationOffset} isMobile={isMobile} />
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
        {/*  SCENE 1 UI: HERO (z-index: 20)                             */}
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
          {/* Mobile layout (md:hidden) */}
          <div
            className="md:hidden flex flex-col items-center justify-between h-full"
            style={{
              padding: "80px 24px 100px",
              boxSizing: "border-box",
              opacity: uiVisible ? 0.9 : 0,
              transform: uiVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
            }}
          >
            <div className="text-center mt-[12vh]">
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 9vw, 50px)", letterSpacing: "0.12em", color: "#FF5500", margin: 0 }}>
                STAR <span style={{ color: "#F5EDD8", fontSize: "0.8em" }}>›</span> BBQ
              </h2>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px, 16vw, 80px)", lineHeight: 1.0, color: "#F5EDD8", margin: "8px 0 16px 0" }}>
                FIRE-CRAFTED
              </h1>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", lineHeight: "1.6", color: "rgba(245,237,216,0.7)", maxWidth: "280px", margin: "0 auto" }}>
                Hyderabad&apos;s finest fire kitchen. Slow-marinated, live-flame grilled. No gas, no shortcuts. Real charcoal BBQ.
              </p>
            </div>

            <div style={{ width: "140px", height: "140px", borderRadius: "22px", backgroundImage: `url(${SCENE1_CARDS[1]})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 32px rgba(255,85,0,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
              <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
                <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", lineHeight: "1.0" }}>800°</span>
                <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", opacity: 0.9 }}>Charcoal Temp</span>
              </div>
            </div>
          </div>

          {/* Desktop layout (hidden md:block) */}
          <div className="hidden md:block">
            <div
              style={{
                position: "absolute",
                top: "46%",
                left: "60px",
                maxWidth: "440px",
                transform: "translateY(-50%)",
                opacity: uiVisible ? 1 : 0,
                transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
              }}
            >
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.1", letterSpacing: "0.08em", color: "#FF5500", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: 0 }}>
                STAR <span style={{ color: "#F5EDD8" }}>›</span> BBQ
              </h2>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(60px, 8vw, 100px)", lineHeight: "0.9", color: "#F5EDD8", textShadow: "0 2px 24px rgba(0,0,0,0.7)", margin: "12px 0 24px 0" }}>
                FIRE-CRAFTED<br />SINCE DAY ONE
              </h1>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", lineHeight: "1.6", color: "rgba(245,237,216,0.85)", maxWidth: "340px", textShadow: "0 1px 12px rgba(0,0,0,0.8)", margin: 0 }}>
                Hyderabad&apos;s finest fire kitchen. Slow-marinated, live-flame grilled. No gas, no shortcuts. Real charcoal BBQ.
              </p>
            </div>

            <div
              style={{
                position: "absolute",
                right: "40px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                gap: "14px",
                opacity: uiVisible ? 1 : 0,
                transition: "opacity 0.9s ease 0.55s, transform 0.9s ease 0.55s",
              }}
            >
              {/* Card 1: 800 Degree Temp */}
              <div style={{ width: "160px", height: "160px", borderRadius: "24px", backgroundImage: `url(${SCENE1_CARDS[1]})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 32px rgba(255,85,0,0.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
                <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", lineHeight: "1.0" }}>800°</span>
                  <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", opacity: 0.9 }}>Charcoal Temp</span>
                </div>
              </div>

              {/* Card 2: 24hr Marination */}
              <div style={{ width: "160px", height: "160px", borderRadius: "24px", backgroundImage: `url(${SCENE1_CARDS[0]})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 8px 32px rgba(255,85,0,0.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, rgba(10,6,8,0.9), transparent)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", backdropFilter: "blur(10px)", backgroundColor: "rgba(10,6,8,0.4)" }} />
                <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#FF5500", fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", lineHeight: "1.0" }}>24 Hrs</span>
                  <span style={{ color: "#F5EDD8", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", opacity: 0.9 }}>Slow Marinated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Dots */}
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? "28px" : "40px",
              left: isMobile ? "50%" : "60px",
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

          {/* Scroll Cue (desktop only) */}
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
        {/*  SCENE 2 UI: MENU (z-index: 46)                             */}
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
            paddingTop: isMobile ? "5vh" : "8vh",
            boxSizing: "border-box",
          }}
        >
          <div className="text-center px-6">
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isMobile ? "clamp(36px, 8vw, 50px)" : "clamp(50px, 6.5vw, 90px)",
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
                fontSize: isMobile ? "16px" : "22px",
                lineHeight: "1.6",
                letterSpacing: "0.02em",
                color: "rgba(245,237,216,0.85)",
                maxWidth: isMobile ? "280px" : "500px",
                margin: "12px auto 0 auto",
                textShadow: "0 1px 10px rgba(0,0,0,0.8)",
              }}
            >
              Singular voyages to astonishing flavor, shaped for those who seek the authentic taste of live charcoal.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  SCENE 2.5 UI: VIDEO BACKGROUND SECTION (z-index: 48)       */}
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
            className="text-center px-6"
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: isMobile ? "14px" : "18px",
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
                fontSize: isMobile ? "clamp(40px, 9vw, 60px)" : "clamp(60px, 7vw, 100px)",
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
                fontSize: isMobile ? "16px" : "22px",
                lineHeight: "1.6",
                color: "rgba(245,237,216,0.85)",
                maxWidth: "600px",
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
                gap: isMobile ? "16px" : "32px",
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
                    borderRadius: "16px",
                    padding: isMobile ? "10px 16px" : "14px 24px",
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: isMobile ? "18px" : "24px",
                      color: "#FF5500",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: isMobile ? "11px" : "13px",
                      color: "rgba(245, 237, 216, 0.6)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
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
        {/*  SCENE 3 UI: CONTACT (z-index: 60)                          */}
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
          }}
        >
          <ContactUI isMobile={isMobile} />
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

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

interface ArcSliderProps {
  cards: typeof SCENE2_CARDS;
  rotationOffset: number;
  isMobile: boolean;
}

function ArcCardSlider({ cards, rotationOffset, isMobile }: ArcSliderProps) {
  const cardSpacingDeg = isMobile ? 12 : 9;
  const totalCards = cards.length;
  const centerIndex = Math.floor(totalCards / 2);
  const arcRadius = isMobile ? 1000 : 1800;
  const cardW = isMobile ? 180 : 260;
  const cardH = isMobile ? 220 : 320;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "280px" : "400px",
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

        const bottomVal = -y + (isMobile ? 80 : 120);
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
              borderRadius: isMobile ? "20px" : "28px",
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
            <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "12px" : "20px", display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255, 85, 0, 0.5)",
                  color: "#FF5500",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "14px",
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
            <div style={{ position: "relative", zIndex: 2, marginTop: "auto", padding: isMobile ? "16px" : "24px", textAlign: "left" }}>
              <h4
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: isMobile ? "24px" : "32px",
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
                  fontSize: isMobile ? "14px" : "16px",
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

// Contact UI Component
function ContactUI({ isMobile }: { isMobile: boolean }) {
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

  const inputClass = "w-full rounded-xl px-5 py-3 md:py-3.5 text-white focus:outline-none placeholder:text-white/30 font-['Barlow_Condensed'] text-sm md:text-base";

  return (
    <div className="w-full max-w-5xl px-6">
      <div className="text-center mb-10">
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#25D366", letterSpacing: "0.3em", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
          [ ZONE 03: COMMUNICATIONS PORTAL ]
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 6vw, 64px)", color: "#F5EDD8", letterSpacing: "0.05em", margin: 0 }}>
          LET&apos;S <span style={{ color: "#25D366" }}>CONNECT</span>
        </h2>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", color: "rgba(245,237,216,0.7)", marginTop: "8px" }}>
          Reach out via our WhatsApp portal instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Left: Mock Chat */}
        <div 
          className="md:col-span-2 rounded-3xl overflow-hidden flex flex-col h-full max-h-[400px]"
          style={{
            border: "1px solid rgba(37, 211, 102, 0.25)",
            boxShadow: "0 0 25px rgba(37, 211, 102, 0.12)",
            backgroundColor: "rgba(12, 12, 14, 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div 
            className="px-5 py-4 flex items-center gap-3"
            style={{
              borderBottom: "1px solid rgba(37, 211, 102, 0.15)",
              backgroundColor: "rgba(31, 44, 52, 0.4)",
            }}
          >
            <img src="/logo.jpg" alt="Star BBQ" className="w-10 h-10 rounded-full border border-white/10" />
            <div>
              <h4 className="text-sm font-bold text-white font-['Barlow_Condensed'] tracking-wider">Star BBQ Support</h4>
              <p className="text-[10px] text-[#25D366] tracking-widest uppercase font-bold font-mono">● STATUS: SECURE_ON</p>
            </div>
          </div>
          <div className="p-5 flex-grow space-y-4 overflow-y-auto bg-[#0b141a]/30">
            <div className="bg-[#202c33]/80 border border-white/5 text-[#F5EDD8] p-4 rounded-2xl rounded-tl-none max-w-[90%] text-sm font-['Barlow_Condensed'] tracking-wide">
              Hey there! Welcome to the Star BBQ website. 🍗🔥
            </div>
            <div className="bg-[#202c33]/80 border border-white/5 text-[#F5EDD8] p-4 rounded-2xl rounded-tl-none max-w-[90%] text-sm font-['Barlow_Condensed'] tracking-wide">
              Have questions about catering or private orders? Fill the form!
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-3">
          <form 
            onSubmit={handleSubmit} 
            className="rounded-3xl p-6 md:p-8 space-y-5"
            style={{
              border: "1px solid rgba(255, 85, 0, 0.25)",
              boxShadow: "0 0 25px rgba(255, 85, 0, 0.1)",
              backgroundColor: "rgba(26, 21, 16, 0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(245,237,216,0.4)", letterSpacing: "0.15em", borderBottom: "1px solid rgba(255,85,0,0.15)", paddingBottom: "12px", marginBottom: "16px", textTransform: "uppercase" }}>
              // COMMUNICATIONS CHANNEL TRANSMISSION PORTAL
            </div>

            <div className="space-y-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10"><User className="w-5 h-5" /></span>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={inputClass} 
                style={getFieldStyle("name")}
                placeholder="Full Name" 
              />
            </div>
            <div className="space-y-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10"><Mail className="w-5 h-5" /></span>
              <input 
                required 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className={inputClass} 
                style={getFieldStyle("email")}
                placeholder="Email Address" 
              />
            </div>
            <div className="space-y-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10"><Phone className="w-5 h-5" /></span>
              <input 
                required 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                className={inputClass} 
                style={getFieldStyle("phone")}
                placeholder="Mobile Number" 
              />
            </div>
            <div className="space-y-1 relative">
              <span className="absolute left-4 top-5 text-white/40 z-10"><MessageSquare className="w-5 h-5" /></span>
              <textarea 
                required 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})} 
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                rows={3} 
                className={`${inputClass} resize-none pt-4`} 
                style={{
                  ...getFieldStyle("message"),
                  paddingTop: "16px",
                }}
                placeholder="Your message..." 
              />
            </div>
            <button 
              type="submit" 
              disabled={isSending} 
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              className="w-full py-4 bg-[#25D366] rounded-xl text-white font-bold tracking-widest uppercase text-base flex items-center justify-center gap-3 hover:bg-[#20bd5a] transition-all duration-300 font-['Bebas_Neue'] disabled:opacity-50"
              style={{
                boxShadow: btnHover ? "0 0 25px rgba(37, 211, 102, 0.6)" : "0 0 10px rgba(37, 211, 102, 0.2)",
              }}
            >
              {isSending ? "Opening WhatsApp..." : "Send via WhatsApp"} <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ICON COMPONENTS
// ---------------------------------------------------------------------------

function StarLogo() {
  return (
    <div className="flex flex-col items-center">
      <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-[#FF5500] shadow-[0_0_15px_rgba(255,85,0,0.5)]" />
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
