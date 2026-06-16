# Telemedicine Access for Rural Health Care

Healthcare dashboard & AI-assisted symptom checker built with Next.js 15, Turbopack, TailwindCSS, Genkit (Gemini), and Radix UI.

## Features

- Multi-section dashboard (patients, cases, consultations, prescriptions, etc.)
- AI Symptom Checker (text + image) using Genkit + Google Gemini
- Real-time translation & text-to-speech flows (experimental)
- Language context for dynamic UI localization
- Modern, component-driven UI (Shadcn-style primitives & Radix UI)

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended; project tested with Node 22)
- npm (bundled with Node) or pnpm/yarn if you prefer (scripts assume npm)

## 1. Install Dependencies

```powershell
npm install
```


## 2. Environment Variables

Copy the example env file and add your Google Generative AI key (Gemini / Google AI Studio):
 
```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set:
 
```bash
GOOGLE_GENAI_API_KEY=your_key_here
```


Without this key, Genkit flows will log a warning and AI actions will fail when invoked.

## 3. Run the Dev Server

```powershell
npm run dev
```

Open: <http://localhost:9002>

Root route redirects to `/dashboard`.

## 4. Using the AI Symptom Checker

Navigate to: `/symptom-checker`

You can:

1. Enter textual symptom descriptions
2. Upload an image (PNG/JPEG/WebP) + optional details

Results include triage category + advice. (Not medical advice; for demo only.)

## 5. Genkit Dev Workbench (Optional)

To explore flows interactively:
 
```powershell
npm run genkit:dev
```

This uses `src/ai/dev.ts` to register flows.

## 6. Production Build

```powershell
npm run build
npm start
```


## 7. Lint & Type Checking

```powershell
npm run lint
npm run typecheck
```


Type errors are ignored during build per `next.config.ts` but you should still keep the code clean.

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| AI calls failing | Ensure `GOOGLE_GENAI_API_KEY` set and restart dev server |
| Styles missing | Confirm Tailwind classes in `globals.css` and restart dev server |
| Image upload preview blank | Check browser console for FileReader errors |
| Port in use | Change `-p 9002` in `package.json` dev script |

## 9. Folder Overview

```text
src/app              Next.js App Router pages & layouts
src/components       UI primitives & feature components
src/ai               Genkit config + AI flows
src/lib/actions.ts   Server actions wrapping AI flows
src/context          React context (e.g., language)
```


## 10. Security Notes

- Do not expose your API key client-side.
- All AI flows are server-marked (`'use server'`).

## 11. Roadmap Ideas

- Persist user sessions & auth
- Store triage history in Firestore
- Add role-based dashboards
- Improve translation latency via streaming APIs

## 12. Demo Data Seeding (Dev Only)

An in-memory dataset can be populated for demos (patients, records, prescriptions, stock).

Endpoint: `POST /api/seed`

Payload options:

```json
{}
```

Seeds only if stores are empty.

```json
{ "reset": true }
```

Clears existing in-memory data then seeds.

Production Guard: Returns 403 when `NODE_ENV=production`.

Example (PowerShell):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:9002/api/seed -ContentType 'application/json' -Body '{}'
```

With reset:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:9002/api/seed -ContentType 'application/json' -Body '{"reset":true}'
```

Admin Dashboard: If logged in as `admin`, buttons (Seed / Reset & Seed) are available on `/dashboard` for quick population.

Returned JSON sample:

```json

## 13. Heuristic Risk Scoring (Phase 1)

A lightweight server heuristic estimates patient risk (low / moderate / high) using:

- Age (65+)
- Chronic condition flag (boolean placeholder)
- Follow-up gap (days since last record)
- Extracted critical symptoms in latest note (e.g. chest_pain, shortness_of_breath)
- Vitals (SpO2, systolic BP, temperature)

Implementation files:

- `src/lib/ml.ts` – `computeRisk()` and `extractSymptomsFromNote()`
- `src/app/api/ml/risk/route.ts` – POST endpoint
- `src/components/patient-risk-badge.tsx` – Client badge component
- Integrated in patient detail page (`patients/[id]/page.tsx`)

Example request:

```bash
curl -X POST http://localhost:9002/api/ml/risk \
  -H 'Content-Type: application/json' \
  -d '{"age":70,"symptoms":["chest_pain"],"hasChronic":true,"vitals":{"spo2":91}}'
```

Response (sample):

```json
{
  "ok": true,
  "risk": {
    "score": 90,
    "level": "high",
    "factors": ["age_65_plus","chronic_condition","symptom_chest_pain","low_spo2"],
    "model_version": "heuristic_v1",
    "disclaimer": "Decision support only – not a medical diagnosis."
  }
}
```

Upgrade Path:

1. Persist risk outputs alongside patients.
2. Collect doctor overrides (labeling set).
3. Train supervised model → export ONNX.
4. Replace heuristic with `onnxruntime-node` inference.
5. Add drift + performance monitoring.

Safety: Always show disclaimer; do not gate care purely by score.

---

Happy hacking!
