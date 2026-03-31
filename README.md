# Fördermittel-Finder MVP

> **"Nie wieder Fördergeld verpassen"**

A B2B SaaS that automatically monitors EU and German funding programs (Förderprogramme), matches them to company profiles, and alerts users about relevant opportunities.

## Data Sources

- **EU Funding & Tenders Portal** — Web scraping (API is WAF-protected)
- **Förderdatenbank.de** — BMWK's official funding database
- **KfW Förderdatenbank** — KfW banking group programs
- **Bundesanzeiger** — Official government gazette

## Pricing

| Plan       | Price/mo | Features                        |
|------------|----------|---------------------------------|
| Starter    | 49€      | 3 profiles, 10 matches/mo       |
| Professional | 99€     | Unlimited profiles, alerts      |
| Enterprise | 199€     | API access, white-label, SLA    |

## Quick Start

```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env  # edit with your keys

# Run ingestion
python -m src.ingestion.eu_portal
python -m src.ingestion.foerderdatenbank

# Test matching
python -m src.matching.scorer
```

## Architecture

```
foerdermittel-finder/
├── src/
│   ├── ingestion/          # Data scrapers
│   │   ├── eu_portal.py    # EU Funding Portal
│   │   ├── foerderdatenbank.py  # BMWK Förderdatenbank
│   │   ├── kfw_scraper.py  # KfW programs
│   │   └── bundesanzeiger.py
│   ├── matching/
│   │   └── scorer.py       # Match engine
│   ├── models/
│   │   └── funding.py      # Data models
│   └── db/
│       └── supabase_client.py  # DB layer
├── web/                    # Frontend (later)
└── requirements.txt
```

## Matching Engine

Matches funding programs to company profiles based on:
- Industry/Sector alignment
- Company size (KMU, Mittelstand, Großunternehmen)
- Geographic region
- Technology/Innovation focus
- Deadline proximity (urgency scoring)

## Status

MVP in development. Core ingestion and matching working.
