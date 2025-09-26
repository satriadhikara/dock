from __future__ import annotations

import re
from typing import List

from .types import RiskFinding, Metadata


RISK_RULES = [
    {
        "id": "risk.indemnity.broad",
        "severity": "high",
        "pattern": r"indemnif(y|ies|ication).{0,80}(any|all)\s+claims",
        "title": "Broad indemnity",
        "detail": "Indemnity appears overly broad (any/all claims). Consider limiting scope and caps.",
    },
    {
        "id": "risk.limitation.none",
        "severity": "critical",
        "pattern": r"no\s+limitation\s+of\s+liability|unlimited\s+liability",
        "title": "Missing limitation of liability",
        "detail": "Limitation of liability missing or unlimited.",
    },
    {
        "id": "risk.auto_renew.hidden",
        "severity": "medium",
        "pattern": r"auto(matic)?\s+renew(al|s)\b",
        "title": "Automatic renewal",
        "detail": "Automatic renewal detected; ensure notice windows are acceptable.",
    },
    {
        "id": "risk.governing_law.missing",
        "severity": "medium",
        "pattern": r"",
        "predicate": "missing_governing_law",
        "title": "Governing law missing",
        "detail": "No governing law/jurisdiction detected.",
    },
]


def analyze(text: str, metadata: Metadata) -> List[RiskFinding]:
    findings: List[RiskFinding] = []
    lower = text.lower()
    for rule in RISK_RULES:
        predicate = rule.get("predicate")
        if predicate == "missing_governing_law":
            if not (metadata.governing_law or metadata.jurisdiction):
                findings.append(
                    RiskFinding(
                        id=rule["id"],
                        severity=rule["severity"],
                        title=rule["title"],
                        detail=rule["detail"],
                    )
                )
            continue

        pat = rule.get("pattern")
        if pat and re.search(pat, lower, re.IGNORECASE | re.DOTALL):
            m = re.search(pat, lower, re.IGNORECASE | re.DOTALL)
            snippet = text[max(0, (m.start() if m else 0) - 60) : (m.end() if m else 100) + 60] if m else None
            findings.append(
                RiskFinding(
                    id=rule["id"],
                    severity=rule["severity"],
                    title=rule["title"],
                    detail=rule["detail"],
                    clause_snippet=snippet,
                )
            )
    # Heuristic: if expiration date missing and no termination clause
    if not metadata.expiration_date and not re.search(r"termination", lower):
        findings.append(
            RiskFinding(
                id="risk.term.open_ended",
                severity="high",
                title="Open-ended term",
                detail="No expiration/termination detected; may be open-ended.",
            )
        )
    return findings
