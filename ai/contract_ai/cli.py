from __future__ import annotations

import argparse
import json
from pathlib import Path

from .parser import load_text
from .extractor import extract
from .risk import analyze as analyze_risk


def cmd_extract(args):
    txt = load_text(args.input) if args.input else args.text
    try:
        from .llm import GeminiClient
        llm = GeminiClient()
        lr = llm.extract_and_analyze(txt)
        rules = extract(txt)
        meta = lr.metadata.model_copy(update={
            "effective_date": lr.metadata.effective_date or rules.metadata.effective_date,
            "execution_date": lr.metadata.execution_date or rules.metadata.execution_date,
            "expiration_date": lr.metadata.expiration_date or rules.metadata.expiration_date,
            "parties": lr.metadata.parties or rules.metadata.parties,
            "amounts": lr.metadata.amounts or rules.metadata.amounts,
            "obligations": lr.metadata.obligations or rules.metadata.obligations,
        })
        print(json.dumps({"text": txt, "metadata": meta.model_dump()}, ensure_ascii=False, indent=2, default=str))
    except Exception:
        result = extract(txt)
        print(json.dumps(result.model_dump(), ensure_ascii=False, indent=2, default=str))


def cmd_analyze(args):
    # Defer imports to avoid requiring optional deps on help command
    from .compliance import check as check_compliance, load_policies

    txt = load_text(args.input) if args.input else args.text
    if args.policies:
        policies = load_policies(args.policies)
    else:
        resources = Path(__file__).parent / "resources" / "policies.yaml"
        policies = load_policies(str(resources)) if resources.exists() else []
    try:
        from .llm import GeminiClient
        llm = GeminiClient()
        lr = llm.extract_and_analyze(txt)
        rules = extract(txt)
        merged_meta = lr.metadata.model_copy(update={
            "effective_date": rules.metadata.effective_date or lr.metadata.effective_date,
            "execution_date": rules.metadata.execution_date or lr.metadata.execution_date,
            "expiration_date": rules.metadata.expiration_date or lr.metadata.expiration_date,
            "amounts": rules.metadata.amounts or lr.metadata.amounts,
            "obligations": rules.metadata.obligations or lr.metadata.obligations,
        })
        rr = analyze_risk(txt, merged_meta)
        combined = {r.id: r for r in lr.risks}
        for r in rr:
            combined.setdefault(r.id, r)
        comp = check_compliance(merged_meta, txt, policies)
        out = {"metadata": merged_meta.model_dump(), "risks": [r.model_dump() for r in combined.values()], "compliance": [c.model_dump() for c in comp]}
        print(json.dumps(out, ensure_ascii=False, indent=2, default=str))
    except Exception:
        ex = extract(txt)
        risks = analyze_risk(txt, ex.metadata)
        comp = check_compliance(ex.metadata, txt, policies)
        out = {"metadata": ex.metadata.model_dump(), "risks": [r.model_dump() for r in risks], "compliance": [c.model_dump() for c in comp]}
        print(json.dumps(out, ensure_ascii=False, indent=2, default=str))


def cmd_draft(args):
    # Defer imports to avoid requiring optional deps on help command
    from .drafting import render_contract, select_clauses
    resources = Path(__file__).parent / "resources"
    clauses_path = resources / "clauses.yaml"
    clause_library = None
    if clauses_path.exists():
        # Try YAML first via compliance loader to leverage existing dependency
        try:
            from .compliance import yaml as _yaml  # type: ignore
            if _yaml is not None:
                clause_library = _yaml.safe_load(clauses_path.read_text(encoding="utf-8"))
        except Exception:
            clause_library = None
        if clause_library is None:
            # Try JSON as a fallback if the YAML happens to be valid JSON
            try:
                clause_library = json.loads(clauses_path.read_text(encoding="utf-8"))
            except Exception:
                clause_library = None
    if clause_library is None:
        # Minimal built-in fallback
        clause_library = {
            "confidentiality": "Each party shall keep confidential any proprietary information...",
            "governing_law": "This Agreement shall be governed by the laws of [Jurisdiction].",
            "limitation_of_liability": "In no event shall either party be liable for indirect, incidental, special, or consequential damages...",
        }
    selected = select_clauses(clause_library, args.clauses)
    variables = {"party_a": args.party_a, "party_b": args.party_b, "clauses": selected}
    content = render_contract("base_contract.jinja", variables, resources / "templates")
    print(content)


def build_parser():
    p = argparse.ArgumentParser(prog="contract-ai", description="Contract AI tools (hybrid-only)")
    sub = p.add_subparsers(dest="cmd", required=True)

    pe = sub.add_parser("extract", help="Extract metadata from contract text or file")
    pe.add_argument("--input", type=str, help="Path to file (pdf, docx, txt)")
    pe.add_argument("--text", type=str, help="Raw text input if no file provided")
    pe.set_defaults(func=cmd_extract)

    pa = sub.add_parser("analyze", help="Analyze risks and compliance")
    pa.add_argument("--input", type=str)
    pa.add_argument("--text", type=str)
    pa.add_argument("--policies", type=str, help="Path to policies.yaml or .json")
    pa.set_defaults(func=cmd_analyze)

    pd = sub.add_parser("draft", help="Draft a contract from clauses and template")
    pd.add_argument("--party-a", dest="party_a", required=True)
    pd.add_argument("--party-b", dest="party_b", required=True)
    pd.add_argument("--clauses", nargs="*", help="List of clause keys to include")
    pd.set_defaults(func=cmd_draft)

    return p


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
