from __future__ import annotations

from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExtractedParty(BaseModel):
    name: str
    role: str = Field(description="e.g., Customer, Vendor, Lessor, Lessee")


class Obligation(BaseModel):
    description: str
    due_date: Optional[date] = None
    owner: Optional[str] = None


class RiskFinding(BaseModel):
    id: str
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    title: str
    detail: str
    clause_snippet: Optional[str] = None
    references: List[str] = Field(default_factory=list)


class ComplianceIssue(BaseModel):
    policy_id: str
    title: str
    severity: str
    requirement: str
    finding: str


class Metadata(BaseModel):
    title: Optional[str] = None
    effective_date: Optional[date] = None
    execution_date: Optional[date] = None
    expiration_date: Optional[date] = None
    renewal_terms: Optional[str] = None
    governing_law: Optional[str] = None
    jurisdiction: Optional[str] = None
    parties: List[ExtractedParty] = Field(default_factory=list)
    obligations: List[Obligation] = Field(default_factory=list)
    amounts: List[str] = Field(default_factory=list)
    custom: Dict[str, Any] = Field(default_factory=dict)


class ExtractionResult(BaseModel):
    text: str
    metadata: Metadata


class AnalysisResult(BaseModel):
    metadata: Metadata
    risks: List[RiskFinding]
    compliance: List[ComplianceIssue]


class DraftRequest(BaseModel):
    contract_type: str
    variables: Dict[str, Any] = {}
    clauses: Optional[List[str]] = None


class DraftResult(BaseModel):
    content: str
    used_clauses: List[str]
