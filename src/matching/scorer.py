"""Matching engine – scores funding programs against company profiles.

Match dimensions (weighted):
  - Industry/Sector match:   30%
  - Company size match:      20%
  - Region match:            15%
  - Technology/Focus match:  25%
  - Deadline proximity:      10%
"""

import logging
from datetime import date, timedelta
from typing import Optional

from src.models.funding import (
    CompanyProfile,
    CompanySize,
    FundingProgram,
    MatchResult,
)

logger = logging.getLogger(__name__)

# Industry matching: map company industries to relevant categories
INDUSTRY_CATEGORY_MAP = {
    "IT": ["Innovation", "Digitalisierung", "Forschung"],
    "Software": ["Innovation", "Digitalisierung"],
    "Handwerk": ["Innovation", "Digitalisierung", "Gründung"],
    "Produktion": ["Innovation", "Umwelt", "Energie", "Digitalisierung"],
    "Forschung": ["Forschung", "Innovation"],
    "Gesundheit": ["Forschung", "Innovation"],
    "Bau": ["Energie", "Umwelt", "Innovation"],
    "Landwirtschaft": ["Umwelt", "Energie", "Forschung"],
    "Handel": ["Digitalisierung", "Export", "Gründung"],
    "Dienstleistung": ["Digitalisierung", "Innovation", "Gründung"],
    "Logistik": ["Digitalisierung", "Innovation", "Umwelt"],
    "Energie": ["Energie", "Umwelt", "Innovation"],
    "Bildung": ["Bildung", "Forschung"],
}

# Size matching: which target groups match which company sizes
SIZE_TARGET_GROUP_MAP = {
    CompanySize.KLEIN: ["KMU", "Startup", "Kleinunternehmen", "Jungunternehmen"],
    CompanySize.KMU: ["KMU", "Mittelstand", "Startup", "Kleinunternehmen"],
    CompanySize.MITTELSTAND: ["KMU", "Mittelstand", "Großunternehmen"],
    CompanySize.GROSS: ["Großunternehmen", "Mittelstand"],
}

# Region matching: German Bundesländer
GERMAN_STATES = {
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen", "Deutschland",
}


def _score_industry(company: CompanyProfile, program: FundingProgram) -> float:
    """Score industry/sector match (0-100)."""
    # Direct industry match
    if company.industry.lower() in program.title.lower():
        return 100.0

    # Category match via industry map
    relevant_categories = INDUSTRY_CATEGORY_MAP.get(company.industry, [])
    if program.category.value in relevant_categories:
        return 80.0

    # Check description for industry keywords
    desc_lower = program.description.lower()
    if company.industry.lower() in desc_lower:
        return 60.0

    # Check focus areas
    for focus in company.focus_areas:
        if focus.lower() in desc_lower or focus.lower() in program.title.lower():
            return 70.0

    # General programs match everything partially
    if program.category.value == "Allgemein":
        return 30.0

    return 0.0


def _score_size(company: CompanyProfile, program: FundingProgram) -> float:
    """Score company size match (0-100)."""
    if not program.target_groups:
        return 50.0  # No restriction = neutral

    matching_groups = SIZE_TARGET_GROUP_MAP.get(company.size, [])

    for group in matching_groups:
        if group in program.target_groups:
            return 100.0

    # Partial match
    for tg in program.target_groups:
        if tg.lower() in ["alle", "allgemein", ""]:
            return 50.0

    return 0.0


def _score_region(company: CompanyProfile, program: FundingProgram) -> float:
    """Score region match (0-100)."""
    # EU programs: available to all German companies
    if program.country == "EU":
        return 90.0

    # Federal programs: available to all German companies
    if program.country == "DE" and program.provider.value in ("Bund", "KfW"):
        return 85.0

    # State programs: only for specific regions
    if program.country == "DE" and program.provider.value == "Land":
        if company.region in program.title or company.region in program.description:
            return 100.0
        # Check if program is for another state
        for state in GERMAN_STATES:
            if state in program.title and state != company.region:
                return 10.0
        return 40.0

    return 50.0


def _score_focus(company: CompanyProfile, program: FundingProgram) -> score:
    """Score technology/innovation focus match (0-100)."""
    if not company.focus_areas:
        return 50.0

    text = f"{program.title} {program.description}".lower()
    matches = 0
    for focus in company.focus_areas:
        if focus.lower() in text:
            matches += 1

    if matches == 0:
        return 20.0

    ratio = matches / len(company.focus_areas)
    return min(100.0, ratio * 100)


