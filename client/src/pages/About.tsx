import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Heart, Target, Globe, Users, Leaf } from "lucide-react";
import farmerImage from "@/assets/farmer-proud.jpg";
import handsCrop from "@/assets/hands-crop.jpg";
import leafMacro from "@/assets/leaf-macro.jpg";

const values = [
  { num: "01", icon: Heart, tag: "Ethos", title: "Farmer first, always.", desc: "Every interaction is designed for muddy boots and bright sun — accessible, instant, dignified." },
  { num: "02", icon: Target, tag: "Precision", title: "Accuracy as a moral standard.", desc: "We blend botanical AI with agronomist-curated data so a verdict is never a guess." },
  { num: "03", icon: Globe, tag: "Reach", title: "Inclusive by architecture.", desc: "Multi-language, low-bandwidth, and free for smallholders — because soil knows no borders." },
  { num: "04", icon: Users, tag: "Community", title: "Built with the field, not for it.", desc: "Co-designed with growers, agronomists, and rural cooperatives across three continents." },
];

const marqueePhrases = [
  "Rooted in soil",
  "Built with growers",
  "Serving 10,000+ farmers",
  "Cultivated with care",
  "Precision agriculture",
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

const About = () => {
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
          src={farmerImage}
          alt="Farmer standing proud in a green field"
          className="absolute inset-0 w-full h-[115%] object-cover"
          style={{ y: heroImageY }}
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/15 to-foreground/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/45 via-transparent to-transparent" />

        <div className="absolute top-28 left-0 right-0 px-6 lg:px-12 z-10 flex justify-between items-start text-primary-foreground/80 text-[10px] tracking-[0.3em] uppercase font-medium">
          <span className="flex items-center gap-3">
            <span className="w-8 h-px bg-gold" />
            About AgriScan
          </span>
          <span className="hidden md:block">N° 002 / The Origin Story</span>
        </div>

        <div
          className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
        >
          Vol II — A Quiet Mission
        </div>
        <div
          className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-primary-foreground/70 font-medium hidden md:block"
          style={{ writingMode: "vertical-rl" }}
        >
          For the hands that feed us
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
              Technology
              <br />
              rooted in <span className="italic font-normal text-gold">purpose.</span>
            </motion.h1>

            <div className="mt-12 grid lg:grid-cols-12 gap-8 items-end">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-5 lg:col-start-1 text-primary-foreground/85 text-base md:text-lg leading-relaxed font-light max-w-md"
              >
                AgriScan bridges the gap between advanced AI and the farmers who feed our world. Every farmer deserves expert-level crop care — at the speed of light, in the language they think in.
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
                  Join the Mission
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
          {[...marqueePhrases, ...marqueePhrases].map((phrase, i) => (
            <span key={i} className="mx-8 text-[11px] tracking-[0.35em] uppercase font-medium inline-flex items-center gap-8">
              {phrase}
              <Leaf className="h-3 w-3 text-gold" strokeWidth={1.5} />
            </span>
          ))}
        </div>
      </section>

      {/* MISSION — magazine spread with drop cap */}
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
                <img
                  src={handsCrop}
                  alt="Hands holding fresh wheat"
                  loading="lazy"
                  width={1080}
                  height={1350}
                  className="w-full h-full object-cover animate-ken-burns"
                />
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
                  Of global crops lost to disease — what we set out to change.
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 lg:pt-12"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
                — Our Mission
              </div>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-balance mb-8">
                A world where no
                <br />
                <span className="italic font-normal text-primary">harvest is lost</span>
                <br />
                to ignorance.
              </h2>
              <p className="text-foreground/80 text-lg leading-[1.75] font-light first-letter:font-heading first-letter:text-7xl first-letter:font-medium first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1">
                Every year, farmers lose up to 40% of their crops to diseases that early detection could have prevented. AgriScan was born from a single conviction — that the smartphone in a farmer's pocket should be as wise as the agronomist they cannot reach.
              </p>
              <blockquote className="mt-10 border-l-2 border-gold pl-6 italic font-heading text-2xl text-foreground/90 leading-snug">
                "The farmer has to be an optimist — or he wouldn't still be a farmer."
                <span className="block mt-3 text-xs not-italic font-body tracking-[0.3em] uppercase text-muted-foreground">— Will Rogers</span>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES — chapter plates */}
      <section className="bg-foreground text-primary-foreground py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 mb-20 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
                — Our Values / 004 Principles
              </div>
              <h2 className="font-heading text-5xl md:text-7xl font-medium leading-[0.95] text-balance">
                The principles that
                <br />
                <span className="italic font-normal text-gold">guide every line of code.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-4 lg:col-start-9 text-primary-foreground/70 font-light leading-relaxed"
            >
              Four quiet commitments that shape every product decision, every model we train, every screen we ship.
            </motion.p>
          </div>

          <div className="space-y-2">
            {values.map((v, i) => (
              <motion.article
                key={v.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group grid lg:grid-cols-12 gap-6 lg:gap-12 items-center py-10 border-t border-primary-foreground/15 transition-colors hover:border-gold/50"
              >
                <div className="lg:col-span-2">
                  <div className="font-heading text-7xl md:text-8xl font-light text-gold/40 leading-none transition-colors group-hover:text-gold">
                    {v.num}
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-4">
                    <v.icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
                    <span className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/60">{v.tag}</span>
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.1] text-balance">
                    {v.title}
                  </h3>
                </div>
                <div className="lg:col-span-5">
                  <p className="text-primary-foreground/70 font-light leading-relaxed text-[15px]">{v.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* TECH — magazine */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 lg:order-2 relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-elevated">
                <img
                  src={leafMacro}
                  alt="Macro detail of a healthy leaf"
                  loading="lazy"
                  width={1080}
                  height={1350}
                  className="w-full h-full object-cover animate-ken-burns"
                />
                <CornerBrackets />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 lg:order-1"
            >
              <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-6">
                — Powered by Science
              </div>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] text-balance mb-8">
                Botanical AI,
                <br />
                <span className="italic font-normal text-primary">agronomist wisdom.</span>
              </h2>
              <p className="text-foreground/75 text-lg leading-[1.8] font-light mb-5">
                We combine PlantNet's botanical vision models with curated treatment intelligence and hyperlocal weather from Open-Meteo — building a single source of truth for every leaf.
              </p>
              <p className="text-foreground/75 text-lg leading-[1.8] font-light mb-10">
                A robust, secure backend serves farmers, agronomists, and administrators with role-based access and rate limiting — engineered for the field, refined for trust.
              </p>
              <Link
                to="/features"
                className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-foreground transition-all hover:scale-[1.02]"
              >
                Explore Capabilities
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
