"""Main ingestion runner – collects all funding programs and stores them."""

import logging
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.ingestion.eu_portal import get_hardcoded_eu_programs, scrape_search_page
from src.ingestion.foerderdatenbank import get_hardcoded_foerderdatenbank_programs, scrape_search_page as fdb_scrape
from src.ingestion.kfw_scraper import get_hardcoded_kfw_programs, scrape_kfw_page
from src.ingestion.bundesanzeiger import scrape_bundesanzeiger
from src.db.supabase_client import upsert_funding_programs

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


def run_ingestion(skip_live: bool = False):
    """
    Run full ingestion pipeline.
    
    Args:
        skip_live: If True, only use hardcoded data (for testing without network)
    """
    all_programs = []

    # 1. EU Portal programs (always include hardcoded)
    logger.info("=== Ingesting EU Portal programs ===")
    eu_programs = get_hardcoded_eu_programs()
    logger.info(f"  Hardcoded EU programs: {len(eu_programs)}")
    all_programs.extend(eu_programs)

    if not skip_live:
        try:
            live_eu = scrape_search_page("innovation", page=1, page_size=10)
            logger.info(f"  Live EU programs: {len(live_eu)}")
            all_programs.extend(live_eu)
        except Exception as e:
            logger.warning(f"  Live EU scraping failed: {e}")

    # 2. Förderdatenbank programs
    logger.info("=== Ingesting Förderdatenbank programs ===")
    fdb_programs = get_hardcoded_foerderdatenbank_programs()
    logger.info(f"  Hardcoded FDB programs: {len(fdb_programs)}")
    all_programs.extend(fdb_programs)

    if not skip_live:
        try:
            live_fdb = fdb_scrape("Innovation")
            logger.info(f"  Live FDB programs: {len(live_fdb)}")
            all_programs.extend(live_fdb)
        except Exception as e:
            logger.warning(f"  Live FDB scraping failed: {e}")

    # 3. KfW programs
    logger.info("=== Ingesting KfW programs ===")
    kfw_programs = get_hardcoded_kfw_programs()
    logger.info(f"  Hardcoded KfW programs: {len(kfw_programs)}")
    all_programs.extend(kfw_programs)

    if not skip_live:
        try:
            live_kfw = scrape_kfw_page()
            logger.info(f"  Live KfW programs: {len(live_kfw)}")
            all_programs.extend(live_kfw)
        except Exception as e:
            logger.warning(f"  Live KfW scraping failed: {e}")

    # 4. Bundesanzeiger
    if not skip_live:
        logger.info("=== Ingesting Bundesanzeiger ===")
        try:
            baz_programs = scrape_bundesanzeiger("Förderung")
            logger.info(f"  Bundesanzeiger programs: {len(baz_programs)}")
            all_programs.extend(baz_programs)
        except Exception as e:
            logger.warning(f"  Bundesanzeiger scraping failed: {e}")

    # Deduplicate by ID
    seen_ids = set()
    unique_programs = []
    for p in all_programs:
        if p.id not in seen_ids:
            seen_ids.add(p.id)
            unique_programs.append(p)

    logger.info(f"\n=== Total unique programs: {len(unique_programs)} ===")

    # Store in Supabase
    try:
        result = upsert_funding_programs(unique_programs)
        logger.info(f"Stored {len(result)} programs in Supabase")
    except Exception as e:
        logger.error(f"Failed to store in Supabase: {e}")
        logger.info("Programs collected but not stored. Check Supabase configuration.")

    return unique_programs


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run Fördermittel-Finder ingestion")
    parser.add_argument("--skip-live", action="store_true", help="Skip live scraping")
    args = parser.parse_args()

    programs = run_ingestion(skip_live=args.skip_live)
    print(f"\n✅ Ingestion complete: {len(programs)} programs")
