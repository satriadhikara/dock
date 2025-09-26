from __future__ import annotations

import re
from typing import List, Tuple

import dateparser

from .types import Metadata, ExtractedParty, Obligation, ExtractionResult


DATE_PATTERNS = [
    r"\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b",  # 01 January 2025
    r"\b\d{4}-\d{2}-\d{2}\b",  # 2025-09-26
    r"\b\d{1,2}/\d{1,2}/\d{2,4}\b",  # 1/5/2025
]


def parse_date(text: str):
    dt = dateparser.parse(text)
    return dt.date() if dt else None


def extract_parties(text: str) -> List[ExtractedParty]:
    parties: List[ExtractedParty] = []
    m = re.search(r"between\s+(.*?)\s+and\s+(.*?)[\.,\n]", text, re.IGNORECASE | re.DOTALL)
    if m:
        a = re.sub(r"\s+", " ", m.group(1)).strip(' "')
        b = re.sub(r"\s+", " ", m.group(2)).strip(' "')
        if a:
            parties.append(ExtractedParty(name=a, role="Party A"))
        if b:
            parties.append(ExtractedParty(name=b, role="Party B"))
    return parties


def extract_dates(text: str) -> Tuple:
    effective = None
    execution = None
    expiration = None
    for label in ["effective date", "effective as of", "berlaku sejak"]:
        m = re.search(label + r"[:\s]+(.{0,40})", text, re.IGNORECASE)
        if m:
            d = parse_date(m.group(1))
            if d:
                effective = d
                break
    for label in ["date of execution", "executed on", "ditandatangani pada"]:
        m = re.search(label + r"[:\s]+(.{0,40})", text, re.IGNORECASE)
        if m:
            d = parse_date(m.group(1))
            if d:
                execution = d
                break
    for label in ["expires on", "expiration", "berakhir pada"]:
        m = re.search(label + r"[:\s]+(.{0,40})", text, re.IGNORECASE)
        if m:
            d = parse_date(m.group(1))
            if d:
                expiration = d
                break
    if not effective:
        for pat in DATE_PATTERNS:
            m = re.search(pat, text)
            if m:
                d = parse_date(m.group(0))
                if d:
                    effective = d
                    break
    return effective, execution, expiration


def extract_amounts(text: str) -> List[str]:
    amounts = re.findall(r"(?:USD|Rp|IDR|\$)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?", text, re.IGNORECASE)
    return list(dict.fromkeys(amounts))


def extract_obligations(text: str) -> List[Obligation]:
    obligations: List[Obligation] = []
    for m in re.finditer(r"\b(shall|must|wajib)\b(.{0,200})", text, re.IGNORECASE):
        desc = (m.group(1) + m.group(2)).strip()
        obligations.append(Obligation(description=desc))
    return obligations


def extract(text: str) -> ExtractionResult:
    parties = extract_parties(text)
    effective, execution, expiration = extract_dates(text)
    amounts = extract_amounts(text)
    obligations = extract_obligations(text)

    meta = Metadata(
        effective_date=effective,
        execution_date=execution,
        expiration_date=expiration,
        parties=parties,
        amounts=amounts,
        obligations=obligations,
    )
    return ExtractionResult(text=text, metadata=meta)
