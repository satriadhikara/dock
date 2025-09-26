from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel

from contract_ai.parser import load_text
from contract_ai.extractor import extract
from contract_ai.risk import analyze as analyze_risk
from contract_ai.compliance import check as check_compliance, load_policies
from contract_ai.drafting import render_contract, select_clauses
from contract_ai.types import (
    ExtractionResult,
    AnalysisResult,
    DraftRequest,
    DraftResult,
)


try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

app = FastAPI(title="Contract AI Service", version="0.1.0")


class ExtractBody(BaseModel):
    text: Optional[str] = None


class AnalyzeBody(BaseModel):
    text: Optional[str] = None
    policies: Optional[List[Dict[str, Any]]] = None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractionResult)
async def extract_json(body: ExtractBody) -> ExtractionResult:
    if not body.text:
        raise HTTPException(status_code=400, detail="Missing text")
    txt = body.text
    # Try LLM, fall back to rules
    try:
        from contract_ai.llm import GeminiClient

        llm = GeminiClient()
        lr = llm.extract_and_analyze(txt)
        rules = extract(txt)
        meta = lr.metadata.model_copy(
            update={
                "effective_date": lr.metadata.effective_date or rules.metadata.effective_date,
                "execution_date": lr.metadata.execution_date or rules.metadata.execution_date,
                "expiration_date": lr.metadata.expiration_date or rules.metadata.expiration_date,
                "parties": lr.metadata.parties or rules.metadata.parties,
                "amounts": lr.metadata.amounts or rules.metadata.amounts,
                "obligations": lr.metadata.obligations or rules.metadata.obligations,
            }
        )
        return ExtractionResult(text=txt, metadata=meta)
    except Exception:
        ex = extract(txt)
        return ex


@app.post("/extract/upload", response_model=ExtractionResult)
async def extract_upload(file: UploadFile = File(...)) -> ExtractionResult:
    # Persist to temp file to reuse existing loaders
    suffix = "" if not file.filename else ("_" + os.path.basename(file.filename))
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()
        txt = load_text(tmp.name)
        # Reuse /extract logic without duplicating merge
        try:
            from contract_ai.llm import GeminiClient

            llm = GeminiClient()
            lr = llm.extract_and_analyze(txt)
            rules = extract(txt)
            meta = lr.metadata.model_copy(
                update={
                    "effective_date": lr.metadata.effective_date or rules.metadata.effective_date,
                    "execution_date": lr.metadata.execution_date or rules.metadata.execution_date,
                    "expiration_date": lr.metadata.expiration_date or rules.metadata.expiration_date,
                    "parties": lr.metadata.parties or rules.metadata.parties,
                    "amounts": lr.metadata.amounts or rules.metadata.amounts,
                    "obligations": lr.metadata.obligations or rules.metadata.obligations,
                }
            )
            return ExtractionResult(text=txt, metadata=meta)
        except Exception:
            return extract(txt)
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_json(body: AnalyzeBody) -> AnalysisResult:
    if not body.text:
        raise HTTPException(status_code=400, detail="Missing text")
    txt = body.text
    if body.policies is not None:
        policies = body.policies
    else:
        res_path = Path(__file__).resolve().parent.parent / "contract_ai" / "resources" / "policies.yaml"
        policies = load_policies(str(res_path)) if res_path.exists() else []
    try:
        from contract_ai.llm import GeminiClient

        llm = GeminiClient()
        lr = llm.extract_and_analyze(txt)
        rules = extract(txt)
        merged_meta = lr.metadata.model_copy(
            update={
                "effective_date": rules.metadata.effective_date or lr.metadata.effective_date,
                "execution_date": rules.metadata.execution_date or lr.metadata.execution_date,
                "expiration_date": rules.metadata.expiration_date or lr.metadata.expiration_date,
                "amounts": rules.metadata.amounts or lr.metadata.amounts,
                "obligations": rules.metadata.obligations or lr.metadata.obligations,
            }
        )
        rr = analyze_risk(txt, merged_meta)
        combined = {r.id: r for r in lr.risks}
        for r in rr:
            combined.setdefault(r.id, r)
        comp = check_compliance(merged_meta, txt, policies)
        return AnalysisResult(
            metadata=merged_meta,
            risks=list(combined.values()),
            compliance=comp,
        )
    except Exception:
        ex = extract(txt)
        risks = analyze_risk(txt, ex.metadata)
        comp = check_compliance(ex.metadata, txt, policies)
        return AnalysisResult(metadata=ex.metadata, risks=risks, compliance=comp)


