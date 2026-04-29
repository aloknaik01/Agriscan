import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Leaf, Sparkles, ScanLine, Shield, CloudSun, BarChart3, FileText, Bell } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroFields from "@/assets/hero-fields.jpg";
import leafMacro from "@/assets/leaf-macro.jpg";
import handsCrop from "@/assets/hands-crop.jpg";
import phoneScan from "@/assets/phone-scan.jpg";
import harvestFlatlay from "@/assets/harvest-flatlay.jpg";

const stats = [
  { value: "10K+", label: "Farmers Served" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "50+", label: "Crop Diseases" },
  { value: "24/7", label: "AI Support" },
];

const features = [
  { num: "01", icon: ScanLine, tag: "Diagnose", title: "Instant disease detection from a single leaf.", desc: "Capture a photo of any crop leaf and our trained vision models return a confident diagnosis in under three seconds.", image: phoneScan },
  { num: "02", icon: Shield, tag: "Treat", title: "Treatment plans written by AI agronomists.", desc: "Every diagnosis is paired with a step-by-step treatment plan, refined with regional pesticide guidance and organic alternatives.", image: leafMacro },
  { num: "03", icon: CloudSun, tag: "Predict", title: "Weather-aware risk alerts before damage starts.", desc: "Hyperlocal forecasts cross-referenced with disease pressure models warn you days before outbreaks become visible.", image: harvestFlatlay },
];

const quotes = [
  { text: "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.", author: "John F. Kennedy" },
  { text: "Agriculture is the most healthful, most useful, and most noble employment of man.", author: "George Washington" },
  { text: "The ultimate goal of farming is not the growing of crops, but the cultivation of human beings.", author: "Masanobu Fukuoka" },
];

const marqueePhrases = [
  "Predict with patience",
  "Harvest with care",
  "Serving 10,000+ farmers",
  "Diagnose with light",
  "Treat with wisdom",
  "Precision agriculture",
  "AI diagnosis",
  "Crop intelligence",
];

const CornerBrackets = () => (
  <>
    <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t border-l border-gold/80" />
    <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t border-r border-gold/80" />
    <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b border-l border-gold/80" />
    <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold/80" />
  </>
);

