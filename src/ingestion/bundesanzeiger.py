"""Bundesanzeiger scraper.

Scrapes funding announcements from the Bundesanzeiger.
URL: https://www.bundesanzeiger.de

Note: The Bundesanzeiger is primarily a legal gazette. Funding announcements
are published as official notices. This is a placeholder for future integration.
"""

import hashlib
import logging

import httpx
from bs4 import BeautifulSoup

from src.models.funding import (
    FundingProgram,
    FundingProvider,
    FundingStatus,
    FundingCategory,
)

logger = logging.getLogger(__name__)

BASE_URL = "https://www.bundesanzeiger.de"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9",
}


def scrape_bundesanzeiger(keyword: str = "Förderung") -> list[FundingProgram]:
    """
    Scrape Bundesanzeiger for funding-related announcements.
    
    Note: The Bundesanzeiger requires specific search patterns and may have
    access restrictions. This is a basic implementation.
    """
    programs = []

    try:
        search_url = f"{BASE_URL}/pub/de/amtliche_mitteilungen"
        params = {"searchText": keyword}

        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=30) as client:
            resp = client.get(search_url, params=params)
            if resp.status_code != 200:
                logger.warning(f"Bundesanzeiger returned {resp.status_code}")
                return programs

        soup = BeautifulSoup(resp.text, "lxml")

        # Parse results
        items = soup.select(".result-item, .search-result, article, .hit")
        for item in items:
            title_elem = item.select_one("h2, h3, .title, a")
            if not title_elem:
                continue

            title = title_elem.get_text(strip=True)
            href = ""
            if title_elem.name == "a":
                href = title_elem.get("href", "")
            else:
                link = item.select_one("a")
                if link:
                    href = link.get("href", "")

            url = f"{BASE_URL}{href}" if href.startswith("/") else href

            if not title or len(title) < 10:
                continue

            program_id = hashlib.sha256(f"baz|{title}".encode()).hexdigest()[:16]

            program = FundingProgram(
                id=f"baz_{program_id}",
                title=title,
                description="Förderbekanntmachung im Bundesanzeiger",
                provider=FundingProvider.BUND,
                country="DE",
                category=FundingCategory.GENERAL,
                url=url,
                status=FundingStatus.ACTIVE,
                source="bundesanzeiger",
            )
            programs.append(program)

        logger.info(f"Scraped {len(programs)} items from Bundesanzeiger")

    except httpx.HTTPError as e:
        logger.error(f"HTTP error scraping Bundesanzeiger: {e}")
    except Exception as e:
        logger.error(f"Error scraping Bundesanzeiger: {e}", exc_info=True)

    return programs


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    programs = scrape_bundesanzeiger("Förderung")
    print(f"Found {len(programs)} programs from Bundesanzeiger")
    for p in programs:
        print(f"  - {p.title}")