@app.post("/analyze/upload", response_model=AnalysisResult)
async def analyze_upload(file: UploadFile = File(...)) -> AnalysisResult:
    suffix = "" if not file.filename else ("_" + os.path.basename(file.filename))
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()
        txt = load_text(tmp.name)
        # Default policies from resources
        res_path = Path(__file__).resolve().parent.parent / "contract_ai" / "resources" / "policies.yaml"
        policies = load_policies(str(res_path)) if res_path.exists() else []
        try:
            from contract_ai.llm import GeminiClient

            llm = GeminiClient()
            lr = llm.extract_and_analyze(txt)
            rules = extract(txt)
            merged_meta = lr.metadata.model_copy(
                update={
                    "effective_date": rules.metadata.effective_date or lr.metadata.effective_date,
                    "execution_date": rules.metadata.execution_date or lr.metadata.execution_date,
                    "expiration_date": rules.metadata.expiration_date or lr.metadata.expiration_date,
                    "amounts": rules.metadata.amounts or lr.metadata.amounts,
                    "obligations": rules.metadata.obligations or lr.metadata.obligations,
                }
            )
            rr = analyze_risk(txt, merged_meta)
            combined = {r.id: r for r in lr.risks}
            for r in rr:
                combined.setdefault(r.id, r)
            comp = check_compliance(merged_meta, txt, policies)
            return AnalysisResult(
                metadata=merged_meta,
                risks=list(combined.values()),
                compliance=comp,
            )
        except Exception:
            ex = extract(txt)
            risks = analyze_risk(txt, ex.metadata)
            comp = check_compliance(ex.metadata, txt, policies)
            return AnalysisResult(metadata=ex.metadata, risks=risks, compliance=comp)
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


@app.post("/draft", response_model=DraftResult)
async def draft(request: DraftRequest) -> DraftResult:
    resources = Path(__file__).resolve().parent.parent / "contract_ai" / "resources"
    clauses_path = resources / "clauses.yaml"
    clause_library = None
    if clauses_path.exists():
        try:
            # Try YAML via compliance loader
            from contract_ai import compliance as comp_mod  # type: ignore

            if getattr(comp_mod, "yaml", None) is not None:
                clause_library = comp_mod.yaml.safe_load(clauses_path.read_text(encoding="utf-8"))
        except Exception:
            clause_library = None
        if clause_library is None:
            try:
                clause_library = json.loads(clauses_path.read_text(encoding="utf-8"))
            except Exception:
                clause_library = None
    if clause_library is None:
        clause_library = {
            "confidentiality": "Each party shall keep confidential any proprietary information...",
            "governing_law": "This Agreement shall be governed by the laws of [Jurisdiction].",
            "limitation_of_liability": "In no event shall either party be liable for indirect, incidental, special, or consequential damages...",
        }

    requested = request.clauses or []
    selected = select_clauses(clause_library, requested)
    variables = dict(request.variables or {})
    variables["clauses"] = selected
    # Simple template mapping by contract_type
    template_map = {"base": "base_contract.jinja"}
    template_name = template_map.get(request.contract_type, "base_contract.jinja")
    content = render_contract(template_name, variables, resources / "templates")
    return DraftResult(content=content, used_clauses=list(selected.keys()))