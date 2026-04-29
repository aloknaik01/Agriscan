# AgriScan — AI Crop Disease Detection

AgriScan is an AI-powered crop disease detection platform for farmers. Upload a photo of an affected leaf, get an instant diagnosis and treatment plan.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Spring Boot, PostgreSQL, Cloudinary, PlantNet API, Google Gemini AI, Open-Meteo

## Getting Started

```bash
cd client
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in `/client`:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## API Integrations

| API | Status | Endpoint |
|-----|--------|----------|
| Auth (Register/Login/Logout) | ✅ Integrated | `/api/v1/auth/*` |
| Crop Disease Scan | ✅ Integrated | `/api/v1/detection/analyze` |
| Scan History | ✅ Integrated | `/api/v1/detection/history` |
| PDF Report Download | ✅ Integrated | `/api/v1/detection/{id}/report` |
| Analytics Dashboard | ✅ Integrated | `/api/v1/detection/analytics` |
| Weather Advisory | ✅ Integrated | `/api/v1/weather/advisory` |
| User Profile (CRUD) | ✅ Integrated | `/api/v1/user/profile` |
| Change Password | ✅ Integrated | `/api/v1/user/password` |

© 2026 AgriScan
