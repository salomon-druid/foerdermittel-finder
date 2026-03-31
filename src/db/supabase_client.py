"""Supabase client for Fördermittel-Finder."""

import os
import logging
from typing import Optional

from supabase import create_client, Client
from dotenv import load_dotenv

from src.models.funding import FundingProgram, MatchResult

load_dotenv()
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client: Optional[Client] = None


def get_client() -> Client:
    """Get or create a Supabase client."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def create_funding_programs_table():
    """
    Create the funding_programs table.
    Run this once to initialize the schema.

    NOTE: Supabase doesn't support DDL via the Python client directly.
    Use the Supabase dashboard SQL editor to run this:

    CREATE TABLE IF NOT EXISTS funding_programs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        provider TEXT DEFAULT 'Sonstige',
        country TEXT DEFAULT 'DE',
        category TEXT DEFAULT 'Allgemein',
        max_funding DOUBLE PRECISION,
        funding_rate DOUBLE PRECISION,
        deadline DATE,
        start_date DATE,
        requirements JSONB DEFAULT '[]',
        target_groups JSONB DEFAULT '[]',
        url TEXT DEFAULT '',
        status TEXT DEFAULT 'unknown',
        source TEXT DEFAULT '',
        raw_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_funding_programs_status ON funding_programs(status);
    CREATE INDEX IF NOT EXISTS idx_funding_programs_provider ON funding_programs(provider);
    CREATE INDEX IF NOT EXISTS idx_funding_programs_category ON funding_programs(category);
    CREATE INDEX IF NOT EXISTS idx_funding_programs_deadline ON funding_programs(deadline);
    """
    logger.info("Table creation SQL logged. Run in Supabase dashboard.")


def _prepare_for_supabase(program: FundingProgram) -> dict:
    """Convert a FundingProgram to a Supabase-safe dict."""
    data = program.model_dump(mode="json")
    # Drop fields that don't exist in the table schema
    data.pop("raw_data", None)
    # Convert date/datetime objects to strings
    for field in ("deadline", "start_date", "created_at", "updated_at"):
        if data.get(field):
            data[field] = str(data[field]) if not isinstance(data[field], str) else data[field]
    return data


def upsert_funding_program(program: FundingProgram) -> dict:
    """Insert or update a funding program in Supabase."""
    client = get_client()
    data = _prepare_for_supabase(program)
    result = client.table("funding_programs").upsert(data).execute()
    return result.data


def upsert_funding_programs(programs: list[FundingProgram]) -> list[dict]:
    """Batch upsert funding programs."""
    if not programs:
        return []
    client = get_client()
    data = [_prepare_for_supabase(p) for p in programs]
    result = client.table("funding_programs").upsert(data).execute()
    logger.info(f"Upserted {len(result.data)} funding programs")
    return result.data


def get_active_programs(limit: int = 100) -> list[dict]:
    """Get all active funding programs."""
    client = get_client()
    result = (
        client.table("funding_programs")
        .select("*")
        .eq("status", "active")
        .order("deadline", desc=False)
        .limit(limit)
        .execute()
    )
    return result.data


def search_programs(query: str, limit: int = 20) -> list[dict]:
    """Search funding programs by title or description."""
    client = get_client()
    result = (
        client.table("funding_programs")
        .select("*")
        .ilike("title", f"%{query}%")
        .limit(limit)
        .execute()
    )
    return result.data


def get_program_count() -> int:
    """Get total count of funding programs."""
    client = get_client()
    result = client.table("funding_programs").select("id", count="exact").execute()
    return result.count or 0
