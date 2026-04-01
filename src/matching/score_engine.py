#!/usr/bin/env python3
"""
Match-Score-Engine: Calculates relevance scores between company profiles and funding programs.
"""
import sys
sys.path.insert(0, '.')
from src.db.supabase_client import get_client

def calculate_match_score(program: dict, profile: dict) -> int:
    """Calculate a 0-100 match score between a funding program and a company profile."""
    score = 0
    
    # Category match (0-30 points)
    if profile.get('categories') and program.get('category'):
        if program['category'] in profile['categories']:
            score += 30
        elif any(cat.lower() in program['category'].lower() for cat in profile['categories']):
            score += 15
    
    # Country match (0-20 points)
    if profile.get('country') and program.get('country'):
        if profile['country'] == program['country']:
            score += 20
        elif program['country'].startswith('DE') and profile['country'] == 'DE':
            score += 15
        elif program['country'].startswith('DE-') and profile.get('region'):
            # Regional match
            region_map = {
                'Bayern': 'DE-BY', 'NRW': 'DE-NW', 'Baden-Württemberg': 'DE-BW',
                'Berlin': 'DE-BE', 'Hamburg': 'DE-HH', 'Hessen': 'DE-HE',
                'Niedersachsen': 'DE-NI', 'Sachsen': 'DE-SN', 'Thüringen': 'DE-TH',
            }
            expected = region_map.get(profile['region'])
            if expected and program['country'] == expected:
                score += 20
    
    # Keyword match (0-25 points)
    if profile.get('keywords'):
        text = (program.get('title', '') + ' ' + program.get('description', '')).lower()
        keyword_hits = sum(1 for kw in profile['keywords'] if kw.lower() in text)
        score += min(25, keyword_hits * 5)
    
    # Funding range match (0-15 points)
    if program.get('max_funding'):
        max_f = program['max_funding']
        if profile.get('min_funding') and profile.get('max_funding'):
            if profile['min_funding'] <= max_f <= profile['max_funding']:
                score += 15
            elif max_f >= profile['min_funding']:
                score += 10
        else:
            score += 8  # Unknown range, give some credit
    
    # Industry size match (0-10 points)
    if profile.get('size'):
        desc = program.get('description', '').lower()
        if profile['size'] in ['Klein', 'Mikro'] and ('kmu' in desc or 'klein' in desc or 'mittelstand' in desc):
            score += 10
        elif profile['size'] in ['Mittel', 'Groß']:
            score += 5
    
    return min(100, score)

def get_recommendation(score: int) -> str:
    if score >= 80:
        return 'Hoch'
    elif score >= 60:
        return 'Mittel'
    elif score >= 40:
        return 'Niedrig'
    else:
        return 'Gering'

if __name__ == '__main__':
    client = get_client()
    
    # Example profile for testing
    test_profile = {
        'company_name': 'TechStartup GmbH',
        'industry': 'IT',
        'size': 'Klein',
        'country': 'DE',
        'region': 'Bayern',
        'categories': ['Digitalisierung', 'Innovation'],
        'keywords': ['KI', 'Cloud', 'Software', 'Digitalisierung'],
        'min_funding': 10000,
        'max_funding': 500000,
    }
    
    # Get all programs
    result = client.table('funding_programs').select('*').execute()
    programs = result.data
    
    # Calculate scores
    scored = []
    for p in programs:
        score = calculate_match_score(p, test_profile)
        rec = get_recommendation(score)
        scored.append((score, rec, p['title'][:50], p['provider']))
    
    # Sort by score
    scored.sort(reverse=True)
    
    print(f'Match Scores for: {test_profile["company_name"]}')
    print(f'Profile: {test_profile["industry"]} | {test_profile["size"]} | {test_profile["categories"]}')
    print()
    for score, rec, title, provider in scored[:10]:
        print(f'{score:3d}% ({rec:6s}) | {provider:8s} | {title}')
    
    print(f'\nTotal programs scored: {len(scored)}')
    print(f'High match (≥80%): {sum(1 for s in scored if s[0] >= 80)}')
    print(f'Medium match (60-79%): {sum(1 for s in scored if 60 <= s[0] < 80)}')
