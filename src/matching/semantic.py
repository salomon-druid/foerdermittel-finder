"""Semantic matching enhancements for the Fördermittel-Finder.

Adds keyword expansion, synonym matching, and related-term scoring
to improve match quality beyond simple string containment.
"""

# Synonym groups: terms that should match each other
SYNONYM_GROUPS = [
    # Digital / IT
    ["digitalisierung", "digital", "it", "software", "cloud", "ki", "künstliche intelligenz",
     "artificial intelligence", "machine learning", "industrie 4.0", "iot", "smart"],
    # Innovation
    ["innovation", "innovativ", "forschung", "entwicklung", "f&e", "fuE",
     "prototype", "pilotprojekt", "neuentwicklung", "disruptiv"],
    # Energy / Climate
    ["energie", "klima", "erneuerbar", "solar", "photovoltaik", "wasserstoff",
     "energieeffizienz", "dekarbonisierung", "co2", "nachhaltigkeit", "grüne energie"],
    # Environment
    ["umwelt", "ökolog", "recycling", "kreislaufwirtschaft", "ressourceneffizienz",
     "biodiversität", "naturschutz", "emissionen"],
    # Startup / Founding
    ["gründung", "startup", "gründer", "jungunternehmen", "spin-off",
     "unternehmensnachfolge", "start-up", "existenzgründung"],
    # Export / International
    ["export", "internationalisierung", "international", "ausland",
     "markterschließung", "handel"],
    # SME
    ["kmu", "mittelstand", "kleinunternehmen", "familienunternehmen",
     "handwerk", "betrieb"],
    # Education
    ["bildung", "weiterbildung", "qualifizierung", "schulung", "kompetenz",
     "ausbildung", "fortbildung"],
    # Production / Manufacturing
    ["produktion", "fertigung", "manufacturing", "industrieproduktion",
     "verarbeitung", "werkstoff"],
    # Health
    ["gesundheit", "medizin", "pharma", "biotech", "medtech",
     "gesundheitswesen", "life science"],
    # Construction / Building
    ["bau", "gebäude", "immobilie", "sanierung", "modernisierung",
     "energetisch", "wohngebäude"],
]


def expand_keywords(keywords: list[str]) -> list[str]:
    """Expand a keyword list with synonyms for better matching."""
    expanded = set()
    keywords_lower = [k.lower().strip() for k in keywords]

    for kw in keywords_lower:
        expanded.add(kw)
        # Find synonym groups containing this keyword
        for group in SYNONYM_GROUPS:
            if kw in group:
                # Add all group members that aren't too dissimilar
                for syn in group:
                    expanded.add(syn)

    return list(expanded)


def compute_semantic_score(
    company_keywords: list[str],
    program_text: str,
) -> float:
    """Compute semantic similarity between company keywords and program text.

    Uses synonym expansion + weighted presence scoring.
    Returns 0-100.
    """
    if not company_keywords:
        return 50.0

    expanded = expand_keywords(company_keywords)
    text_lower = program_text.lower()

    # Count how many expanded keywords appear
    hits = 0
    direct_hits = 0
    for i, kw in enumerate(expanded):
        if kw in text_lower:
            hits += 1
            if i < len(company_keywords):
                direct_hits += 1

    if hits == 0:
        return 0.0

    # Weight: direct keyword matches are worth more than synonym matches
    direct_weight = direct_hits * 2.0
    synonym_weight = (hits - direct_hits) * 1.0
    total_weight = direct_weight + synonym_weight

    # Normalize: best case is all direct hits
    max_possible = len(company_keywords) * 2.0
    score = min(100.0, (total_weight / max(max_possible, 1)) * 100)

    return round(score, 2)


def compute_funding_amount_relevance(
    company_revenue: float | None,
    max_funding: float | None,
) -> float:
    """Score funding amount relevance to company size.

    Sweet spot: funding is 5-50% of annual revenue.
    Returns 0-100.
    """
    if not company_revenue or not max_funding:
        return 50.0  # Unknown = neutral

    if company_revenue <= 0:
        return 50.0

    ratio = max_funding / company_revenue

    # Optimal: funding is 5-50% of revenue
    if 0.05 <= ratio <= 0.5:
        return 100.0
    elif ratio < 0.05:
        # Too small — still useful but less impactful
        return 40.0 + (ratio / 0.05) * 60.0
    elif ratio > 0.5:
        # Very large relative to revenue — still high value
        # but may indicate different program type
        if ratio <= 2.0:
            return 80.0
        else:
            return 60.0

    return 50.0