def _score_urgency(program: FundingProgram) -> float:
    """Score deadline proximity (0-100). Closer deadline = higher urgency."""
    if not program.deadline:
        return 30.0  # No deadline = not urgent

    days_until = (program.deadline - date.today()).days

    if days_until < 0:
        return 0.0  # Past deadline
    elif days_until <= 14:
        return 100.0  # Very urgent
    elif days_until <= 30:
        return 80.0
    elif days_until <= 60:
        return 60.0
    elif days_until <= 90:
        return 40.0
    else:
        return 20.0


def score_match(
    company: CompanyProfile,
    program: FundingProgram,
    weights: Optional[dict[str, float]] = None,
) -> MatchResult:
    """
    Score a company-program match.
    
    Returns a MatchResult with component scores and weighted total.
    """
    if weights is None:
        weights = {
            "industry": 0.30,
            "size": 0.20,
            "region": 0.15,
            "focus": 0.25,
            "urgency": 0.10,
        }

    industry_score = _score_industry(company, program)
    size_score = _score_size(company, program)
    region_score = _score_region(company, program)
    focus_score = _score_focus(company, program)
    urgency_score = _score_urgency(program)

    total_score = (
        industry_score * weights["industry"]
        + size_score * weights["size"]
        + region_score * weights["region"]
        + focus_score * weights["focus"]
        + urgency_score * weights["urgency"]
    )

    return MatchResult(
        program=program,
        company_id=company.id,
        total_score=round(total_score, 2),
        industry_score=round(industry_score, 2),
        size_score=round(size_score, 2),
        region_score=round(region_score, 2),
        focus_score=round(focus_score, 2),
        urgency_score=round(urgency_score, 2),
    )


def find_matches(
    company: CompanyProfile,
    programs: list[FundingProgram],
    min_score: float = 25.0,
    max_results: int = 20,
) -> list[MatchResult]:
    """
    Find and rank the best funding program matches for a company.
    
    Args:
        company: The company profile to match
        programs: Available funding programs
        min_score: Minimum score threshold (0-100)
        max_results: Maximum number of results
    
    Returns:
        List of MatchResult, sorted by score descending
    """
    matches = []

    for program in programs:
        if program.status.value == "closed":
            continue

        result = score_match(company, program)
        if result.total_score >= min_score:
            matches.append(result)

    # Sort by total score descending
    matches.sort(key=lambda m: m.total_score, reverse=True)

    logger.info(
        f"Found {len(matches)} matches for company '{company.name}' "
        f"(top score: {matches[0].total_score if matches else 'N/A'})"
    )

    return matches[:max_results]


# Fix the type hint
_score_focus.__annotations__["return"] = float


if __name__ == "__main__":
    from src.ingestion.eu_portal import get_hardcoded_eu_programs
    from src.ingestion.foerderdatenbank import get_hardcoded_foerderdatenbank_programs
    from src.ingestion.kfw_scraper import get_hardcoded_kfw_programs

    logging.basicConfig(level=logging.INFO)

    # Example company profile
    company = CompanyProfile(
        id="test_company_1",
        name="Muster GmbH",
        industry="IT",
        size=CompanySize.KMU,
        region="Bayern",
        focus_areas=["Innovation", "Digitalisierung", "KI"],
        employee_count=45,
        annual_revenue=5_000_000.0,
    )

    # All programs
    all_programs = (
        get_hardcoded_eu_programs()
        + get_hardcoded_foerderdatenbank_programs()
        + get_hardcoded_kfw_programs()
    )

    print(f"\n=== Matching for: {company.name} ===")
    print(f"Industry: {company.industry} | Size: {company.size.value} | Region: {company.region}")
    print(f"Focus: {company.focus_areas}")
    print(f"Total programs available: {len(all_programs)}\n")

    matches = find_matches(company, all_programs, min_score=20.0)

    for i, m in enumerate(matches, 1):
        print(f"{i}. [{m.total_score:.0f}%] {m.program.title}")
        print(f"   Industry: {m.industry_score:.0f}% | Size: {m.size_score:.0f}% | "
              f"Region: {m.region_score:.0f}% | Focus: {m.focus_score:.0f}% | "
              f"Urgency: {m.urgency_score:.0f}%")
        print(f"   Provider: {m.program.provider.value} | Category: {m.program.category.value}")
        if m.program.max_funding:
            print(f"   Max funding: €{m.program.max_funding:,.0f}")
        print()
