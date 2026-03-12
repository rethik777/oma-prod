# Frontend — Detailed Technical Documentation

**Overview:**
- **Stack:** React + TypeScript (Vite), modern component structure under `src/`.
- **Primary purpose:** UI for surveys, authentication, dashboards and ancillary pages.

**Important files:**
- [OMA - frontend/src/config/api.ts](OMA%20-%20frontend/src/config/api.ts#L1-L200) — central API client configuration, error handling and retry parsing.
- [OMA - frontend/src/pages/Survey.tsx](OMA%20-%20frontend/src/pages/Survey.tsx#L1-L200) — survey page entry (where survey-related calls originate).
- [OMA - frontend/src/config](OMA%20-%20frontend/src/config#L1-L1) — other runtime config.

Architecture & Workflow
- The app is built with Vite (fast dev server). During development the `VITE_API_BASE_URL` env (from `.env.development`) is used and typically proxied to the backend.
- In production `VITE_API_BASE_URL` is set to full backend URL (see environment-specific `.env` files).
- All HTTP traffic uses the centralized `apiClient` in [OMA - frontend/src/config/api.ts](OMA%20-%20frontend/src/config/api.ts#L1-L200). The client:
  - Resolves `API_BASE_URL` from env.
  - Always sends credentials via `credentials: 'include'` so server-managed httpOnly cookies (JWT session) are used.
  - Provides a `parseError()` helper which extracts human-readable message and `Retry-After` metadata.

API Endpoints (frontend usage map)
- This section lists exactly which backend endpoints each page calls, with a short explanation of the UX behaviour it drives.
- Use it as a quick reference when you change a controller: you can see immediately which page and flow will be affected.

**Authentication & health (`/api/credential/...`)**
- `POST /api/credential/login` — used in [Login.tsx](OMA%20-%20frontend/src/pages/Login.tsx#L112-L147) when the user submits credentials.
  - Sends username/password and expects a JWT httpOnly cookie on success; drives the transition from login screen to dashboard.
- `GET /api/credential/check` — used on mount in [Login.tsx](OMA%20-%20frontend/src/pages/Login.tsx#L72-L87) and [Dashboard.tsx](OMA%20-%20frontend/src/pages/Dashboard.tsx#L69-L86).
  - Lightweight auth probe that redirects logged‑in users away from login, and kicks unauthenticated users out of the dashboard.
- `GET /api/credential/health` — used in [Login.tsx](OMA%20-%20frontend/src/pages/Login.tsx#L60-L70) and [Dashboard.tsx](OMA%20-%20frontend/src/pages/Dashboard.tsx#L52-L69).
  - Checks overall system/BERT health and toggles a maintenance experience when backend or model is degraded.
- `POST /api/credential/logout` — used in [Dashboard.tsx](OMA%20-%20frontend/src/pages/Dashboard.tsx#L107-L138) when the user clicks Logout.
  - Clears the JWT cookie on the server and then routes the user back to the login page.

**Survey structure & questions (`/api/category/...`)**
- `GET /api/category/allquestion` — used in [Survey.tsx](OMA%20-%20frontend/src/pages/Survey.tsx#L300-L338) when the survey page loads.
  - Fetches the complete nested survey (categories → questions → options) in one call, powering the entire question navigation UI.

**Survey session, autosave & submission (`/api/survey/...`)**
- `POST /api/survey/verify-session` — used in [InstructionPage.tsx](OMA%20-%20frontend/src/pages/InstructionPage.tsx#L112-L167) before starting the survey.
  - Sends a reCAPTCHA v3 token; only on success does the user move from instructions into the live survey.
- `GET /api/survey/session/{sessionId}/responses` — used in [Survey.tsx](OMA%20-%20frontend/src/pages/Survey.tsx#L317-L353) on initial survey load.
  - Restores in‑progress answers from the server and enforces the submitted flag so users cannot retake the survey by clearing local storage.
- `POST /api/survey/save-progress` — used by the autosave hook in [useAutoSave.ts](OMA%20-%20frontend/src/hooks/useAutoSave.ts#L105-L147).
  - Periodically sends the full `responses` map and consent flags so the backend always has an up‑to‑date draft copy of the survey.
- `POST /api/survey/submit` — used in [Survey.tsx](OMA%20-%20frontend/src/pages/Survey.tsx#L424-L470) when the user confirms submission.
  - Performs a final save, stamps the submission timestamp and then switches the UI to the thank‑you/confirmation screen.

**Dashboard analytics (`/api/survey/survey_score`)**
- `GET /api/survey/survey_score` — used in [Dashboard.tsx](OMA%20-%20frontend/src/pages/Dashboard.tsx#L70-L106) after health and auth checks.
  - Retrieves per‑category maturity scores which are transformed into radar‑chart data and the headline “Overall Maturity Score”.

How/where it is connected (runtime)
- `VITE_API_BASE_URL` controls the root. In dev, Vite proxies to backend (see `vite.config.ts`), allowing calls like `/api/surveys`.
- The `apiClient` builds URLs as `${API_BASE_URL}${endpoint}` so frontend code only needs to pass endpoint paths.
- Authentication relies on httpOnly cookies set by the backend — no token storage in localStorage.

Error handling & edge cases (frontend)
- Structured `ApiError` is thrown from `apiClient.parseError()` with fields: `status`, `message`, and `retryAfterSeconds` (parsed from `Retry-After` header or JSON). This lets UI components:
  - Show user-friendly messages.
  - Respect server backoff instructions (e.g., show retry countdown when `retryAfterSeconds` is set).
- Timeout support and AbortController: `fetch` calls include a default timeout (10s) and will abort.
- Content negotiation fallback: `parseError()` gracefully handles non-JSON bodies and missing fields.
- Credential handling: because credentials are included automatically, the app is resilient to token refresh patterns that rely on httpOnly cookies.

Resilience & best practices implemented
- Avoids storing JWT client-side (httpOnly cookies only).
- Centralized client enforces timeouts, content-type headers, and credentials.
- Retry guidance via `Retry-After` parsing (delta and HTTP-date supported).

Developer tips
- To add a new API call:
  1. Add a typed helper in `src/` that calls `apiClient.fetch(endpoint, { method, body })`.
  2. Keep UI components thin: parse and map server data in a service layer.
- To debug API interactions: set `VITE_API_BASE_URL` to an inspectable dev server or use browser devtools to inspect cookies and `Set-Cookie` headers.

Where to look next (backend tie-ins)
- Backend controllers and DTOs: `OMA V1/src/main/java/` — these files define the contract the frontend depends on.
- JWT & cookie behavior: backend config is in [OMA V1/target/classes/application.properties](OMA%20V1/target/classes/application.properties#L1-L200).

End-to-end frontend workflow (high level)
- Anonymous user path: Instruction page → reCAPTCHA verification → Survey loading `/api/category/allquestion` → autosave to `/api/survey/save-progress` → final submit to `/api/survey/submit`.
- Authenticated user path: Login → JWT cookie issuance → Dashboard health/auth checks → analytics fetch from `/api/survey/survey_score` → optional logout.

-----

This document is the canonical map for how React components talk to the backend; update it whenever you add or change an API call from the frontend.
