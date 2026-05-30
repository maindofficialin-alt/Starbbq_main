"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const IMAGES = [
  "/gallery/2024-11-20.jpg",
  "/gallery/unnamed (1).jpg",
  "/gallery/unnamed (2).jpg",
  "/gallery/unnamed (3).jpg",
  "/gallery/unnamed (4).jpg",
  "/gallery/unnamed (5).jpg",
  "/gallery/unnamed (6).jpg",
  "/gallery/unnamed.jpg"
];

export default function GalleryPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0608", color: "#F5EDD8", fontFamily: "'Imprima', sans-serif" }}>
      
      {/* Background theme elements */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at center, transparent 10%, #0a0608 85%), linear-gradient(rgba(255,85,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.02) 1px, transparent 1px)", backgroundSize: "100% 100%, 40px 40px, 40px 40px" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40vh", background: "linear-gradient(to top, rgba(255,85,0,0.05), transparent)", filter: "sepia(1) hue-rotate(-20deg) saturate(2)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <nav style={{ marginBottom: "40px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#FF5500", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "0.1em" }}>
            <ArrowLeft size={20} /> BACK TO FIRE
          </Link>
        </nav>

        <header style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 90px)", color: "#F5EDD8", letterSpacing: "0.05em", margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
            THE <span style={{ color: "#FF5500" }}>GALLERY</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", color: "rgba(245,237,216,0.8)", marginTop: "12px", letterSpacing: "0.05em" }}>
            A visual journey through our charcoal craft.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {IMAGES.map((src, i) => (
            <div key={i} style={{ borderRadius: "16px", overflow: "hidden", aspectRatio: "4/5", position: "relative", border: "1px solid rgba(255,85,0,0.2)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", backgroundColor: "rgba(20,10,10,0.5)" }}>
              <img src={src} alt="Gallery image" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,6,8,0.8), transparent 50%)", pointerEvents: "none" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
