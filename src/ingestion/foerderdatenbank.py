"""Förderdatenbank.de (BMWK) scraper.

Scrapes the official German government funding database.
URL: https://www.foerderdatenbank.de

The site uses server-side rendering, so direct HTTP scraping works.
"""

import hashlib
import logging
import re
from datetime import date, datetime
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from src.models.funding import (
    FundingCategory,
    FundingProgram,
    FundingProvider,
    FundingStatus,
)

logger = logging.getLogger(__name__)

BASE_URL = "https://www.foerderdatenbank.de"
SEARCH_URL = f"{BASE_URL}/SiteGlobals/FDB/Forms/Suche/Startseitensuche_Formular.html"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}

SEARCH_KEYWORDS = [
    "Innovation",
    "Digitalisierung",
    "Energie",
    "Umwelt",
    "KMU",
    "Gründung",
    "Forschung",
    "Handwerk",
    "Produktion",
]


def _generate_id(title: str, url: str = "") -> str:
    """Generate a deterministic ID."""
    raw = f"fdb|{title}|{url}".lower().strip()
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _parse_amount(text: str) -> Optional[float]:
    """Parse German-formatted amounts like '1.000.000 EUR' or '50.000 Euro'."""
    text = text.replace(".", "").replace(",", ".")
    match = re.search(r"([\d.]+)\s*(?:EUR|Euro|€)", text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def _guess_category(text: str) -> FundingCategory:
    """Guess category from German text."""
    text_lower = text.lower()
    mapping = {
        FundingCategory.INNOVATION: ["innovation", "technologie", "tech"],
        FundingCategory.DIGITALISIERUNG: ["digital", "it", "software", "ki", "künstliche intelligenz"],
        FundingCategory.UMWELT: ["umwelt", "klima", "nachhaltig", "grün", "co2"],
        FundingCategory.ENERGIE: ["energie", "solar", "wind", "wasserstoff", "wärme"],
        FundingCategory.EXPORT: ["export", "international", "markt"],
        FundingCategory.GRUENDUNG: ["gründung", "startup", "neugründung", "jungunternehmen"],
        FundingCategory.FORSCHUNG: ["forschung", "entwicklung", "r&d", "wissenschaft"],
    }
    for category, keywords in mapping.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return FundingCategory.GENERAL


def scrape_search_page(keyword: str = "Innovation", page: int = 1) -> list[FundingProgram]:
    """
    Scrape search results from Förderdatenbank.de.
    """
    programs = []

    try:
        params = {
            "resourceId": "86eabea6-8d08-40e7-a272-b337e51c6613",
            "input_": "",
            "pageLocale": "de",
            "filterCategories": "FundingProgram",
            "templateQueryString": keyword,
        }
        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=30) as client:
            resp = client.get(SEARCH_URL, params=params)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")

        # Parse result cards
        cards = soup.select(".card--search, .result-item, .search-result, article")

        for card in cards:
            title_elem = card.select_one("h2 a, h3 a, .title a, a[class*='title']")
            desc_elem = card.select_one("p, .description, .teaser, .excerpt")

            if not title_elem:
                title_elem = card.select_one("h2, h3, .title")

            if not title_elem:
                continue

            title = title_elem.get_text(strip=True)
            description = desc_elem.get_text(strip=True) if desc_elem else ""

            # Extract URL
            url = ""
            if title_elem.name == "a":
                href = title_elem.get("href", "")
            else:
                link = card.select_one("a[href]")
                href = link.get("href", "") if link else ""

            if href:
                if href.startswith("/"):
                    url = f"{BASE_URL}{href}"
                elif href.startswith("http"):
                    url = href
                else:
                    url = f"{BASE_URL}/{href}"

            # Extract metadata
            max_funding = _parse_amount(f"{title} {description}")
            category = _guess_category(f"{title} {description}")

            # Check for target groups
            target_groups = []
            for tg in ["KMU", "Mittelstand", "Handwerk", "Startup", "Forschungseinrichtung"]:
                if tg.lower() in f"{title} {description}".lower():
                    target_groups.append(tg)

            program_id = _generate_id(title, url)
            status = FundingStatus.ACTIVE

            # Check for status indicators
            if "geschlossen" in f"{title} {description}".lower():
                status = FundingStatus.CLOSED
            elif "demnächst" in f"{title} {description}".lower():
                status = FundingStatus.UPCOMING

            program = FundingProgram(
                id=f"fdb_{program_id}",
                title=title,
                description=description[:500] if description else "",
                provider=FundingProvider.BUND,
                country="DE",
                category=category,
                max_funding=max_funding,
                target_groups=target_groups,
                url=url,
                status=status,
                source="foerderdatenbank",
            )
            programs.append(program)

        logger.info(f"Scraped {len(programs)} programs from Förderdatenbank for '{keyword}'")

    except httpx.HTTPError as e:
        logger.error(f"HTTP error scraping Förderdatenbank: {e}")
    except Exception as e:
        logger.error(f"Error scraping Förderdatenbank: {e}", exc_info=True)

    return programs


def fetch_foerderdatenbank_programs(keywords: list[str] | None = None) -> list[FundingProgram]:
    """Fetch programs from Förderdatenbank for multiple keywords."""
    if keywords is None:
        keywords = SEARCH_KEYWORDS

    all_programs = []
    seen_ids = set()

    for keyword in keywords:
        logger.info(f"Fetching Förderdatenbank programs for: {keyword}")
        programs = scrape_search_page(keyword=keyword)
        for p in programs:
            if p.id not in seen_ids:
                seen_ids.add(p.id)
                all_programs.append(p)

    return all_programs


