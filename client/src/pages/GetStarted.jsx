import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import { auth } from "@/lib/api";
import { motion } from "framer-motion";

const languageOptions = [
  "English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada",
  "Bengali", "Gujarati", "Punjabi", "Odia", "Malayalam",
];

const GetStarted = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    region: "",
    state: "",
    farmSize: "",
    crops: "",
    language: "English",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        region: form.region || undefined,
        state: form.state || undefined,
        farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined,
        // "crops" field — array of strings per API docs
        crops: form.crops
          ? form.crops.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined,
        language: form.language || undefined,
      };
      await auth.register(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg mx-auto"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Get Started with AgriScan
            </h1>
            <p className="text-muted-foreground mt-3">
              Create your free account and start protecting your crops today.
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated border border-border p-8">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Required */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ramesh@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Password <span className="text-destructive">*</span>{" "}
                  <span className="text-muted-foreground font-normal">(min 6 characters)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Optional divider */}
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Optional — helps us personalise your experience
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Farm Size (acres)</label>
                  <input
                    type="number"
                    name="farmSize"
                    step="0.1"
                    min="0"
                    value={form.farmSize}
                    onChange={handleChange}
                    placeholder="5.5"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    placeholder="Vidarbha"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Primary Crops{" "}
                  <span className="text-muted-foreground font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="crops"
                  value={form.crops}
                  onChange={handleChange}
                  placeholder="Tomato, Wheat, Rice"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Preferred Language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {languageOptions.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 italic">
            "खेती हमारी संस्कृति है, तकनीक हमारी ताकत है" — Farming is our culture, technology is
            our strength.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default GetStarted;
