"""KfW Förderdatenbank scraper.

Scrapes KfW (Kreditanstalt für Wiederaufbau) funding programs.
URL: https://www.kfw.de/inlandsfoerderung/

KfW offers loans, grants and repayment bonuses for German businesses,
startups, and individuals. Programs are identified by their KfW product
numbers (e.g. 067, 294, 433).
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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
}


def _generate_id(title: str) -> str:
    raw = f"kfw|{title}".lower().strip()
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def scrape_kfw_page() -> list[FundingProgram]:
    """Scrape KfW Inlandsförderung page for program listings.

    Attempts to extract program cards/links from the main page.
    Falls back gracefully if WAF or bot detection blocks the request.
    """
    programs: list[FundingProgram] = []

    try:
        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=30) as client:
            resp = client.get(INLAND_URL)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")

        # Try to find structured program entries
        # KfW uses cards/tiles linking to individual program pages
        selectors = [
            "a[href*='/inlandsfoerderung/']",  # general inlandsförderung links
            "a[href*='/foerderprodukte/']",     # specific product links
            ".kf-product-card a",               # card-style products
            ".product-tile a",                   # tile-style products
            "a[data-product-number]",            # links with data attributes
        ]

        seen_titles: set[str] = set()
        for selector in selectors:
            for link in soup.select(selector):
                title = link.get_text(strip=True)
                href = link.get("href", "")

                if not title or len(title) < 5 or title in seen_titles:
                    continue

                # Skip navigation/utility links
                skip_words = [
                    "mehr erfahren", "zurück", "weiter", "home",
                    "alle anzeigen", "kontakt", "login", "anmelden",
                    "impressum", "datenschutz",
                ]
                if any(skip in title.lower() for skip in skip_words):
                    continue

                seen_titles.add(title)

                if href.startswith("/"):
                    url = f"{BASE_URL}{href}"
                elif href.startswith("http"):
                    url = href
                else:
                    url = f"{BASE_URL}/{href}"

                # Try to extract KfW number from title or URL
                kfw_num = re.search(r"\((\d{3})\)", title) or re.search(r"-(\d{3})[/.]", href)
                program_id = f"kfw_{kfw_num.group(1)}" if kfw_num else f"kfw_{_generate_id(title)}"

                # Try to extract max funding from surrounding text
                max_funding = _extract_amount(link)

                # Determine category from title/URL text
                category = _categorize(title + " " + href)

                program = FundingProgram(
                    id=program_id,
                    title=title,
                    description=f"KfW Förderprogramm: {title}",
                    provider=FundingProvider.KFW,
                    country="DE",
                    category=category,
                    max_funding=max_funding,
                    target_groups=_infer_target_groups(title),
                    url=url,
                    status=FundingStatus.ACTIVE,
                    source="kfw_live",
                )
                programs.append(program)

        logger.info(f"Scraped {len(programs)} programs from KfW live page")

    except httpx.HTTPStatusError as e:
        logger.warning(f"HTTP {e.response.status_code} scraping KfW (likely WAF-blocked): {e}")
    except httpx.HTTPError as e:
        logger.warning(f"HTTP error scraping KfW: {e}")
    except Exception as e:
        logger.warning(f"Error scraping KfW: {e}", exc_info=True)

    return programs


def _extract_amount(link_tag) -> Optional[float]:
    """Try to find a EUR amount near a link element."""
    # Check siblings and parent for amount text
    container = link_tag.parent
    if container:
        text = container.get_text()
        match = re.search(r"([\d.,]+)\s*(?:EUR|€|Euro)", text)
        if match:
            amount_str = match.group(1).replace(".", "").replace(",", ".")
            try:
                return float(amount_str)
            except ValueError:
                pass
    return None


def _categorize(text: str) -> FundingCategory:
    """Infer funding category from text."""
    text_lower = text.lower()
    mappings = [
        (["energie", "klima", "effizient", "erneuerbar", "solar", "wärme", "bauen"], FundingCategory.ENERGIE),
        (["digital", "it-sicherheit", "digitalisierung"], FundingCategory.DIGITALISIERUNG),
        (["gründ", "startgeld", "gruend"], FundingCategory.GRUENDUNG),
        (["innovat", "forschung", "entwicklung"], FundingCategory.INNOVATION),
        (["export", "ausland", "international"], FundingCategory.EXPORT),
        (["bildung", "weiterbildung"], FundingCategory.BILDUNG),
        (["umwelt", "ökolog", "recycling"], FundingCategory.UMWELT),
    ]
    for keywords, category in mappings:
        if any(kw in text_lower for kw in keywords):
            return category
    return FundingCategory.GENERAL


def _infer_target_groups(title: str) -> list[str]:
    """Infer target groups from program title."""
    title_lower = title.lower()
    groups = []
    if any(w in title_lower for w in ["gründ", "start"]):
        groups.extend(["Gründer", "Jungunternehmer"])
    if any(w in title_lower for w in ["unternehmer", "mittelstand", "kmu"]):
        groups.extend(["KMU", "Mittelstand"])
    if any(w in title_lower for w in ["wohngebäude", "wohnen", "privat", "sanier"]):
        groups.append("Privatpersonen")
    if any(w in title_lower for w in ["kommune", "gemeinde", "kommunal"]):
        groups.append("Kommunen")
    if not groups:
        groups = ["KMU", "Mittelstand"]
    return groups


# ---------------------------------------------------------------------------
# Hardcoded fallback programs (well-known KfW products with real program IDs)
# ---------------------------------------------------------------------------

def get_hardcoded_kfw_programs() -> list[FundingProgram]:
    """Return 10 well-known KfW funding programs as fallback data.

    These are based on publicly available KfW product information.
    Max funding amounts reflect typical program ceilings as of 2025.
    """
    return [
        # --- 1. ERP-Gründungskredit StartGeld (076) ---
        FundingProgram(
            id="kfw_076",
            title="ERP-Gründerkredit – StartGeld (076)",
            description=(
                "Günstiger Kredit für Gründungen, Nachfolgeregelungen und die "
                "Konsolidierung von jungen Unternehmen bis 5 Jahre nach Gründung. "
                "Bis zu 125.000 EUR für Investitionen und Betriebsmittel. "
                "Haftungsfreistellung bis zu 80% für die Hausbank."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.GRUENDUNG,
            max_funding=125_000.0,
            funding_rate=None,
            target_groups=["Gründer", "Jungunternehmer", "Nachfolger"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCndung-Nachfolge/ERP-Gr%C3%BCnderkredit-StartGeld-(076)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 2. ERP-Digitalisierungs- und Innovationskredit (294) ---
        FundingProgram(
            id="kfw_294",
            title="ERP-Digitalisierungs- und Innovationskredit (294)",
            description=(
                "Zinsgünstiger Kredit für Digitalisierung und Innovationen "
                "kleiner und mittlerer Unternehmen. Bis zu 25 Mio. EUR für "
                "Investitionen und Betriebsmittel. Für Digitalisierungsstrategien, "
                "IT-Sicherheit, Prozessdigitalisierung und Innovationsvorhaben."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.DIGITALISIERUNG,
            max_funding=25_000_000.0,
            funding_rate=None,
            requirements=["Unternehmen mit bis zu 500 Mitarbeitern", "Sitz oder Betriebsstätte in Deutschland"],
            target_groups=["KMU", "Mittelstand"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Digitalisierung-und-Informationssicherheit/ERP-Digitalisierungs-und-Innovationskredit-(294)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 3. KfW-Unternehmerkredit (073) ---
        FundingProgram(
            id="kfw_073",
            title="KfW-Unternehmerkredit – Universell (073)",
            description=(
                "Günstiger Kredit für Investitionen und Betriebsmittel "
                "kleiner und mittlerer Unternehmen. Bis zu 25 Mio. EUR "
                "für Wachstum, Innovation und Internationalisierung. "
                "Ab 3 Jahre nach Gründung."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.INNOVATION,
            max_funding=25_000_000.0,
            funding_rate=None,
            target_groups=["KMU", "Mittelstand", "Großunternehmen"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Erweitern-Festigen/ERP-Unternehmerkredit-Universell-(073)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 4. KfW-Klima-Invest ---
        FundingProgram(
            id="kfw_klima_invest",
            title="KfW-Klima-Invest",
            description=(
                "Investitionszuschuss für Klimaschutzprojekte in gewerblichen "
                "Unternehmen. Zuschuss von bis zu 20% der förderfähigen Kosten "
                "für Investitionen in Energieeffizienz, erneuerbare Energien "
                "und klimafreundliche Prozesse. Max. 5 Mio. EUR pro Projekt."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.ENERGIE,
            max_funding=5_000_000.0,
            funding_rate=20.0,
            target_groups=["KMU", "Mittelstand", "Gewerbe"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Energie-und-Umwelt/KfW-Klima-Invest/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 5. KfW-Energieeffizient Bauen (261) ---
        FundingProgram(
            id="kfw_261",
            title="KfW-Energieeffizient Bauen (261)",
            description=(
                "Günstiges Darlehen mit Tilgungszuschuss für den Neubau oder "
                "Ersterwerb von energieeffizienten Wohngebäuden (Effizienzhaus 40 "
                "bis Effizienzhaus 100). Tilgungszuschüsse von bis zu 25% der "
                "Kreditsumme, max. 150.000 EUR je Wohneinheit."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.ENERGIE,
            max_funding=150_000.0,
            funding_rate=25.0,
            target_groups=["Privatpersonen", "Bauträger"],
            url="https://www.kfw.de/inlandsfoerderung/Privatpersonen/Neubau/Energieeffizient-Bauen/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 6. ERP-Gründungskredit – Universell (067) ---
        FundingProgram(
            id="kfw_067",
            title="ERP-Gründungskredit – Universell (067)",
            description=(
                "Günstiger Kredit für größere Gründungs- und Erweiterungsvorhaben. "
                "Bis zu 25 Mio. EUR für Investitionen und Betriebsmittel. "
                "Für Unternehmen bis 5 Jahre nach Gründung oder Erwerb."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.GRUENDUNG,
            max_funding=25_000_000.0,
            funding_rate=None,
            target_groups=["Gründer", "Jungunternehmer", "KMU"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCndung-Nachfolge/ERP-Gr%C3%BCnderkredit-Universell-(067)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 7. KfW-Digital-Kredit (433) ---
        FundingProgram(
            id="kfw_433",
            title="KfW-Digital-Kredit (433)",
            description=(
                "Günstiger Kredit für Digitalisierungsvorhaben in KMU. "
                "Förderung von IT-Sicherheit, Digitalisierung von Geschäftsprozessen, "
                "Cloud-Migration und Aufbau digitaler Infrastruktur. "
                "Bis zu 10 Mio. EUR mit tilgungsfreien Anlaufjahren."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.DIGITALISIERUNG,
            max_funding=10_000_000.0,
            funding_rate=None,
            target_groups=["KMU", "Mittelstand"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Digitalisierung-und-Informationssicherheit/KfW-Digital-Kredit-(433)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 8. KfW-Energieeffizient Sanieren (262) ---
        FundingProgram(
            id="kfw_262",
            title="KfW-Energieeffizient Sanieren – Kredit (262)",
            description=(
                "Günstiger Kredit mit Tilgungszuschuss für die energetische "
                "Sanierung von Wohngebäuden zum Effizienzhaus. "
                "Tilgungszuschuss von bis zu 50% der Kreditsumme, "
                "max. 150.000 EUR je Wohneinheit beim Effizienzhaus 40."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.ENERGIE,
            max_funding=150_000.0,
            funding_rate=50.0,
            target_groups=["Privatpersonen", "Wohnungseigentümergemeinschaften"],
            url="https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilie/F%C3%B6rderprodukte/Energieeffizient-Sanieren-Kredit-(262)/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 9. KfW-Länderprogramm – ERP-Mezzanine für Innovation (166) ---
        FundingProgram(
            id="kfw_166",
            title="ERP-Mezzanine für Innovation (166)",
            description=(
                "Nachrangiges Darlehen für innovationsorientierte KMU. "
                "Bis zu 5 Mio. EUR für FuE-Projekte, Prototypenentwicklung "
                "und Markteinführung innovativer Produkte. Besonders attraktiv "
                "durch nachrangige Besicherung und niedrige Zinsen."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.FORSCHUNG,
            max_funding=5_000_000.0,
            funding_rate=None,
            requirements=["Innovatives Vorhaben", "Unternehmen mit bis zu 500 MA"],
            target_groups=["KMU", "Forschende Unternehmen"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Forschung-Innovation/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
        # --- 10. KfW-Kredit für Soziale Unternehmen ---
        FundingProgram(
            id="kfw_soziales",
            title="KfW-Kredit für Soziale Unternehmen",
            description=(
                "Günstiger Kredit für soziale und gemeinnützige Unternehmen. "
                "Bis zu 10 Mio. EUR für Investitionen und Betriebsmittel. "
                "Förderung von sozialer Innovation, Arbeitsmarktintegration "
                "und gemeinwohlorientierter Wirtschaft."
            ),
            provider=FundingProvider.KFW,
            country="DE",
            category=FundingCategory.SOZIALES,
            max_funding=10_000_000.0,
            funding_rate=None,
            target_groups=["Soziale Unternehmen", "Gemeinnützige Organisationen"],
            url="https://www.kfw.de/inlandsfoerderung/Unternehmen/Soziale-Unternehmen/",
            status=FundingStatus.ACTIVE,
            source="kfw_hardcoded",
        ),
    ]


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=== KfW Hardcoded Programs ===")
    for p in get_hardcoded_kfw_programs():
        max_str = f"€{p.max_funding:,.0f}" if p.max_funding else "N/A"
        rate_str = f" ({p.funding_rate:.0f}%)" if p.funding_rate else ""
        print(f"  [{p.category.value:15s}] {p.title}")
        print(f"    Max: {max_str}{rate_str} | Groups: {', '.join(p.target_groups)}")
        print()

    print("=== Attempting live scraping ===")
    live = scrape_kfw_page()
    print(f"  Found {len(live)} programs from live page")
    for p in live[:5]:
        print(f"    - {p.title}")
