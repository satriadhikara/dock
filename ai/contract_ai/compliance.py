from __future__ import annotations

import json
from pathlib import Path
from typing import List, Dict, Any

import yaml

from .types import ComplianceIssue, Metadata


def load_policies(path: str | Path) -> List[Dict[str, Any]]:
    p = Path(path)
    if not p.exists():
        return []
    if p.suffix.lower() in (".yaml", ".yml"):
        return yaml.safe_load(p.read_text(encoding="utf-8")) or []
    else:
        return json.loads(p.read_text(encoding="utf-8"))


def check(metadata: Metadata, text: str, policies: List[Dict[str, Any]]) -> List[ComplianceIssue]:
    issues: List[ComplianceIssue] = []
    lower = text.lower()
    for policy in policies:
        pid = policy.get("id", "policy.unknown")
        severity = policy.get("severity", "medium")
        title = policy.get("title", "Policy requirement")
        requirement = policy.get("requirement", "")
        clause_required = policy.get("clause_contains")
        field_required = policy.get("field_required")

        satisfied = True
        finding = []
        if clause_required and clause_required.lower() not in lower:
            satisfied = False
            finding.append(f"Missing clause containing: '{clause_required}'")
        if field_required:
            val = getattr(metadata, field_required, None)
            if not val:
                satisfied = False
                finding.append(f"Missing field: {field_required}")

        if not satisfied:
            issues.append(
                ComplianceIssue(
                    policy_id=pid,
                    title=title,
                    severity=severity,
                    requirement=requirement,
                    finding="; ".join(finding) if finding else "Not satisfied",
                )
            )
    return issues
