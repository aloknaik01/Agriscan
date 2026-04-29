import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-6 pt-20 pb-10">
      <div className="grid md:grid-cols-12 gap-12 mb-16">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary" strokeWidth={2.2} />
            </div>
            <span className="text-lg font-heading font-semibold tracking-tight">AgriScan</span>
          </div>
          <p className="text-base font-light leading-relaxed text-primary-foreground/70 max-w-sm">
            Agronomist-grade disease diagnosis, in every farmer's pocket. Scan, diagnose, protect — one
            photograph at a time.
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gold mb-5">Explore</h4>
          <div className="space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/features", label: "Features" },
              { to: "/problems", label: "Solutions" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="block text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gold mb-5">Account</h4>
          <div className="space-y-3">
            <Link to="/get-started" className="block text-sm text-primary-foreground/70 hover:text-gold transition-colors">
              Get Started
            </Link>
            <Link to="/login" className="block text-sm text-primary-foreground/70 hover:text-gold transition-colors">
              Sign In
            </Link>
            <Link to="/dashboard" className="block text-sm text-primary-foreground/70 hover:text-gold transition-colors">
              Dashboard
            </Link>
            <Link to="/scan" className="block text-sm text-primary-foreground/70 hover:text-gold transition-colors">
              Scan a Crop
            </Link>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gold mb-5">Contact</h4>
          <p className="text-sm text-primary-foreground/70">support@agriscan.app</p>
          <p className="text-sm text-primary-foreground/50 mt-2 italic font-light">
            Made with care, for the hands that feed us.
          </p>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
        <p>© 2026 AgriScan. Cultivated with intention.</p>
        <p className="tracking-[0.2em] uppercase">Nurturing crops · Empowering farmers</p>
      </div>
    </div>
  </footer>
);

export default Footer;
