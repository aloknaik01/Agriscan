import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Bug, AlertTriangle, CloudRain, TrendingDown, Stethoscope, Sprout, CheckCircle, Leaf } from "lucide-react";
import diseaseImage from "@/assets/crop-disease.jpg";
import handsCrop from "@/assets/hands-crop.jpg";

const problems = [
  { num: "01", icon: Bug, tag: "Detection", title: "Late disease detection.", desc: "Most farmers spot disease only after 40% damage. By then, treatment is expensive — and the harvest is already lost." },
  { num: "02", icon: AlertTriangle, tag: "Access", title: "No agronomist within reach.", desc: "Rural farmers live hours from the nearest expert. Advice arrives in days. Crops do not have days." },
  { num: "03", icon: CloudRain, tag: "Climate", title: "Unpredictable weather.", desc: "Climate change brews perfect storms for disease — and farmers cannot foresee what they cannot measure." },
  { num: "04", icon: TrendingDown, tag: "Economics", title: "Income loss & debt.", desc: "Crop failures push farmers into cycles of debt. India alone loses ₹50,000 crore annually to plant disease." },
  { num: "05", icon: Stethoscope, tag: "Misdiagnosis", title: "The wrong cure.", desc: "Without proper tools, farmers misidentify diseases — wasting money on the wrong pesticide and harming the soil." },
  { num: "06", icon: Sprout, tag: "Knowledge", title: "The knowledge gap.", desc: "New farmers and smallholders lack the generational wisdom required to manage modern crop health threats." },
];

const solutions = [
  { problem: "Can't identify the disease?", solution: "Snap a photo — instant AI diagnosis with confidence score." },
  { problem: "No agronomist nearby?", solution: "AI generates expert-level treatment plans on the spot." },
  { problem: "Worried about the weather?", solution: "Predictive advisory warns of disease risk days in advance." },
  { problem: "Need to track crop health?", solution: "Analytics dashboard reveals trends, breakdowns & scores." },
  { problem: "Want to share reports?", solution: "Download detailed PDF reports — share with anyone." },
  { problem: "Fear missing a critical alert?", solution: "Email alerts notify you instantly on severe detections." },
];

const marqueePhrases = [
  "Save the crop",
  "Save the farmer",
  "Save the harvest",
  "Save the season",
  "Cultivate with care",
  "Protect what feeds us",
];

const CornerBrackets = () => (
  <>
    <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t border-l border-gold/80" />
    <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t border-r border-gold/80" />
    <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b border-l border-gold/80" />
    <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b border-r border-gold/80" />
  </>
);

