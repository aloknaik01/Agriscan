// AgriScan API Service — matches official API documentation exactly
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1";

// ─── Auth helpers ──────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("agriscan_token");
}

export function setToken(token) {
  localStorage.setItem("agriscan_token", token);
}

export function clearToken() {
  localStorage.removeItem("agriscan_token");
}

export function isAuthenticated() {
  return !!getToken();
}

// ─── Base fetch wrapper ────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for multipart — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // PDF download — return raw response
  if (options._raw) {
    if (!res.ok) throw new Error("Download failed");
    return res;
  }

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    // Validation errors come as data object
    const msg =
      json.message ||
      (json.data && typeof json.data === "object"
        ? Object.values(json.data).join(", ")
        : "API Error");
    throw new Error(msg);
  }

  return json;
}

// ─── Auth API ──────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// POST /api/v1/auth/login
// POST /api/v1/auth/logout
export const auth = {
  register: async ({ name, email, password, phone, region, state, farmSize, crops, language }) => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone, region, state, farmSize, crops, language }),
    });
    if (res.data?.token) setToken(res.data.token);
    return res.data; // { token, name, email, role, region, state, farmSize, crops, language }
  },

  login: async ({ email, password }) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) setToken(res.data.token);
    return res.data; // { token, name, email, role }
  },

  logout: async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      clearToken();
    }
  },
};