const Index = () => {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroTextOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 300], [0, -40]);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section ref={heroRef} className="relative h-screen min-h-[760px] w-full overflow-hidden">
        <motion.img
          src={heroFields}
          alt="Aerial view of misty terraced rice paddies at sunrise"
          className="absolute inset-0 w-full h-[115%] object-cover"
          style={{ y: heroImageY }}
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/10 to-foreground/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 via-transparent to-transparent" />

        <div className="absolute top-28 left-0 right-0 px-6 lg:px-12 z-10 flex justify-between items-start text-primary-foreground/80 text-[10px] tracking-[0.3em] uppercase font-medium">
          <span className="flex items-center gap-3">
            <span className="w-8 h-px bg-gold" />
            Precision Agriculture
          </span>
          <span className="hidden md:block">N° 001 / Spring Edition · 2026</span>
        </div>

        <div
          className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          Vol I — The Field Edition
        </div>
        <div
          className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl" }}
        >
          Est. 2024 · Rooted in Soil
        </div>

        <motion.div
          className="absolute inset-0 flex flex-col justify-end pb-20 md:pb-28 px-6 lg:px-12 z-10"
          style={{ opacity: heroTextOpacity, y: heroTextY }}
        >
          <div className="container mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading text-primary-foreground text-[clamp(3rem,10vw,9rem)] leading-[0.92] font-medium tracking-tight max-w-5xl"
            >
              Healthy crops,
              <br />
              <span className="italic font-normal text-gold">cultivated</span> by
              <br />
              intelligence.
            </motion.h1>

            <div className="mt-12 grid lg:grid-cols-12 gap-8 items-end">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 lg:col-start-1 text-primary-foreground/85 text-base md:text-lg leading-relaxed font-light max-w-md"
              >
                AgriScan brings agronomist-grade disease diagnosis to every farmer's pocket. One photograph. One verdict. One protected harvest.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 lg:col-start-8 flex flex-wrap items-center gap-6 lg:justify-end"
              >
                <Link
                  to="/scan"
                  className="group inline-flex items-center gap-3 bg-gold text-foreground px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-primary-foreground transition-all hover:scale-[1.02]"
                >
                  Begin Scanning
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/features"
                  className="text-sm font-medium tracking-wide text-primary-foreground/90 hover:text-gold underline-grow"
                >
                  Explore the platform
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-6 right-6 text-[9px] tracking-[0.3em] uppercase text-primary-foreground/50 hidden md:block">
          © AgriScan / Field N° 0427
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-foreground text-primary-foreground py-5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueePhrases, ...marqueePhrases].map((phrase, i) => (
            <span key={i} className="mx-8 text-[11px] tracking-[0.35em] uppercase font-medium inline-flex items-center gap-8">
              {phrase}
              <Leaf className="h-3 w-3 text-gold" strokeWidth={1.5} />
            </span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="py-12 px-6 text-center group cursor-default"
              >
                <div className="font-heading text-5xl md:text-6xl font-medium text-primary tracking-tight transition-transform duration-500 group-hover:-translate-y-1">
                  {s.value}
                </div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-3">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TAGLINE */}
      <section className="py-28 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Leaf className="h-[36rem] w-[36rem] text-leaf-light animate-float" strokeWidth={0.5} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto px-6 max-w-4xl text-center relative"
        >
          <div className="divider-leaf mb-10">
            <Leaf className="h-4 w-4" />
          </div>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-medium text-foreground leading-[1.15] text-balance">
            <span className="italic font-normal text-primary">"जो किसान को बचाए,</span>
            <br />
            वही तकनीक सच्ची है।"
          </h2>
          <p className="mt-8 text-base text-muted-foreground italic font-light tracking-wide">
            The technology that saves the farmer is the only true technology.
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="bg-foreground text-primary-foreground py-24 md:py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 mb-24 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
                — Chapter Index / 003 Plates
              </div>
              <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium leading-[0.95] text-balance">
                Three quiet tools.
                <br />
                <span className="italic font-normal text-gold">One protected season.</span>
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 lg:col-start-9"
            >
              <p className="text-primary-foreground/70 font-light leading-relaxed text-base">
                A complete intelligence stack — engineered for the field, refined for the farmer.
              </p>
            </motion.div>
          </div>

          <div className="space-y-2">
            {features.map((f, i) => (
              <motion.article
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group grid lg:grid-cols-12 gap-6 lg:gap-12 items-center py-12 border-t border-primary-foreground/15 transition-colors hover:border-gold/50"
              >
                <div className="lg:col-span-2">
                  <div className="font-heading text-7xl md:text-8xl font-light text-gold/40 leading-none transition-colors group-hover:text-gold">
                    {f.num}
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-4">
                    <f.icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    <span className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/60">{f.tag}</span>
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.1] text-balance">
                    {f.title}
                  </h3>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-primary-foreground/70 font-light leading-relaxed text-[15px]">{f.desc}</p>
                </div>
                <div className="lg:col-span-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <img src={f.image} alt={f.title} loading="lazy" width={400} height={300} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <CornerBrackets />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/features" className="inline-flex items-center gap-3 text-sm font-medium tracking-wide text-gold underline-grow">
              See full capability map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 md:py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-elevated">
                <img src={handsCrop} alt="Weathered farmer's hands holding fresh wheat" loading="lazy" width={1080} height={1350} className="w-full h-full object-cover animate-ken-burns" />
                <CornerBrackets />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-8 -right-8 bg-background border border-border p-6 max-w-[220px] shadow-elevated hidden md:block"
              >
                <div className="font-heading text-5xl text-primary leading-none">40%</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mt-3 leading-relaxed">
                  Of global crops lost annually to disease — what we're here to change.
                </div>
              </motion.div>
              <div
                className="absolute -left-3 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.4em] uppercase text-muted-foreground hidden lg:block"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                The hands that feed the world
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 lg:pl-8 flex flex-col justify-center"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">— Chapter 01 / The Mission</div>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05] text-balance">
                Built for the <span className="italic">hands</span> that feed us.
              </h2>
              <p className="mt-10 text-lg text-muted-foreground leading-relaxed font-light first-letter:font-heading first-letter:text-7xl first-letter:font-medium first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
                AgriScan was built on a single belief — that every farmer, regardless of acreage or income, deserves the same expert care once reserved for industrial estates. We bring the laboratory to the field, in a language the field already speaks.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary mt-12 underline-grow">
                Read the full story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 md:py-44 overflow-hidden border-t border-border">
        <img src={heroFields} alt="" className="absolute inset-0 w-full h-full object-cover animate-ken-burns" loading="lazy" />
        <div className="absolute inset-0 bg-foreground/75" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto px-6 text-center max-w-3xl relative z-10 text-primary-foreground"
        >
          <Sparkles className="h-8 w-8 text-gold mx-auto mb-8 animate-float" strokeWidth={1.5} />
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.02] text-balance">
            Protect this season's <span className="italic text-gold">harvest.</span>
          </h2>
          <p className="mt-8 text-lg max-w-xl mx-auto leading-relaxed font-light text-primary-foreground/85">
            Join thousands of farmers who trust AgriScan to guard their fields. Begin in under a minute — free, always.
          </p>
          <div className="flex flex-wrap justify-center gap-5 mt-12">
            <Link to="/get-started" className="bg-gold text-foreground px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-primary-foreground transition-all hover:scale-[1.02] inline-flex items-center gap-3">
              Get Started <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/scan" className="border border-primary-foreground/40 px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-primary-foreground hover:text-primary transition-colors">
              Scan a Crop Now
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