def get_hardcoded_foerderdatenbank_programs() -> list[FundingProgram]:
    """
    Return well-known German federal funding programs as fallback.
    Based on actual programs from foerderdatenbank.de and BMWK.
    """
    return [
        FundingProgram(
            id="fdb_innovationsgutschein",
            title="Innovationsgutschein Bayern / NRW / etc.",
            description=(
                "Zuschuss für kleine und mittlere Unternehmen zur Finanzierung von "
                "Innovationsprojekten. Förderung von FuE-Dienstleistungen, "
                "Markteinführung innovativer Produkte und Prozessinnovationen."
            ),
            provider=FundingProvider.LAND,
            country="DE",
            category=FundingCategory.INNOVATION,
            max_funding=30_000.0,
            funding_rate=50.0,
            target_groups=["KMU", "Mittelstand"],
            url="https://www.foerderdatenbank.de/FDB/DE/Foerderprogramme/foerderprogramme.html",
            status=FundingStatus.ACTIVE,
            source="foerderdatenbank_hardcoded",
        ),
        FundingProgram(
            id="fdb_go_digit",
            title="Go-Digital – Förderung der Digitalisierung im Mittelstand",
            description=(
                "Das Förderprogramm „go-digital\" unterstützt kleine und mittlere "
                "Unternehmen bei der Digitalisierung ihrer Geschäftsprozesse. "
                "Gefördert werden Beratungs- und Umsetzungsleistungen in den "
                "Bereichen IT-Sicherheit, Digitalisierungsstrategie und E-Commerce."
            ),
            provider=FundingProvider.BUND,
            country="DE",
            category=FundingCategory.DIGITALISIERUNG,
            max_funding=16_500.0,
            funding_rate=50.0,
            target_groups=["KMU", "Mittelstand"],
            url="https://www.foerderdatenbank.de/FDB/DE/Foerderprogramme/foerderprogramme.html",
            status=FundingStatus.ACTIVE,
            source="foerderdatenbank_hardcoded",
        ),
        FundingProgram(
            id="fdb_pro_inno",
            title="Pro Inno – Innovationsberatung für KMU",
            description=(
                "Pro Inno fördert externe Innovationsberatung für kleine und "
                "mittlere Unternehmen. Gefördert werden Beratungen zu "
                "Innovationsstrategien, Technologiebewertung und Marktpotenzialanalyse."
            ),
            provider=FundingProvider.BUND,
            country="DE",
            category=FundingCategory.INNOVATION,
            max_funding=10_000.0,
            funding_rate=75.0,
            target_groups=["KMU"],
            url="https://www.foerderdatenbank.de/FDB/DE/Foerderprogramme/foerderprogramme.html",
            status=FundingStatus.ACTIVE,
            source="foerderdatenbank_hardcoded",
        ),
        FundingProgram(
            id="fdb_bafa_energieberatung",
            title="BAFA Energieberatung für Nichtwohngebäude",
            description=(
                "Förderung von Energieberatungen für Nichtwohngebäude, "
                "Anlagen und Prozesse. Ziel ist die Steigerung der Energieeffizienz "
                "und der Einsatz erneuerbarer Energien."
            ),
            provider=FundingProvider.BUND,
            country="DE",
            category=FundingCategory.ENERGIE,
            max_funding=8_000.0,
            funding_rate=80.0,
            target_groups=["KMU", "Mittelstand", "Großunternehmen"],
            url="https://www.bafa.de/DE/Energie/Energieberatung/Energieberatung_node.html",
            status=FundingStatus.ACTIVE,
            source="foerderdatenbank_hardcoded",
        ),
        FundingProgram(
            id="fdb_gruendungszuschuss",
            title="Gründungszuschuss der Bundesagentur für Arbeit",
            description=(
                "Der Gründungszuschuss unterstützt Arbeitslose, die sich "
                "selbstständig machen möchten. Er sichert den Lebensunterhalt "
                "und fördert die soziale Sicherung während der Gründungsphase."
            ),
            provider=FundingProvider.BUND,
            country="DE",
            category=FundingCategory.GRUENDUNG,
            max_funding=None,
            funding_rate=None,
            target_groups=["Gründer", "Arbeitslose"],
            url="https://www.arbeitsagentur.de/unternehmen/finanziell/gruendungszuschuss",
            status=FundingStatus.ACTIVE,
            source="foerderdatenbank_hardcoded",
        ),
        FundingProgram(
            id="fdb_zim",
            title="ZIM – Zentrales Innovationsprogramm Mittelstand",
            description=(
                "ZIM ist ein bundesweites, technologie- und branchenoffenes "
                "Förderprogramm für den Mittelstand. Es fördert innovative "
                "FuE-Projekte, Kooperationsprojekte und Netzwerke."
            ),
            provider=FundingProvider.BUND,
            country="DE",
            category=FundingCategory.INNOVATION,
            max_funding=550_000.0,
            funding_rate=55.0,
            target_groups=["KMU", "Mittelstand"],
            url="https://www.zim.de/",
            status=FundingStatus.ACTIVE,
            source="foerderdatenbank_hardcoded",
        ),
    ]


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=== Förderdatenbank Hardcoded Programs ===")
    programs = get_hardcoded_foerderdatenbank_programs()
    for p in programs:
        print(f"  [{p.category.value}] {p.title}")
        print(f"    Max funding: €{p.max_funding:,.0f}" if p.max_funding else "    Max funding: N/A")
        print(f"    URL: {p.url}")
        print()

    print(f"=== Attempting live scraping ===")
    live = scrape_search_page("Innovation")
    print(f"  Found {len(live)} live programs")