// ─── User / Profile API ────────────────────────────────────────────────────
// GET  /api/v1/user/profile
// PUT  /api/v1/user/profile
// PUT  /api/v1/user/password
export const user = {
  getProfile: async () => {
    const res = await apiFetch("/user/profile");
    return res.data;
    // { id, name, email, phone, region, state, farmSize, crops, language, role, createdAt }
  },

  updateProfile: async ({ name, phone, region, state, farmSize, crops, language }) => {
    const res = await apiFetch("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ name, phone, region, state, farmSize, crops, language }),
    });
    return res.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    await apiFetch("/user/password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

// ─── Detection / Scan API ──────────────────────────────────────────────────
// POST   /api/v1/detection/analyze         (multipart/form-data)
// GET    /api/v1/detection/history         ?page=0&size=10
// GET    /api/v1/detection/{id}
// GET    /api/v1/detection/{id}/report     (PDF download)
// GET    /api/v1/detection/search          ?cropType=&disease=&from=&to=
// GET    /api/v1/detection/analytics
// DELETE /api/v1/detection/{id}
// DELETE /api/v1/detection/history
export const detection = {
  analyze: async (imageFile, cropType = "Unknown") => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await apiFetch(
      `/detection/analyze?cropType=${encodeURIComponent(cropType)}`,
      { method: "POST", body: formData }
    );
    return res.data;
    /* {
         id, imageUrl, cropType, diseaseName, diseaseCategory, description,
         confidence, severity, healthScore, status, createdAt,
         treatment: { id, organicRemedy, chemicalPesticide, pesticideDosage,
                      preventiveMeasures, aiGenerated }
       } */
  },

  getHistory: async (page = 0, size = 10) => {
    const res = await apiFetch(`/detection/history?page=${page}&size=${size}`);
    return res.data;
    /* {
         content: [{ id, imageUrl, cropType, diseaseName, confidence, severity,
                     healthScore, createdAt, treatment: { organicRemedy, aiGenerated } }],
         page, size, totalElements, totalPages, first, last
       } */
  },

  getById: async (id) => {
    const res = await apiFetch(`/detection/${id}`);
    return res.data;
  },

  downloadReport: async (id) => {
    const res = await apiFetch(`/detection/${id}/report`, { _raw: true });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agriscan-report-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  },

  search: async ({ cropType, disease, from, to } = {}) => {
    const params = new URLSearchParams();
    if (cropType) params.set("cropType", cropType);
    if (disease) params.set("disease", disease);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await apiFetch(`/detection/search?${params}`);
    return res.data; // Array of detection summaries
  },

  getAnalytics: async () => {
    const res = await apiFetch("/detection/analytics");
    return res.data;
    /* {
         totalScans, healthyScans, diseasedScans, averageHealthScore,
         averageConfidence, mostCommonDisease, mostScannedCrop,
         diseaseBreakdown: { "Early Blight": 12, ... },
         cropBreakdown: { "Tomato": 20, ... },
         severityBreakdown: { "Severe": 10, "Moderate": 12, ... },
         healthScoreTrend: [45, 52, 38, ...]  // last 10 scans oldest→newest
       } */
  },

  deleteById: async (id) => {
    await apiFetch(`/detection/${id}`, { method: "DELETE" });
  },

  clearHistory: async () => {
    await apiFetch("/detection/history", { method: "DELETE" });
  },
};

// ─── Weather Advisory API ──────────────────────────────────────────────────
// GET /api/v1/weather/advisory?lat=&lon=&cropType=
export const weather = {
  getAdvisory: async (lat, lon, cropType = "Unknown") => {
    const res = await apiFetch(
      `/weather/advisory?lat=${lat}&lon=${lon}&cropType=${encodeURIComponent(cropType)}`
    );
    return res.data;
    /* {
         temperatureCelsius, humidity, precipitationMm, windSpeedKmh,
         weatherDescription,
         forecast: [{ date, maxTempC, minTempC, precipitationMm, humidityPercent }],
         cropAdvisory, diseaseRiskLevel, riskFactors: [...]
       } */
  },
};

// ─── Admin API (ROLE_ADMIN only) ───────────────────────────────────────────
// GET    /api/v1/admin/stats
// GET    /api/v1/admin/users
// GET    /api/v1/admin/users/{id}
// PUT    /api/v1/admin/users/{id}/role
// DELETE /api/v1/admin/users/{id}
export const admin = {
  getStats: async () => {
    const res = await apiFetch("/admin/stats");
    return res.data;
    /* {
         totalUsers, totalScans, severeScans, healthyScans, averageHealthScore,
         topDiseases: { "Early Blight": 145, ... },
         cropBreakdown: { "Tomato": 320, ... },
         userGrowth: { "2026-01": 12, ... }
       } */
  },

  getUsers: async () => {
    const res = await apiFetch("/admin/users");
    return res.data;
    /* Array of { id, name, email, role, state, createdAt,
                  totalScans, severeScans, averageHealthScore,
                  lastScanDisease, lastScanAt } */
  },

  getUserById: async (id) => {
    const res = await apiFetch(`/admin/users/${id}`);
    return res.data;
  },

  updateRole: async (id, role) => {
    const res = await apiFetch(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    return res.data; // { id, name, role }
  },

  deleteUser: async (id) => {
    await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
  },
};

// ─── Pest Scan API ─────────────────────────────────────────────────────────
// POST   /api/v1/pest/analyze          (multipart/form-data)
// GET    /api/v1/pest/history          ?page=0&size=10
// GET    /api/v1/pest/{id}
// GET    /api/v1/pest/{id}/report      (PDF download)
// DELETE /api/v1/pest/{id}
// DELETE /api/v1/pest/history
export const pest = {
  analyze: async (imageFile, cropType = "Unknown") => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await apiFetch(
      `/pest/analyze?cropType=${encodeURIComponent(cropType)}`,
      { method: "POST", body: formData }
    );
    return res.data;
    /* {
         id, imageUrl, cropType,
         scientificName, commonName, confidence,
         taxonomyOrder, taxonomyFamily, taxonomyClass,
         description, dangerTags, roleTags,
         isCropPest, threatLevel,
         organicControl, chemicalControl, preventiveMeasures, cropImpact,
         status, createdAt
       } */
  },

  getHistory: async (page = 0, size = 10) => {
    const res = await apiFetch(`/pest/history?page=${page}&size=${size}`);
    return res.data;
    /* { content: [...], page, size, totalElements, totalPages, first, last } */
  },

  getById: async (id) => {
    const res = await apiFetch(`/pest/${id}`);
    return res.data;
  },

  downloadReport: async (id) => {
    const res = await apiFetch(`/pest/${id}/report`, { _raw: true });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agriscan-pest-report-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  },

  deleteById: async (id) => {
    await apiFetch(`/pest/${id}`, { method: "DELETE" });
  },

  clearHistory: async () => {
    await apiFetch("/pest/history", { method: "DELETE" });
  },
};
