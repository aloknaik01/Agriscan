import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, AlertTriangle, Users, BarChart3, ShieldAlert,
  Leaf, Trash2, ChevronDown, CheckCircle, Crown, UserCheck,
  TrendingUp, Activity, RefreshCw,
} from "lucide-react";
import { admin, isAuthenticated, user as userApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ── helpers ────────────────────────────────────────────────────────────────
const roleBadge = (role) => {
  const base = "px-2 py-0.5 rounded-full text-xs font-semibold";
  if (role === "ADMIN")      return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
  if (role === "AGRONOMIST") return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`;
  return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
};

const fmt = (n) => (n ?? 0).toLocaleString();
const pct = (n) => (n != null ? `${Number(n).toFixed(1)}%` : "—");

// ── StatsCard ─────────────────────────────────────────────────────────────
const StatsCard = ({ label, value, icon: Icon, sub }) => (
  <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <div className="font-heading text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  </div>
);

// ── BarList ────────────────────────────────────────────────────────────────
const BarList = ({ data, total }) =>
  Object.entries(data || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => (
      <div key={k} className="flex items-center gap-3">
        <div className="flex-1 text-sm text-foreground truncate">{k}</div>
        <div className="w-28 bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${Math.min(100, ((v / (total || 1)) * 100))}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground w-6 text-right">{v}</div>
      </div>
    ));

// ── RoleDropdown ───────────────────────────────────────────────────────────
const ROLES = ["FARMER", "AGRONOMIST", "ADMIN"];

const RoleDropdown = ({ userId, current, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const choose = async (role) => {
    if (role === current) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const res = await admin.updateRole(userId, role);
      onUpdated(res);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            <span className={roleBadge(current)}>{current}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 z-20 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden min-w-[130px]"
          >
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => choose(r)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
              >
                {r === current && <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />}
                {r !== current && <div className="w-3.5" />}
                {r}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── UserDetailModal ────────────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.getUserById(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl shadow-2xl p-7 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {data.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="font-semibold text-foreground text-lg">{data.name}</div>
                <div className="text-sm text-muted-foreground">{data.email}</div>
                <span className={`${roleBadge(data.role)} mt-1 inline-block`}>{data.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Phone", data.phone || "—"],
                ["State", data.state || "—"],
                ["Region", data.region || "—"],
                ["Farm Size", data.farmSize ? `${data.farmSize} acres` : "—"],
                ["Total Scans", fmt(data.totalScans)],
                ["Severe Scans", fmt(data.severeScans)],
                ["Avg Health", pct(data.averageHealthScore)],
                ["Last Disease", data.lastScanDisease || "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{k}</div>
                  <div className="font-medium text-foreground truncate">{v}</div>
                </div>
              ))}
            </div>
            {data.crops?.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Crops</div>
                <div className="flex flex-wrap gap-1.5">
                  {data.crops.map((c) => (
                    <span key={c} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Joined: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—"}
              {data.lastScanAt && ` · Last scan: ${new Date(data.lastScanAt).toLocaleDateString()}`}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">User not found.</p>
        )}
        <button
          onClick={onClose}
          className="mt-5 w-full border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

// ── AdminPage ──────────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("stats");

  // Auth guard — also check ADMIN role
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    // Attempt to fetch profile to verify role
    userApi.getProfile().then((p) => {
      if (p.role !== "ADMIN") {
        navigate("/dashboard");
      }
    }).catch(() => navigate("/login"));
  }, []);

  const fetchStats = () => {
    setLoadingStats(true);
    setStatsError("");
    admin.getStats()
      .then(setStats)
      .catch((e) => setStatsError(e.message))
      .finally(() => setLoadingStats(false));
  };

  const fetchUsers = () => {
    setLoadingUsers(true);
    setUsersError("");
    admin.getUsers()
      .then(setUsers)
      .catch((e) => setUsersError(e.message))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { fetchStats(); fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete user "${name}" and all their data? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await admin.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      fetchStats(); // refresh stats after deletion
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleUpdated = ({ id, role }) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.state?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Platform management — AgriScan backend stats &amp; user administration.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {[
            { id: "stats", label: "Platform Stats", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Stats Tab ── */}
        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {statsError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <div className="font-semibold">Failed to load stats</div>
                  <div className="text-sm">{statsError}</div>
                </div>
                <button onClick={fetchStats} className="ml-auto shrink-0 flex items-center gap-1.5 text-sm hover:opacity-80">
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            )}

            {loadingStats ? (
              <div className="flex items-center gap-3 text-muted-foreground py-12">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading platform stats...
              </div>
            ) : stats ? (
              <>
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatsCard label="Total Users"       value={fmt(stats.totalUsers)}       icon={Users} />
                  <StatsCard label="Total Scans"       value={fmt(stats.totalScans)}       icon={Activity} />
                  <StatsCard label="Severe Scans"      value={fmt(stats.severeScans)}      icon={ShieldAlert} />
                  <StatsCard label="Healthy Scans"     value={fmt(stats.healthyScans)}     icon={Leaf} />
                  <StatsCard label="Avg Health Score"  value={pct(stats.averageHealthScore)} icon={TrendingUp} />
                </div>

                {/* Breakdowns */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Top Diseases */}
                  {stats.topDiseases && Object.keys(stats.topDiseases).length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Top Diseases
                      </h3>
                      <div className="space-y-2.5">
                        <BarList data={stats.topDiseases} total={stats.totalScans} />
                      </div>
                    </div>
                  )}

                  {/* Crop Breakdown */}
                  {stats.cropBreakdown && Object.keys(stats.cropBreakdown).length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        Crop Breakdown
                      </h3>
                      <div className="space-y-2.5">
                        <BarList data={stats.cropBreakdown} total={stats.totalScans} />
                      </div>
                    </div>
                  )}

                  {/* User Growth */}
                  {stats.userGrowth && Object.keys(stats.userGrowth).length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        User Growth
                      </h3>
                      <div className="space-y-2.5">
                        {Object.entries(stats.userGrowth)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([month, count]) => {
                            const max = Math.max(...Object.values(stats.userGrowth));
                            return (
                              <div key={month} className="flex items-center gap-3">
                                <div className="text-sm text-foreground w-16 shrink-0">{month}</div>
                                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{ width: `${(count / (max || 1)) * 100}%` }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground w-6 text-right">{count}</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </motion.div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Registered Users</h2>
                {users.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">{users.length} users total</p>
                )}
              </div>
              <div className="relative w-full sm:w-72">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, role…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {usersError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <div className="font-semibold">Failed to load users</div>
                  <div className="text-sm">{usersError}</div>
                </div>
                <button onClick={fetchUsers} className="ml-auto shrink-0 flex items-center gap-1.5 text-sm hover:opacity-80">
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            )}

            {loadingUsers ? (
              <div className="flex items-center gap-3 text-muted-foreground py-12">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{search ? "No users match your search." : "No users registered yet."}</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/50 border-b border-border text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                  <div>User</div>
                  <div>Location</div>
                  <div>Scans</div>
                  <div>Health</div>
                  <div>Role</div>
                  <div>Actions</div>
                </div>

                {/* Rows */}
                {filteredUsers.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* User info */}
                    <div>
                      <button
                        onClick={() => setDetailId(u.id)}
                        className="text-left group"
                      >
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {u.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </button>
                    </div>

                    {/* Location */}
                    <div className="text-sm text-muted-foreground">
                      {u.state || "—"}
                    </div>

                    {/* Scans */}
                    <div>
                      <div className="text-sm font-medium text-foreground">{fmt(u.totalScans)}</div>
                      {u.severeScans > 0 && (
                        <div className="text-xs text-red-500">{u.severeScans} severe</div>
                      )}
                    </div>

                    {/* Avg health */}
                    <div>
                      <div className={`text-sm font-medium ${
                        u.averageHealthScore >= 70 ? "text-green-600 dark:text-green-400"
                        : u.averageHealthScore >= 40 ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                      }`}>
                        {pct(u.averageHealthScore)}
                      </div>
                      {u.lastScanDisease && (
                        <div className="text-xs text-muted-foreground truncate max-w-[90px]">
                          {u.lastScanDisease}
                        </div>
                      )}
                    </div>

                    {/* Role dropdown */}
                    <div>
                      <RoleDropdown
                        userId={u.id}
                        current={u.role}
                        onUpdated={handleRoleUpdated}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailId(u.id)}
                        title="View details"
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deletingId === u.id}
                        title="Delete user"
                        className="p-2 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors"
                      >
                        {deletingId === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* User detail modal */}
      <AnimatePresence>
        {detailId && (
          <UserDetailModal userId={detailId} onClose={() => setDetailId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
