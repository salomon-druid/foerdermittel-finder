"""KfW Förderdatenbank scraper.

Scrapes KfW (Kreditanstalt für Wiederaufbau) funding programs.
URL: https://www.kfw.de/inlandsfoerderung/

KfW offers loans and grants for German businesses.
"""

import hashlib
import logging
import re
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

BASE_URL = "https://www.kfw.de"
INLAND_URL = f"{BASE_URL}/inlandsfoerderung/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9",
}


def _generate_id(title: str) -> str:
    raw = f"kfw|{title}".lower().strip()
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def scrape_kfw_page() -> list[FundingProgram]:
    """Scrape KfW Inlandsförderung page for program listings."""
    programs = []

    try:
        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=30) as client:
            resp = client.get(INLAND_URL)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")

        # Find program links/cards
        links = soup.select("a[href*='/inlandsfoerderung/'], a[href*='foerderung']")

        seen_titles = set()
        for link in links:
            title = link.get_text(strip=True)
            href = link.get("href", "")

            if not title or len(title) < 5 or title in seen_titles:
                continue

            # Skip navigation links
            if any(skip in title.lower() for skip in ["mehr erfahren", "zurück", "weiter", "home"]):
                continue

            seen_titles.add(title)

            if href.startswith("/"):
                url = f"{BASE_URL}{href}"
            elif href.startswith("http"):
                url = href
            else:
                url = f"{BASE_URL}/{href}"

            program_id = _generate_id(title)

            program = FundingProgram(
                id=f"kfw_{program_id}",
                title=title,
                description=f"KfW Förderprogramm: {title}",
                provider=FundingProvider.KFW,
                country="DE",
                category=FundingCategory.GENERAL,
                target_groups=["KMU", "Mittelstand", "Gründer"],
                url=url,
                status=FundingStatus.ACTIVE,
                source="kfw",
            )
            programs.append(program)

        logger.info(f"Scraped {len(programs)} programs from KfW")

    except httpx.HTTPError as e:
        logger.error(f"HTTP error scraping KfW: {e}")
    except Exception as e:
        logger.error(f"Error scraping KfW: {e}", exc_info=True)

    return programs


def get_hardcoded_kfw_programs() -> list[FundingProgram]:
    """Return well-known KfW funding programs."""
    return [
        FundingProgram(
            id="kfw_kredit_290",
            title="KfW Kredit 290 – Energieeffizient Sanieren",
            description=(
                "Günstiger Kredit für die energetische Sanierung von Wohngebäuden "
                "und Nichtwohngebäuden. Förderung von Einzelmaßnahmen bis zum "
                "Effizienzhaus-Neubau."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.ENERGIE,
            max_funding=150_000.0,
            funding_rate=None,
            target_groups=["KMU", "Mittelstand", "Privatpersonen"],
            url="https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilie/F%C3%B6rderprodukte/Energieeffizient-Sanieren-Kredit-(290)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        FundingProgram(
            id="kfw_innovationskredit",
            title="ERP-Gründerkredit – StartGeld",
            description=(
                "Günstiger Kredit für Gründungen, Nachfolgeregelungen und die "
                "Konsolidierung von jungen Unternehmen. Bis zu 125.000 EUR "
                "für Investitionen und Betriebsmittel."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.GRUENDUNG,
            max_funding=125_000.0,
            funding_rate=None,
            target_groups=["Gründer", "Jungunternehmer", "KMU"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCndung-Nachfolge/ERP-Gr%C3%BCnderkredit-StartGeld-(076)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        FundingProgram(
            id="kfw_kredit_379",
            title="KfW Kredit 379 – Energieeffizient Bauen",
            description=(
                "Günstiges Darlehen für den Neubau oder Ersterwerb von "
                "energieeffizienten Wohngebäuden. Tilgungszuschüsse von "
                "bis zu 27.500 EUR pro Wohneinheit."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.ENERGIE,
            max_funding=150_000.0,
            funding_rate=None,
            target_groups=["Privatpersonen", "Bauträger"],
            url="https://www.kfw.de/inlandsfoerderung/Privatpersonen/Neubau/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        FundingProgram(
            id="kfw_unternehmerkredit",
            title="ERP-Unternehmerkredit – Universell",
            description=(
                "Günstiger Kredit für Investitionen und Betriebsmittel "
                "kleiner und mittlerer Unternehmen. Bis zu 25 Mio EUR "
                "für Wachstum, Innovation und Internationalisierung."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.INNOVATION,
            max_funding=25_000_000.0,
            funding_rate=None,
            target_groups=["KMU", "Mittelstand"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Erweitern-Festigen/ERP-Unternehmerkredit-Universell-(073)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        FundingProgram(
            id="kfw_digital_kredit",
            title="KfW Digital-Kredit 433",
            description=(
                "Günstiger Kredit für Digitalisierungsvorhaben in KMU. "
                "Förderung von IT-Sicherheit, Digitalisierung von Geschäftsprozessen "
                "und Aufbau digitaler Infrastruktur."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.DIGITALISIERUNG,
            max_funding=10_000_000.0,
            funding_rate=None,
            target_groups=["KMU", "Mittelstand"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Digitalisierung-und-Informationssicherheit/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
    ]


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=== KfW Hardcoded Programs ===")
    for p in get_hardcoded_kfw_programs():
        print(f"  [{p.category.value}] {p.title}")
        print(f"    Max: €{p.max_funding:,.0f}" if p.max_funding else "    Max: N/A")
        print()

    print("=== Attempting live scraping ===")
    live = scrape_kfw_page()
    print(f"  Found {len(live)} programs")
