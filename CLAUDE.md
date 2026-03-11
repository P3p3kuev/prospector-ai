# Project: Prospector AI

> Transform Cognism lead lists into personalized outbound emails ready to send in minutes.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |

---

## Current Phase

**Day:** 1
**Phase:** Foundation Setup
**Status:** Creating project structure
**Next:** Build CSV upload + lead processing flow

Progress tracked in `docs/progress.md`

---

## Data Model

**Lead / Contact** (stored in React state during session — no persistence)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (UUID or row index) |
| firstName | string | Yes | Contact's first name |
| lastName | string | No | Contact's last name |
| email | string | Yes | Contact's email address |
| jobTitle | string | Yes | Contact's role at company |
| company | string | Yes | Prospect company name |
| website | string | No | Company website URL |
| industry | string | No | Industry classification |
| companyDescription | string | No | Brief description of company |
| companySize | string | No | Employee count ("50-100", etc) |
| techStack | string | No | Technologies used (from Cognism) |
| companyContext | string | Generated | AI: overview of company situation |
| painPoint | string | Generated | AI: hypothesis of business challenge |
| personalizationHook | string | Generated | AI: specific outreach angle |
| subjectLine | string | Generated | AI: email subject (editable) |
| emailBody | string | Generated | AI: email message (editable) |
| status | enum | System | "pending" \| "processing" \| "generated" \| "error" |
| error | string | System | Error message if status="error" |

---

## Features (Version 1)

- [ ] Upload a lead list (CSV from Cognism)
- [ ] Parse and validate CSV columns
- [ ] Analyze and enrich leads (AI generates context, pain points, hooks)
- [ ] Generate personalized emails (subject line + body via Claude API)
- [ ] Review and edit outputs (inline editing in table)
- [ ] Export ready-to-send CSV (Groove-compatible format)

**States to Handle:**
- [ ] Empty state (new user, no uploads)
- [ ] Upload in progress (file parsing)
- [ ] AI generation in progress (per-lead processing)
- [ ] Review screen (table with results)
- [ ] Error states (failed uploads, API errors, missing fields)
- [ ] Export confirmation

**Out of Scope (V1):**
- User accounts / authentication
- Persistent database
- CRM features
- Campaign management
- Analytics
- Direct email sending
- External integrations (Groove, Gmail, Instantly)
- Tech stack detection
- A/B testing
- Multi-step sequences

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Storage:** React state only (leads live in memory during session)
- **Auth:** None (single-user internal tool, no login)
- **Database:** None (V1 is session-based, no persistence)
- **AI:** Claude API (via Anthropic SDK)
- **Deployment:** Vercel

---

## Architecture

**Minimal File Structure (V1):**

```
app/
├── page.tsx                 # Main page (upload + table + export)
├── layout.tsx               # Root layout
└── api/
    └── process-leads/       # API endpoint for Claude API calls
        └── route.ts
lib/
├── csv.ts                   # CSV parsing
├── ai.ts                    # Claude API integration
└── types.ts                 # TypeScript types
```

**Data Flow:**

1. User uploads CSV → page parses file, validates required columns
2. Invalid rows → flagged, skipped
3. Valid leads → stored in React state
4. User clicks "Generate" → POST to `/api/process-leads` with one lead at a time
5. API calls Claude for enrichment + email generation
6. Response updates lead object in state, moves to next
7. User reviews and edits inline in table
8. User clicks "Export" → download CSV

**Processing:**

- Process leads sequentially (one at a time via API)
- No batching or streaming in V1
- Simple, reliable, easy to debug

**Key Patterns:**

- **Client Component:** Single component for upload, table, and export
- **API Route:** Handle Claude API calls (keep sensitive work server-side)
- **React State:** Store leads in memory (`useState`)
- **TypeScript:** Strict types for Lead and API responses

---

## Rules

### Before Writing Code
1. Read `CLAUDE.md` (this file) + `docs/progress.md`
2. Understand the Vision Document requirements
3. For changes >20 lines, explain plan first
4. Ask before installing new packages

### While Writing Code
4. One feature at a time — finish upload before starting generation
5. Follow the data model exactly (no extra fields)
6. Every user action needs: loading, success, error states
7. Desktop-first: optimize for desktop workflows (1024px+). Mobile only needs basic readability.
8. Handle missing/malformed CSV fields gracefully (skip bad rows, show summary)
9. Process leads sequentially — one lead → API call → update state → next lead

### After Writing Code
9. `npm run build` must pass
10. `npm run lint` must pass
11. Test in browser (desktop focus):
    - Upload CSV → generate → edit → export workflow
    - Check responsiveness (should work on all widths, optimize for desktop)
12. Test edge cases:
    - Empty CSV file
    - CSV missing required columns
    - CSV with 0 rows
    - CSV with 200 rows (max limit)
    - Claude API timeout/failure
    - Editing a field and re-exporting
13. Update `docs/progress.md`

---

## Constraints

- **Max leads per upload:** 200
- **Max file size:** 5 MB
- **Email body length:** 120 words max
- **Subject line length:** 60 characters max
- **Required CSV fields:** firstName, lastName, email, jobTitle, company
- **Missing required fields:** Skip row, flag in error summary
- **Processing timeout:** 30 seconds per lead (adjust if API slower)
- **Export format:** CSV compatible with Groove import

---

## API Keys & Environment

Create `.env.local` in project root:

```env
ANTHROPIC_API_KEY=your_key_here
```

(Never commit `.env.local` — add to `.gitignore`)

---

## Quality Checklist

Before any feature is "done":

- [ ] Feature works end-to-end (upload → generate → export)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Desktop workflow tested and smooth
- [ ] Loading states work (spinner, disabled buttons)
- [ ] Error states handled (shows user-friendly messages)
- [ ] Empty state works (clear instructions before first upload)
- [ ] CSV parsing handles edge cases (malformed, missing fields)
- [ ] Required fields only: firstName, email, jobTitle, company
- [ ] AI-generated content is under length limits (subject: 60 chars, body: 120 words)
- [ ] Export CSV is valid and opens in Excel/Google Sheets
- [ ] Sequential processing works (one lead at a time via API)

---

## Stop and Ask If

- Something in the Vision Document is unclear
- You want to install a new package (e.g., `react-hot-toast`)
- You've tried 3 times without success on one task
- A feature is more complex than the Vision Document suggests
- You need to add new fields to the data model
- The API response format differs from what's expected

---

## Example: Required CSV Columns (from Cognism)

The user exports a CSV from Cognism with these columns (may include more):

```
First Name, Last Name, Email, Job Title, Company Name, Website, Industry, Company Description, Company Size, Tech Stack
```

Your parser must:
1. Find these columns (case-insensitive)
2. Map them to the Lead model
3. Flag and skip rows missing **required** fields:
   - firstName (required)
   - email (required)
   - jobTitle (required)
   - company (required)
   - lastName (optional)
4. Pass valid rows to the AI generation pipeline

---

## Session Handoff

**Ending a session:**
1. Update `docs/progress.md` with what's complete and what's next
2. Commit progress: `git add . && git commit -m "Progress: [description]"`
3. Say: "Ready for handoff. [Brief summary]"

**Starting a new session:**
1. Read `CLAUDE.md` (this file)
2. Read `docs/progress.md`
3. Say: "Ready to continue. Last completed: [X]. Next up: [Y]?"

---

## Useful Commands

```bash
# Check TypeScript errors
npm run lint

# Build production
npm run build

# Run dev server
npm run dev

# Format code (if prettier installed)
npm run format
```

---

*This CLAUDE.md is tailored to Prospector AI. Update it as the project evolves.*
