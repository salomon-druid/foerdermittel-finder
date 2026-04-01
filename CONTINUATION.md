# Fördermittel-Finder - Continuation Instructions

## What this project is:
A B2B SaaS that automatically monitors EU and German funding programs (Förderprogramme), matches them to company profiles, and alerts users about relevant opportunities.

## Goal: Make money.
- Pricing: 49€ Starter, 99€ Professional, 199€ Enterprise
- Target: German SMBs (Handwerk, IT, Produktion, Forschung)
- Value: "Nie wieder Fördergeld verpassen"

## Why it works:
- 150+ Mrd€ Förderung/Jahr in Deutschland
- KMUs verpassen Fördergeld weil sie nicht wissen was verfügbar ist
- Datenquellen sind öffentlich (EU-Portal, KfW, Bundesanzeiger)
- Fast kein KI-basierter Wettbewerb für KMUs

## Technical Stack:
- Backend: Python (same pattern as ted-monitor)
- Database: Supabase (same instance: unrclhgwtqbptcuqbhni)
- Frontend: Next.js (to be built)
- Data: EU Funding Portal API, KfW scraper, Bundesanzeiger

## Daily Workflow:
1. Check data is flowing
2. Pick ONE improvement task
3. Implement, build, commit, push
4. Log what you did

## Session Log

### 2026-04-01 15:27 — Matching Engine Improvements
**Task chosen:** #2 Improve matching algorithm

**What I did:**
1. Fixed Python scorer bug: `_score_focus` had invalid type hint (`score` → `float`)
2. Created `web/src/lib/matching.ts` — shared TypeScript matching engine
   - Mirrors Python scorer logic (industry, size, region, focus, urgency, semantic)
   - Added semantic keyword expansion with 11 synonym groups
   - Added funding amount relevance scoring
3. Created `/api/match` endpoint — POST company profile, get scored matches
4. Updated `programme/page.tsx` — real match scores instead of hardcoded values
5. Updated `dashboard/page.tsx` — real top-3 matches with score visualization
6. Color-coded score bars: green ≥70%, yellow ≥40%, gray <40%

**Impact:** Matching now actually works end-to-end. Users see real relevance scores based on a demo profile (IT-KMU, Bayern). Product is now defensible — not just a list of programs.

**Next priorities:**
- Company profile selector (let users pick industry/size/focus)
- SEO landing pages (foerdermittel-bayern, foerdermittel-digitalisierung, etc.)
- Email alerts for new matching programs
- More data sources (Bundesagentur für Arbeit, Investitionsbanken)
