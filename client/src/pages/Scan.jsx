import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload, Loader2, Leaf, ScanLine, X, CheckCircle,
  AlertTriangle, Download, CloudSun, Beaker, Sprout, ShieldCheck,
  Bug
} from "lucide-react";
import { detection, pest, isAuthenticated } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const cropOptions = [
  "Tomato", "Wheat", "Rice", "Maize", "Potato", "Cotton", "Sugarcane",
  "Soybean", "Groundnut", "Mango", "Apple", "Grape", "Onion", "Chilli", "Unknown",
];

const getSeverityStyle = (severity) => {
  if (!severity) return { badge: "bg-muted text-muted-foreground", bar: "bg-muted" };
  const s = severity.toLowerCase();
  if (s === "severe") return { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", bar: "bg-red-500" };
  if (s === "moderate") return { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", bar: "bg-amber-500" };
  if (s === "mild") return { badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", bar: "bg-yellow-500" };
  return { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", bar: "bg-green-500" };
};

const getThreatBadge = (level) => {
  const base = "px-2 py-0.5 rounded-full text-xs font-medium";
  if (!level) return `${base} bg-muted text-muted-foreground`;
  const l = level.toLowerCase();
  if (l === "high")        return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
  if (l === "medium")      return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
  if (l === "beneficial")  return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
  return `${base} bg-muted text-muted-foreground`;
};

const ScanPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropType, setCropType] = useState("Unknown");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  
  // Toggle for scan type
  const [scanType, setScanType] = useState("disease"); // "disease" | "pest"

  // Guard — not logged in
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <Leaf className="h-16 w-16 text-primary mx-auto mb-6 animate-float" />
          <h1 className="text-3xl font-heading font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            You need an account to scan crops. It's free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/get-started"
              className="border border-border px-6 py-3 rounded-full font-medium hover:bg-muted transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image exceeds 10 MB limit.");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScanTypeChange = (type) => {
    if (type === scanType) return;
    setScanType(type);
    clearImage();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      if (scanType === "disease") {
        const data = await detection.analyze(selectedFile, cropType);
        setResult(data);
      } else {
        const data = await pest.analyze(selectedFile, cropType);
        setResult(data);
      }
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.id) return;
    setDownloading(true);
    try {
      if (scanType === "disease") {
        await detection.downloadReport(result.id);
      } else {
        await pest.downloadReport(result.id);
      }
    } catch {
      setError("Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  // Health score colour
  const healthColor =
    !result ? "" :
    result.healthScore >= 70 ? "text-green-600 dark:text-green-400" :
    result.healthScore >= 40 ? "text-amber-600 dark:text-amber-400" :
    "text-red-600 dark:text-red-400";

  const severityStyle = result && scanType === "disease" ? getSeverityStyle(result.severity) : null;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            {scanType === "disease" ? (
              <><ScanLine className="h-4 w-4" /> AI-Powered Disease Detection</>
            ) : (
              <><Bug className="h-4 w-4" /> AI-Powered Pest Identification</>
            )}
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-medium text-foreground leading-tight mb-4">
            Scan Your <span className="italic text-primary">{scanType === "disease" ? "Crop" : "Insect"}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {scanType === "disease" 
              ? "Upload a clear photo of the affected leaf or plant. Our AI identifies the disease and generates a full treatment plan instantly."
              : "Upload a photo of an insect or pest on your crop. Our AI identifies it and recommends safe control measures."}
          </p>
          
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => handleScanTypeChange("disease")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                scanType === "disease" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border"
              }`}
            >
              Disease Scan
            </button>
            <button
              onClick={() => handleScanTypeChange("pest")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                scanType === "pest" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border"
              }`}
            >
              Pest/Insect Scan
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Upload Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer overflow-hidden ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              style={{ aspectRatio: preview ? "4/3" : "1/1" }}
              onClick={() => !preview && fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-1">
                    {scanType === "disease" ? "Drop your leaf photo here" : "Drop your insect photo here"}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    JPEG, PNG, WEBP, GIF · Max 10 MB
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {/* Crop type */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Crop Type{" "}
                <span className="text-muted-foreground font-normal">
                  (helps improve accuracy)
                </span>
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {cropOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ScanLine className="h-5 w-5" />
                  Analyze Now
                </>
              )}
            </button>

            {/* Rate limit note */}
            <p className="text-xs text-center text-muted-foreground">
              Rate limit: 20 scans per minute
            </p>
          </motion.div>

          {/* ── Results Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {/* Placeholder */}
              {!result && !loading && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] rounded-2xl border border-dashed border-border flex items-center justify-center text-center p-8"
                >
                  <div>
                    {scanType === "disease" ? (
                      <Leaf className="h-16 w-16 text-leaf-light mx-auto mb-4 animate-float" strokeWidth={1} />
                    ) : (
                      <Bug className="h-16 w-16 text-leaf-light mx-auto mb-4 animate-float" strokeWidth={1} />
                    )}
                    <p className="text-muted-foreground font-medium">
                      Diagnosis results will appear here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a photo and click Analyze Now
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] rounded-2xl border border-border flex items-center justify-center text-center p-8"
                >
                  <div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <ScanLine className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="font-medium text-foreground">
                      {scanType === "disease" ? "Scanning leaf..." : "Identifying insect..."}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Kindwise AI identifying {scanType === "disease" ? "disease" : "pest"} · generating treatment plan
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Result: DISEASE */}
              {result && scanType === "disease" && (
                <motion.div
                  key="result-disease"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 bg-muted/30 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                            Diagnosis Complete
                          </span>
                        </div>
                        <h2 className="font-heading text-2xl font-semibold text-foreground truncate">
                          {result.diseaseName || "Unknown"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">
                            {result.cropType}
                          </span>
                          {result.diseaseType && result.diseaseType !== "Healthy" && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {result.diseaseType}
                            </span>
                          )}
                          {result.diseaseCategory && result.diseaseCategory !== result.diseaseType && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {result.diseaseCategory}
                            </span>
                          )}
                          {result.severity && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityStyle.badge}`}>
                              {result.severity}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Health Score */}
                      <div className="text-right shrink-0">
                        <div className={`font-heading text-4xl font-bold ${healthColor}`}>
                          {result.healthScore ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">/ 100 health</div>
                        {result.confidence != null && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {(result.confidence * 100).toFixed(1)}% confidence
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Health bar */}
                    {result.healthScore != null && (
                      <div className="mt-4 w-full bg-border rounded-full h-2">
                        <div
                          className={`h-full rounded-full transition-all ${severityStyle.bar}`}
                          style={{ width: `${result.healthScore}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5 overflow-y-auto max-h-[480px]">

                    {/* Disease description */}
                    {result.description && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                          About this Disease
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {result.description}
                        </p>
                      </div>
                    )}

                    {/* Symptoms — new field from plant.id v3 */}
                    {result.symptoms && result.symptoms !== "No symptoms detected." && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                          Visible Symptoms
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {result.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Treatment */}
                    {result.treatment && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                          Treatment Plan
                          {result.treatment.aiGenerated && (
                            <span className="ml-2 text-primary normal-case tracking-normal font-normal">
                              · AI Generated
                            </span>
                          )}
                        </h3>

                        {result.treatment.organicRemedy && (
                          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/15 rounded-lg border border-green-200 dark:border-green-800">
                            <Sprout className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-0.5">
                                Organic Remedy
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {result.treatment.organicRemedy}
                              </p>
                            </div>
                          </div>
                        )}

                        {result.treatment.chemicalPesticide && (
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/15 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Beaker className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-0.5">
                                Chemical Treatment
                              </div>
                              <p className="text-sm text-foreground/80">
                                {result.treatment.chemicalPesticide}
                              </p>
                              {result.treatment.pesticideDosage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Dosage: {result.treatment.pesticideDosage}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {result.treatment.preventiveMeasures && (
                          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/15 rounded-lg border border-amber-200 dark:border-amber-800">
                            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">
                                Preventive Measures
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {result.treatment.preventiveMeasures}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scanned image preview (Cloudinary URL) */}
                    {result.imageUrl && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                          Processed Image
                        </h3>
                        <img
                          src={result.imageUrl}
                          alt="Scanned crop"
                          className="w-full rounded-lg object-cover max-h-48"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-border">
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex-1 flex items-center justify-center gap-2 border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
                      >
                        {downloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download PDF Report
                      </button>
                      <Link
                        to="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        View History
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Result: PEST */}
              {result && scanType === "pest" && (
                <motion.div
                  key="result-pest"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 bg-muted/30 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                            Identification Complete
                          </span>
                        </div>
                        <h2 className="font-heading text-2xl font-semibold text-foreground truncate">
                          {result.commonName || result.scientificName || "Unknown Insect"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground italic">
                            {result.scientificName}
                          </span>
                          {result.threatLevel && (
                            <span className={getThreatBadge(result.threatLevel)}>
                              {result.threatLevel} Threat
                            </span>
                          )}
                          {result.isCropPest && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                              Crop Pest
                            </span>
                          )}
                        </div>
                        {result.taxonomyOrder && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {[result.taxonomyClass, result.taxonomyOrder, result.taxonomyFamily].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {result.confidence != null && (
                          <>
                            <div className="text-3xl font-bold text-primary">
                              {(result.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Confidence</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5 overflow-y-auto max-h-[480px]">

                    {/* Pest description */}
                    {result.description && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                          About this Insect
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {result.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {(result.dangerTags?.length > 0 || result.roleTags?.length > 0) && (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {result.dangerTags?.map(tag => (
                            <span key={tag} className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-full">{tag}</span>
                          ))}
                          {result.roleTags?.map(tag => (
                            <span key={tag} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatment / Control */}
                    {(result.organicControl || result.chemicalControl || result.preventiveMeasures || result.cropImpact) && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                          Control & Prevention
                          <span className="ml-2 text-primary normal-case tracking-normal font-normal">
                            · AI Generated
                          </span>
                        </h3>

                        {result.cropImpact && (
                          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/15 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">
                                Potential Impact
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {result.cropImpact}
                              </p>
                            </div>
                          </div>
                        )}

                        {result.organicControl && (
                          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/15 rounded-lg border border-green-200 dark:border-green-800">
                            <Sprout className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-0.5">
                                Organic Control
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {result.organicControl}
                              </p>
                            </div>
                          </div>
                        )}

                        {result.chemicalControl && (
                          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/15 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Beaker className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-0.5">
                                Chemical Control
                              </div>
                              <p className="text-sm text-foreground/80">
                                {result.chemicalControl}
                              </p>
                            </div>
                          </div>
                        )}

                        {result.preventiveMeasures && (
                          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/15 rounded-lg border border-amber-200 dark:border-amber-800">
                            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">
                                Preventive Measures
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {result.preventiveMeasures}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scanned image preview (Cloudinary URL) */}
                    {result.imageUrl && (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                          Processed Image
                        </h3>
                        <img
                          src={result.imageUrl}
                          alt="Scanned insect"
                          className="w-full rounded-lg object-cover max-h-48"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-border">
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex-1 flex items-center justify-center gap-2 border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
                      >
                        {downloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download PDF Report
                      </button>
                      <Link
                        to="/dashboard"
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        View History
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
