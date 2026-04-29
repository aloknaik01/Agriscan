import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Scan, Shield, CloudSun, BarChart3, FileText, Bell, Users, Lock, Globe, Leaf } from "lucide-react";
import scanImage from "@/assets/scan-feature.jpg";
import phoneScan from "@/assets/phone-scan.jpg";
import leafMacro from "@/assets/leaf-macro.jpg";
import harvestFlatlay from "@/assets/harvest-flatlay.jpg";

const plates = [
  { num: "01", icon: Scan, tag: "Diagnose", title: "Disease detection from a single photograph.", desc: "PlantNet-trained vision returns plant species, disease, and confidence in under three seconds.", image: phoneScan },
  { num: "02", icon: Shield, tag: "Treat", title: "Treatment plans written by AI agronomists.", desc: "Each verdict pairs with regional pesticide guidance and organic alternatives — refined daily.", image: leafMacro },
  { num: "03", icon: CloudSun, tag: "Predict", title: "Weather-aware risk alerts before damage starts.", desc: "Hyperlocal forecasts cross-referenced with disease pressure models warn you days ahead.", image: harvestFlatlay },
];

const grid = [
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Total scans, health scores, disease trends, crop breakdowns — cached for instant access." },
  { icon: FileText, title: "PDF Field Reports", desc: "Professional reports per scan: image, diagnosis, treatment plan — ready to share." },
  { icon: Bell, title: "Critical Alerts", desc: "Email notifications after every scan; severe detections trigger immediate alerts." },
  { icon: Users, title: "Multi-Role Access", desc: "Farmer, Agronomist, and Admin tiers — each with the right permissions and dashboards." },
  { icon: Lock, title: "Enterprise Security", desc: "JWT auth, BCrypt hashing, rate limiting, and role-based access protect every record." },
  { icon: Globe, title: "Multi-Language", desc: "Set your language in your profile. AgriScan speaks the way the field speaks." },
];

const marqueePhrases = [
  "Diagnose with light",
  "Treat with wisdom",
  "Predict with patience",
  "Harvest with care",
  "Crop intelligence",
  "Built for the field",
];

const CornerBrackets = () => (
  <>
    <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t border-l border-gold/80" />
    <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t border-r border-gold/80" />
    <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b border-l border-gold/80" />
    <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold/80" />
  </>
);

const Features = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroTextOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 300], [0, -40]);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <motion.img
          src={scanImage}
          alt="Scanning crop leaves with a smartphone"
          className="absolute inset-0 w-full h-[115%] object-cover"
          style={{ y: heroImageY }}
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/45 via-foreground/15 to-foreground/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/45 via-transparent to-transparent" />

        <div className="absolute top-28 left-0 right-0 px-6 lg:px-12 z-10 flex justify-between items-start text-primary-foreground/80 text-[10px] tracking-[0.3em] uppercase font-medium">
          <span className="flex items-center gap-3">
            <span className="w-8 h-px bg-gold" />
            Features
          </span>
          <span className="hidden md:block">N° 003 / The Capability Map</span>
        </div>

        <div
          className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          Vol III — Tools of the Trade
        </div>
        <div
          className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl" }}
        >
          Engineered for the field
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
              className="font-heading text-primary-foreground text-[clamp(2.5rem,9vw,8rem)] leading-[0.92] font-medium tracking-tight max-w-5xl"
            >
              Everything a
              <br />
              farmer <span className="italic font-normal text-gold">needs.</span>
            </motion.h1>

            <div className="mt-12 grid lg:grid-cols-12 gap-8 items-end">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 text-primary-foreground/85 text-base md:text-lg leading-relaxed font-light max-w-md"
              >
                From AI-powered scanning to weather alerts and field reports — AgriScan is the complete crop protection platform, refined down to its quietest detail.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 lg:col-start-8 lg:justify-end flex"
              >
                <Link
                  to="/get-started"
                  className="group inline-flex items-center gap-3 bg-gold text-foreground px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-primary-foreground transition-all hover:scale-[1.02]"
                >
                  Try It Free
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-foreground text-primary-foreground py-5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueePhrases, ...marqueePhrases].map((p, i) => (
            <span key={i} className="mx-8 text-[11px] tracking-[0.35em] uppercase font-medium inline-flex items-center gap-8">
              {p}
              <Leaf className="h-3 w-3 text-gold" strokeWidth={1.5} />
            </span>
          ))}
        </div>
      </section>

      {/* PROCESS — magazine spread */}
      <section className="py-24 md:py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-elevated">
                <img src={phoneScan} alt="Scanning a leaf" loading="lazy" className="w-full h-full object-cover animate-ken-burns" />
                <CornerBrackets />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">— The Ritual</div>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-balance mb-10">
                Scan. Diagnose.
                <br />
                <span className="italic font-normal text-primary">Treat.</span>
              </h2>
              <div className="space-y-5">
                {["Capture or upload a leaf photo", "AI identifies the plant and disease", "Receive severity score and treatment plan", "Download the PDF and act"].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-5 group"
                  >
                    <div className="font-heading text-2xl font-medium text-gold/60 group-hover:text-gold transition-colors w-10">
                      0{i + 1}
                    </div>
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-foreground/85 text-base font-light flex-shrink-0 max-w-xs text-right">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PLATES — chapter index */}
      <section className="bg-foreground text-primary-foreground py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 mb-20 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
                — Core Capabilities / 003 Plates
              </div>
              <h2 className="font-heading text-5xl md:text-7xl font-medium leading-[0.95] text-balance">
                Three quiet tools.
                <br />
                <span className="italic font-normal text-gold">One protected season.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 lg:col-start-9 text-primary-foreground/70 font-light leading-relaxed"
            >
              The intelligence stack — engineered for the field, refined for the farmer.
            </motion.p>
          </div>

          <div className="space-y-2">
            {plates.map((f, i) => (
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
                    <img src={f.image} alt={f.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <CornerBrackets />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO GRID — secondary capabilities */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mb-16"
          >
            <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
              — Supporting Cast / 006 Capabilities
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-balance">
              The quiet machinery
              <br />
              <span className="italic font-normal text-primary">behind every harvest.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {grid.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                className="bg-background p-10 group hover:bg-cream transition-colors duration-500"
              >
                <g.icon className="h-7 w-7 text-primary mb-6 group-hover:text-gold transition-colors" strokeWidth={1.5} />
                <h3 className="font-heading text-xl md:text-2xl font-medium text-foreground mb-3">{g.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed text-[15px]">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-foreground text-primary-foreground text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <Leaf className="h-10 w-10 text-gold mx-auto mb-8 animate-float" strokeWidth={1.5} />
            <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.05] text-balance">
              Start protecting
              <br />
              <span className="italic font-normal text-gold">your crops today.</span>
            </h2>
            <p className="mt-8 text-primary-foreground/70 font-light text-lg max-w-xl mx-auto">
              Ten seconds to scan. No expertise required. The harvest you protect may be your own.
            </p>
            <Link
              to="/get-started"
              className="group inline-flex items-center gap-3 bg-gold text-foreground px-10 py-4 rounded-full text-sm font-medium tracking-wide mt-12 hover:bg-primary-foreground transition-all hover:scale-[1.02]"
            >
              Begin Scanning
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
