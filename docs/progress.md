# Prospector AI — Progress Tracking

**Project Start:** March 10, 2026
**Goal:** Build a working prototype in one session

---

## Completed

- [x] Vision Document created
- [x] CLAUDE.md written (lean, desktop-first, no auth/database)
- [x] Project initialization (Next.js 15 + TypeScript + Tailwind v3)
- [x] Core infrastructure:
  - [x] `/app/page.tsx` — Main upload/table/export component
  - [x] `/app/api/process-leads/route.ts` — Claude API integration
  - [x] `/lib/csv.ts` — CSV parser with validation
  - [x] `/lib/ai.ts` — AI client wrapper
  - [x] `/lib/types.ts` — TypeScript interfaces
- [x] Build passes: `npm run build` ✓
- [x] Dev server runs: `npm run dev` ✓

---

## In Progress

- [ ] Testing with sample CSV
- [ ] Fine-tune Claude prompts for output quality

---

## Next Steps (Minimal & Lean)

1. **MVP Prototype**
   - [ ] Single `page.tsx` with upload form
   - [ ] CSV parser (detect required columns: firstName, email, jobTitle, company)
   - [ ] API endpoint `/api/process-leads` for Claude calls (sequential)
   - [ ] Table showing results with inline editing
   - [ ] Export button (Groove-compatible CSV)

2. **Testing & Deploy**
   - [ ] Test with sample Cognism CSV
   - [ ] Handle API errors gracefully
   - [ ] Build and deploy to Vercel

3. **After V1**
   - Batch/streaming for speed
   - Persistent storage
   - User accounts
   - Direct integrations

---

## Key Constraints

- **No persistence:** Leads live in React state, lost on page reload
- **Required CSV fields:** firstName, email, jobTitle, company (lastName optional)
- **Sequential processing:** One lead → API call → update → next
- **Max 200 leads per upload**
- **Desktop-first design** (optimize for laptop/desktop usage)

---

## Session Log

**March 10, 2026 — Session 1**
- Created Vision Document
- Updated CLAUDE.md (lean, desktop-first, no auth/no database)
- Fixed Tailwind CSS setup (downgraded to v3 for stability)
- Moved project to dedicated folder: `/c/Users/giuse/projects/prospector-ai/`
- Initialized complete Next.js project with all core features
- Build passes ✓ Dev server ready ✓
- Next: Test with sample CSV data and refine prompts
## Testing Checklist

- [ ] Upload sample Cognism CSV
- [ ] Verify Claude API integration
- [ ] Test inline editing
- [ ] Export CSV format
- [ ] Error handling