const Problems = () => {
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
          src={diseaseImage}
          alt="Close-up of diseased crop leaves"
          className="absolute inset-0 w-full h-[115%] object-cover"
          style={{ y: heroImageY }}
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/25 to-foreground/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/55 via-transparent to-transparent" />

        <div className="absolute top-28 left-0 right-0 px-6 lg:px-12 z-10 flex justify-between items-start text-primary-foreground/80 text-[10px] tracking-[0.3em] uppercase font-medium">
          <span className="flex items-center gap-3">
            <span className="w-8 h-px bg-gold" />
            The Challenge
          </span>
          <span className="hidden md:block">N° 004 / The Invisible War</span>
        </div>

        <div
          className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          Vol IV — What Farmers Face
        </div>
        <div
          className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl" }}
        >
          And how we change it
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
              The invisible
              <br />
              <span className="italic font-normal text-gold">battles</span> a farmer
              <br />
              fights daily.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 text-primary-foreground/85 text-base md:text-lg leading-relaxed font-light max-w-xl"
            >
              Agriculture feeds the world — yet farmers fight invisible enemies every day. AgriScan exists to make the invisible visible, and the unmanageable solvable.
            </motion.p>
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

      {/* PROBLEMS — chapter plates */}
      <section className="py-24 md:py-32 bg-background">
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
                — Six Quiet Crises / 006 Plates
              </div>
              <h2 className="font-heading text-5xl md:text-7xl font-medium text-foreground leading-[0.95] text-balance">
                What we lose
                <br />
                <span className="italic font-normal text-primary">when no one is watching.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 lg:col-start-9 text-muted-foreground font-light leading-relaxed"
            >
              These are the daily realities behind the headlines — the slow attritions that turn a good year into a debt-ridden one.
            </motion.p>
          </div>

          <div className="space-y-2">
            {problems.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group grid lg:grid-cols-12 gap-6 lg:gap-12 items-center py-10 border-t border-border transition-colors hover:border-gold/60"
              >
                <div className="lg:col-span-2">
                  <div className="font-heading text-7xl md:text-8xl font-light text-gold/30 leading-none transition-colors group-hover:text-gold">
                    {p.num}
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-4">
                    <p.icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{p.tag}</span>
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.1] text-balance text-foreground">
                    {p.title}
                  </h3>
                </div>
                <div className="lg:col-span-5">
                  <p className="text-muted-foreground font-light leading-relaxed text-[15px]">{p.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* HINDI QUOTE — visual break */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <img src={diseaseImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/80" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto px-6 relative z-10 text-center max-w-4xl"
        >
          <div className="divider-leaf mb-10 text-gold/80">
            <Leaf className="h-4 w-4" />
          </div>
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-medium text-primary-foreground leading-[1.15] text-balance">
            <span className="italic font-normal text-gold">"फसल बचेगी तो किसान बचेगा,</span>
            <br />
            किसान बचेगा तो देश बचेगा।"
          </h2>
          <p className="mt-8 text-base text-primary-foreground/70 italic font-light tracking-wide">
            Save the crop, save the farmer. Save the farmer, save the nation.
          </p>
        </motion.div>
      </section>

      {/* SOLUTIONS — magazine spread */}
      <section className="py-24 md:py-32 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9 }}
              className="lg:col-span-5 lg:sticky lg:top-24"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
                — How AgriScan Helps
              </div>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-balance mb-8">
                For every problem,
                <br />
                <span className="italic font-normal text-primary">a quiet answer.</span>
              </h2>
              <p className="text-foreground/75 text-lg leading-[1.8] font-light first-letter:font-heading first-letter:text-7xl first-letter:font-medium first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1">
                We didn't build a feature list. We built a response — to every quiet crisis a farmer faces between sunrise and harvest.
              </p>
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-elevated mt-10">
                <img src={handsCrop} alt="Hands holding wheat" loading="lazy" className="w-full h-full object-cover animate-ken-burns" />
                <CornerBrackets />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="lg:col-span-7 space-y-px bg-border"
            >
              {solutions.map((s, i) => (
                <motion.div
                  key={s.problem}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="bg-background p-8 group hover:bg-cream transition-colors duration-500"
                >
                  <div className="flex items-start gap-5">
                    <div className="font-heading text-2xl text-gold/60 group-hover:text-gold transition-colors flex-shrink-0">
                      0{i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Problem</p>
                      <p className="font-heading text-xl md:text-2xl text-foreground font-medium leading-tight">{s.problem}</p>
                      <div className="flex items-start gap-3 mt-5 pt-5 border-t border-border">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-foreground/80 font-light leading-relaxed">{s.solution}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
              Don't let disease win.
              <br />
              <span className="italic font-normal text-gold">Fight back — gently.</span>
            </h2>
            <p className="mt-8 text-primary-foreground/70 font-light text-lg max-w-xl mx-auto">
              Every moment counts when disease strikes. Begin scanning your crops now — it costs nothing but a photograph.
            </p>
            <Link
              to="/get-started"
              className="group inline-flex items-center gap-3 bg-gold text-foreground px-10 py-4 rounded-full text-sm font-medium tracking-wide mt-12 hover:bg-primary-foreground transition-all hover:scale-[1.02]"
            >
              Start Scanning
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Problems;
