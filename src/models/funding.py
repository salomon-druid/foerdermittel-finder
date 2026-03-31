"""Pydantic models for funding programs."""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class FundingStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    UPCOMING = "upcoming"
    UNKNOWN = "unknown"


class FundingProvider(str, Enum):
    EU = "EU"
    KFW = "KfW"
    BUND = "Bund"
    LAND = "Land"
    SONSTIGE = "Sonstige"


class FundingCategory(str, Enum):
    INNOVATION = "Innovation"
    DIGITALISIERUNG = "Digitalisierung"
    UMWELT = "Umwelt"
    ENERGIE = "Energie"
    EXPORT = "Export"
    GRUENDUNG = "Gründung"
    FORSCHUNG = "Forschung"
    BILDUNG = "Bildung"
    INFRASTRUKTUR = "Infrastruktur"
    SOZIALES = "Soziales"
    GENERAL = "Allgemein"


class CompanySize(str, Enum):
    KLEIN = "Klein"  # < 50 MA
    KMU = "KMU"  # < 250 MA
    MITTELSTAND = "Mittelstand"  # 250-5000 MA
    GROSS = "Großunternehmen"  # > 5000 MA


class CompanyProfile(BaseModel):
    """A company profile for matching against funding programs."""
    id: str
    name: str
    industry: str  # e.g. "IT", "Handwerk", "Produktion", "Forschung"
    size: CompanySize
    region: str  # Bundesland or "Deutschland"
    focus_areas: list[str] = []  # e.g. ["Innovation", "Digitalisierung"]
    employee_count: Optional[int] = None
    annual_revenue: Optional[float] = None  # in EUR


class FundingProgram(BaseModel):
    """A single funding program / opportunity."""
    id: str = Field(..., description="Unique identifier")
    title: str
    description: str = ""
    provider: FundingProvider = FundingProvider.SONSTIGE
    country: str = "DE"  # DE, EU, etc.
    category: FundingCategory = FundingCategory.GENERAL
    max_funding: Optional[float] = None  # max amount in EUR
    funding_rate: Optional[float] = None  # percentage (0-100)
    deadline: Optional[date] = None
    start_date: Optional[date] = None
    requirements: list[str] = []
    target_groups: list[str] = []  # KMU, Handwerk, Startup, etc.
    url: str = ""
    status: FundingStatus = FundingStatus.UNKNOWN
    source: str = ""  # where it was scraped from
    raw_data: Optional[dict] = None  # original scraped data
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MatchResult(BaseModel):
    """A scored match between a company and a funding program."""
    program: FundingProgram
    company_id: str
    total_score: float = 0.0  # 0-100
    industry_score: float = 0.0
    size_score: float = 0.0
    region_score: float = 0.0
    focus_score: float = 0.0
    urgency_score: float = 0.0
    matched_at: datetime = Field(default_factory=datetime.now)
