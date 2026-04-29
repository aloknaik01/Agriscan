import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ScanLine, History, BarChart3, Leaf, Loader2, AlertTriangle,
  Download, Trash2, User, CloudSun, LogOut, ChevronLeft, ChevronRight,
  Wind, Droplets, Thermometer, ShieldAlert, Search, X, Shield,
} from "lucide-react";
import { detection, weather, user, auth, pest, isAuthenticated } from "@/lib/api";
import { motion } from "framer-motion";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "history",  label: "History",  icon: History },
  { id: "pest",     label: "Pest Scans", icon: ShieldAlert },
  { id: "profile", label: "Profile",  icon: User },
  { id: "admin",   label: "Admin Panel", icon: Shield, adminOnly: true },
];

const getSeverityBadge = (severity) => {
  const base = "px-2 py-0.5 rounded-full text-xs font-medium";
  if (!severity) return `${base} bg-muted text-muted-foreground`;
  const s = severity.toLowerCase();
  if (s === "severe")   return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
  if (s === "moderate") return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
  if (s === "mild")     return `${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`;
  return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
};

const getRiskBadge = (level) => {
  if (!level) return "bg-muted text-muted-foreground";
  const l = level.toLowerCase();
  if (l === "high")   return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (l === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
};

// ─── Overview Tab ──────────────────────────────────────────────────────────
const OverviewTab = ({ profile }) => {
  const [analytics, setAnalytics] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [advisoryError, setAdvisoryError] = useState("");

  useEffect(() => {
    detection.getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoadingAnalytics(false));
  }, []);

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setAdvisoryError("Geolocation not supported by your browser.");
      return;
    }
    setLoadingAdvisory(true);
    setAdvisoryError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Use first crop from profile, or Unknown
          const cropHint = Array.isArray(profile?.crops) && profile.crops.length > 0
            ? profile.crops[0]
            : profile?.crops || "Unknown";
          const data = await weather.getAdvisory(
            pos.coords.latitude,
            pos.coords.longitude,
            cropHint
          );
          setAdvisory(data);
        } catch (e) {
          setAdvisoryError(e.message || "Could not fetch advisory.");
        } finally {
          setLoadingAdvisory(false);
        }
      },
      (err) => {
        setAdvisoryError("Location permission denied.");
        setLoadingAdvisory(false);
      }
    );
  };

  // Analytics cards — matches API response exactly
  const statCards = analytics
    ? [
        { label: "Total Scans",        value: analytics.totalScans ?? 0 },
        { label: "Diseased Scans",     value: analytics.diseasedScans ?? 0 },
        { label: "Healthy Scans",      value: analytics.healthyScans ?? 0 },
        {
          label: "Avg Health Score",
          value: analytics.averageHealthScore != null
            ? `${analytics.averageHealthScore.toFixed(1)}%`
            : "N/A",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-1">
          Welcome back
          {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h2>
        <p className="text-muted-foreground">Here's a snapshot of your farm health.</p>
      </div>

      {/* ── Analytics cards ── */}
      {loadingAnalytics ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border p-5">
                <div className="font-heading text-3xl font-semibold text-primary mb-1">
                  {s.value}
                </div>
                <div className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Most common / crop */}
          {analytics && (
            <div className="grid md:grid-cols-2 gap-4">
              {analytics.mostCommonDisease && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                    Most Common Disease
                  </div>
                  <div className="font-heading text-xl text-foreground font-semibold">
                    {analytics.mostCommonDisease}
                  </div>
                </div>
              )}
              {analytics.mostScannedCrop && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                    Most Scanned Crop
                  </div>
                  <div className="font-heading text-xl text-foreground font-semibold">
                    {analytics.mostScannedCrop}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Health score trend */}
          {analytics?.healthScoreTrend?.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4 text-foreground">
                Health Score Trend
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (last {analytics.healthScoreTrend.length} scans)
                </span>
              </h3>
              <div className="flex items-end gap-1.5 h-20">
                {analytics.healthScoreTrend.map((score, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${score}%`,
                      backgroundColor:
                        score >= 70
                          ? "hsl(var(--primary))"
                          : score >= 40
                          ? "#f59e0b"
                          : "#ef4444",
                      minHeight: "4px",
                    }}
                    title={`Score: ${score}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Older</span>
                <span>Latest</span>
              </div>
            </div>
          )}

          {/* Disease & severity breakdowns */}
          <div className="grid md:grid-cols-2 gap-6">
            {analytics?.diseaseBreakdown && Object.keys(analytics.diseaseBreakdown).length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4 text-foreground">Disease Breakdown</h3>
                <div className="space-y-2.5">
                  {Object.entries(analytics.diseaseBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([disease, count]) => (
                      <div key={disease} className="flex items-center gap-3">
                        <div className="flex-1 text-sm text-foreground truncate">{disease}</div>
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (count / (analytics.totalScans || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground w-5 text-right">{count}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {analytics?.severityBreakdown && Object.keys(analytics.severityBreakdown).length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4 text-foreground">Severity Breakdown</h3>
                <div className="space-y-2.5">
                  {Object.entries(analytics.severityBreakdown).map(([sev, count]) => (
                    <div key={sev} className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadge(sev).replace(/^px.*/, "")}`}>
                        {sev}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (count / (analytics.totalScans || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Weather Advisory ── */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CloudSun className="h-5 w-5 text-primary" />
            Weather Advisory
          </h3>
          {!advisory && (
            <button
              onClick={fetchWeather}
              disabled={loadingAdvisory}
              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {loadingAdvisory ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CloudSun className="h-3 w-3" />
              )}
              Get My Advisory
            </button>
          )}
        </div>

        {advisoryError && (
          <p className="text-sm text-destructive mb-3">{advisoryError}</p>
        )}

        {advisory ? (
          <div className="space-y-4">
            {/* Current conditions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Temperature</div>
                  <div className="font-semibold text-foreground text-sm">
                    {advisory.temperatureCelsius != null ? `${advisory.temperatureCelsius}°C` : "—"}
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Humidity</div>
                  <div className="font-semibold text-foreground text-sm">
                    {advisory.humidity != null ? `${advisory.humidity}%` : "—"}
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <CloudSun className="h-4 w-4 text-cyan-500 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Precipitation</div>
                  <div className="font-semibold text-foreground text-sm">
                    {advisory.precipitationMm != null ? `${advisory.precipitationMm} mm` : "—"}
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                  <div className="font-semibold text-foreground text-sm">
                    {advisory.windSpeedKmh != null ? `${advisory.windSpeedKmh} km/h` : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Disease risk level */}
            {advisory.diseaseRiskLevel && (
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground font-medium">Disease Risk:</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRiskBadge(advisory.diseaseRiskLevel)}`}>
                  {advisory.diseaseRiskLevel}
                </span>
              </div>
            )}

            {/* Risk factors */}
            {advisory.riskFactors?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {advisory.riskFactors.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* Crop advisory */}
            {advisory.cropAdvisory && (
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-4">
                <div className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-2">
                  AI Crop Advisory
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {advisory.cropAdvisory}
                </p>
              </div>
            )}

            {/* 3-day Forecast */}
            {advisory.forecast?.length > 0 && (
              <div>
                <div className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  3-Day Forecast
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {advisory.forecast.map((day, i) => (
                    <div
                      key={i}
                      className="bg-muted/40 rounded-lg p-3 text-center"
                    >
                      <div className="text-xs text-muted-foreground mb-1.5">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {day.maxTempC}° / {day.minTempC}°
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        💧 {day.precipitationMm} mm
                      </div>
                      <div className="text-xs text-muted-foreground">
                        🌡 {day.humidityPercent}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setAdvisory(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Refresh advisory
            </button>
          </div>
        ) : !loadingAdvisory && (
          <p className="text-muted-foreground text-sm">
            Click "Get My Advisory" to fetch real-time weather and AI crop risk advisory
            for your current location.
          </p>
        )}
      </div>

      {/* Scan CTA */}
      <div className="flex gap-4">
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <ScanLine className="h-4 w-4" /> Scan a Crop
        </Link>
      </div>
    </div>
  );
};

// ─── Pest History Tab ──────────────────────────────────────────────────────
const PestHistoryTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const load = async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const res = await pest.getHistory(p, 10);
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this pest scan?")) return;
    setDeleting(id);
    try {
      await pest.deleteById(id);
      load(page);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      await pest.downloadReport(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Delete ALL pest scan history? This cannot be undone.")) return;
    try {
      await pest.clearHistory();
      load(0);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground py-12">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading pest scan history...
    </div>
  );

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const threatBadge = (level) => {
    const base = "px-2 py-0.5 rounded-full text-xs font-medium";
    if (!level) return `${base} bg-muted text-muted-foreground`;
    const l = level.toLowerCase();
    if (l === "high")        return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    if (l === "medium")      return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`;
    if (l === "beneficial")  return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    return `${base} bg-muted text-muted-foreground`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">Pest Scan History</h2>
          {totalElements > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{totalElements} total pest scan{totalElements !== 1 ? "s" : ""}</p>
          )}
        </div>
        {totalElements > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-destructive border border-destructive/30 px-3 py-1.5 rounded-full hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No pest scans yet. Use the Scan page and upload an insect photo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.commonName}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{item.commonName || item.scientificName || "Unknown"}</span>
                  {item.threatLevel && (
                    <span className={threatBadge(item.threatLevel)}>{item.threatLevel}</span>
                  )}
                  {item.isCropPest && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Crop Pest</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.scientificName && <span className="italic">{item.scientificName}</span>}
                  {item.cropType && <> · {item.cropType}</>}
                  {item.confidence != null && <> · {(item.confidence * 100).toFixed(0)}% confidence</>}
                </div>
                {item.taxonomyOrder && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {[item.taxonomyClass, item.taxonomyOrder, item.taxonomyFamily].filter(Boolean).join(" · ")}
                  </div>
                )}
                {item.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                )}
                {item.organicControl && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">🌿 {item.organicControl}</div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(item.id)}
                  disabled={downloading === item.id}
                  title="Download PDF Report"
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {downloading === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Download className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  title="Delete pest scan"
                  className="p-2 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors"
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => load(page - 1)}
            disabled={data?.first}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={data?.last}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── History Tab ───────────────────────────────────────────────────────────
const HistoryTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);
  // Search/filter state
  const [searchMode, setSearchMode] = useState(false);
  const [cropFilter, setCropFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const load = async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const res = await detection.getHistory(p, 10);
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this scan?")) return;
    setDeleting(id);
    try {
      await detection.deleteById(id);
      load(page);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      await detection.downloadReport(id);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("This will permanently delete ALL scan history. Continue?")) return;
    try {
      await detection.clearHistory();
      setSearchResults(null);
      setSearchMode(false);
      load(0);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError("");
    setSearchResults(null);
    try {
      const results = await detection.search({
        cropType: cropFilter || undefined,
        disease: diseaseFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
      });
      setSearchResults(results);
      setSearchMode(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setCropFilter("");
    setDiseaseFilter("");
    setFromFilter("");
    setToFilter("");
    setSearchResults(null);
    setSearchMode(false);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground py-12">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading scan history...
    </div>
  );

  // API response: { content, page, size, totalElements, totalPages, first, last }
  const items = searchMode ? (searchResults || []) : (data?.content || []);
  const totalPages = searchMode ? 1 : (data?.totalPages || 0);
  const totalElements = searchMode ? items.length : (data?.totalElements || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">Scan History</h2>
          {totalElements > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {searchMode ? `${totalElements} search result${totalElements !== 1 ? 's' : ''}` : `${totalElements} total scan${totalElements !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {(data?.totalElements ?? 0) > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-destructive border border-destructive/30 px-3 py-1.5 rounded-full hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {/* Search/Filter panel */}
      <div className="bg-card rounded-xl border border-border p-5">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Crop Type</label>
              <input
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                placeholder="e.g. Tomato"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Disease</label>
              <input
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value)}
                placeholder="e.g. Blight"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">From Date</label>
              <input
                type="date"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value ? e.target.value + "T00:00:00" : "")}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">To Date</label>
              <input
                type="date"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value ? e.target.value + "T23:59:59" : "")}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={searchLoading}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {searchLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Search
            </button>
            {searchMode && (
              <button
                type="button"
                onClick={clearSearch}
                className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
            {searchMode && (
              <span className="text-xs text-muted-foreground ml-1">Showing filtered results</span>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>
            No scans yet.{" "}
            <Link to="/scan" className="text-primary hover:underline">
              Scan your first crop
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.diseaseName}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {item.diseaseName || "Unknown"}
                  </span>
                  {item.severity && (
                    <span className={getSeverityBadge(item.severity)}>{item.severity}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.cropType}
                  {item.healthScore != null && (
                    <> · Health Score: <span className="text-primary font-medium">{item.healthScore}/100</span></>
                  )}
                  {item.confidence != null && (
                    <> · {(item.confidence * 100).toFixed(0)}% confidence</>
                  )}
                </div>
                {item.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                )}
                {item.treatment?.organicRemedy && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    🌿 {item.treatment.organicRemedy}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(item.id)}
                  disabled={downloading === item.id}
                  title="Download PDF Report"
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {downloading === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Download className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  title="Delete scan"
                  className="p-2 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors"
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination — API: { page, totalPages, first, last } */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => load(page - 1)}
            disabled={data?.first}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={data?.last}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Profile Tab ───────────────────────────────────────────────────────────
const ProfileTab = ({ profile, onUpdate }) => {
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    region: profile?.region || "",
    state: profile?.state || "",
    farmSize: profile?.farmSize?.toString() || "",
    crops: Array.isArray(profile?.crops) ? profile.crops.join(", ") : profile?.crops || "",
    language: profile?.language || "English",
  });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const updated = await user.updateProfile({
        name: form.name || undefined,
        phone: form.phone || undefined,
        region: form.region || undefined,
        state: form.state || undefined,
        farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined,
        crops: form.crops
          ? form.crops.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined,
        language: form.language || undefined,
      });
      onUpdate(updated);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    setError("");
    setSuccessMsg("");
    try {
      await user.changePassword(pwForm.oldPassword, pwForm.newPassword);
      setSuccessMsg("Password changed successfully!");
      setPwForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <h2 className="text-2xl font-heading font-semibold text-foreground">My Profile</h2>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* Account details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 text-foreground">Account Details</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Email — read-only */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Farm Size (acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.farmSize}
                onChange={(e) => setForm((f) => ({ ...f, farmSize: e.target.value }))}
                placeholder="5.5"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Region</label>
              <input
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                placeholder="Vidarbha"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                placeholder="Maharashtra"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Primary Crops{" "}
              <span className="text-muted-foreground font-normal">(comma separated)</span>
            </label>
            <input
              value={form.crops}
              onChange={(e) => setForm((f) => ({ ...f, crops: e.target.value }))}
              placeholder="Tomato, Wheat"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Language</label>
            <input
              value={form.language}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
              placeholder="Hindi"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Role</label>
              <div className="px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground text-sm">
                {profile?.role || "FARMER"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Member Since</label>
              <div className="px-4 py-3 rounded-lg border border-input bg-muted text-muted-foreground text-sm">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 text-foreground">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={pwForm.oldPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, oldPassword: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              New Password{" "}
              <span className="text-muted-foreground font-normal">(min 6 characters)</span>
            </label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={changingPw}
            className="border border-border px-6 py-2.5 rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {changingPw && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    user
      .getProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="bg-card rounded-2xl border border-border p-5 space-y-1">
              {/* Profile mini-card */}
              <div className="flex items-center gap-3 p-3 mb-3 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {profile?.name || "Farmer"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {profile?.email}
                  </div>
                  {profile?.role && (
                    <div className="text-xs text-primary font-medium mt-0.5">
                      {profile.role}
                    </div>
                  )}
                </div>
              </div>

              {tabs
                .filter(({ adminOnly }) => !adminOnly || profile?.role === "ADMIN")
                .map(({ id, label, icon: Icon, adminOnly }) => (
                <button
                  key={id}
                  onClick={() => id === "admin" ? navigate("/admin") : setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-primary text-primary-foreground"
                      : adminOnly
                      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}

              <Link
                to="/scan"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              >
                <ScanLine className="h-4 w-4" />
                Scan a Crop
              </Link>

              <div className="pt-3 border-t border-border mt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Main content */}
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <OverviewTab profile={profile} />}
            {activeTab === "history"  && <HistoryTab />}
            {activeTab === "pest"     && <PestHistoryTab />}
            {activeTab === "profile" && (
              <ProfileTab profile={profile} onUpdate={setProfile} />
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
