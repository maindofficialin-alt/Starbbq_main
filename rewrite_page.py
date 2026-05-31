import re

with open("app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace useBreakpoint and rv with useWindowSize and f/fs
replacements = {
    "type DeviceTier = 'mobile-sm' | 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';": "const wAnchors = [320, 390, 768, 1024, 1440, 1920];\nfunction f(w: number, v: number[]): number {\n  if (w <= wAnchors[0]) return v[0];\n  if (w >= wAnchors[5]) return v[5];\n  for (let i = 0; i < 5; i++) {\n    if (w >= wAnchors[i] && w <= wAnchors[i+1]) {\n      const t = (w - wAnchors[i]) / (wAnchors[i+1] - wAnchors[i]);\n      return v[i] + t * (v[i+1] - v[i]);\n    }\n  }\n  return v[5];\n}\n\nfunction fs(w: number, v: (number | string)[]): string {\n  const vals = v.map(s => typeof s === \"string\" ? parseFloat(s) : s);\n  return `${f(w, vals)}px`;\n}\n",
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Replace the useBreakpoint hook
old_hook = """function useBreakpoint(): DeviceTier {
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
}"""

new_hook = """function useWindowSize() {
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
}"""

content = content.replace(old_hook, new_hook)

# Remove tierIsMobile and rv functions
content = re.sub(r"function tierIsMobile.*?}\n", "", content, flags=re.DOTALL)
content = re.sub(r"function rv<T>.*?}\n", "", content, flags=re.DOTALL)

# In App():
content = content.replace("const tier = useBreakpoint();", "const { w, isMobile } = useWindowSize();")
content = content.replace("const isMobile = tierIsMobile(tier);", "")
content = content.replace("const pI = isMobile ? 0 : (tier === 'tablet' ? 0.5 : 1);", "const pI = isMobile ? 0 : (w <= 1024 ? 0.5 : 1);")
content = content.replace("tierIsMobile(tier)", "isMobile")

# Update ResizeObserver in useEffect
old_effect = """    const onScroll = () => {
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
    };"""

new_effect = """    const triggerCompute = () => {
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
    };"""

content = content.replace(old_effect, new_effect)

# Regex to replace all rv(tier, { 'mobile-sm': A, mobile: B, tablet: C, laptop: D, desktop: E, tv: F })
pattern = r"rv\(tier, \{\s*'mobile-sm':\s*([^,]+),\s*mobile:\s*([^,]+),\s*tablet:\s*([^,]+),\s*laptop:\s*([^,]+),\s*desktop:\s*([^,]+),\s*tv:\s*([^}]+)\s*\}\)"

def replacer(match):
    vals = [match.group(i).strip() for i in range(1, 7)]
    if any("'" in v or '"' in v for v in vals):
        clean_vals = [re.sub(r"['\"px]", "", v) for v in vals]
        return f"fs(w, [{', '.join(clean_vals)}])"
    else:
        return f"f(w, [{', '.join(vals)}])"

content = re.sub(pattern, replacer, content)

# Remove `tier={tier}` from components
content = content.replace("tier={tier}", "w={w}")

# Replace ArcSliderProps
content = content.replace("interface ArcSliderProps { cards: typeof SCENE2_CARDS; rotationOffset: number; tier: DeviceTier; }", "interface ArcSliderProps { cards: typeof SCENE2_CARDS; rotationOffset: number; w: number; }")
content = content.replace("function ArcCardSlider({ cards, rotationOffset, tier }: ArcSliderProps)", "function ArcCardSlider({ cards, rotationOffset, w }: ArcSliderProps)")
content = content.replace("function ContactUI({ tier, isMobile }: { tier: DeviceTier; isMobile: boolean })", "function ContactUI({ w, isMobile }: { w: number; isMobile: boolean })")

# Replace dvh with --vh calculation
content = content.replace('height: "800dvh"', 'height: "calc(var(--vh, 1vh) * 800)"')
content = content.replace('height: "100dvh"', 'height: "calc(var(--vh, 1vh) * 100)"')
content = content.replace('marginTop: isMobile ? "12dvh" : "0"', 'marginTop: isMobile ? "calc(var(--vh, 1vh) * 12)" : "0"')

# Fix outer container missing paint layout
content = content.replace('id="outer-container" style={{ height: "calc(var(--vh, 1vh) * 800)", position: "relative", backgroundColor: "#0a0608" }}', 'id="outer-container" style={{ height: "calc(var(--vh, 1vh) * 800)", position: "relative", backgroundColor: "#0a0608", contain: "paint layout" }}')

# Fix sticky container missing paint layout
content = content.replace('style={{ position: "sticky", top: 0, height: "calc(var(--vh, 1vh) * 100)", width: "100%", maxWidth: "100vw", overflow: "hidden", backgroundColor: "#0a0608" }}', 'style={{ position: "sticky", top: 0, height: "calc(var(--vh, 1vh) * 100)", width: "100%", maxWidth: "100vw", overflow: "hidden", backgroundColor: "#0a0608", contain: "paint layout" }}')

with open("app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("page.tsx transformed successfully!")
