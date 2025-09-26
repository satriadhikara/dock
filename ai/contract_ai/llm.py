from __future__ import annotations

import os
import json
import logging
from typing import List

try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover - optional dep
    genai = None  # fallback when not installed

from .types import Metadata, RiskFinding


def _coerce_json(text: str):
    """Parse JSON from model text; tolerate code fences or extra wrapping."""
    # Fast path
    try:
        return json.loads(text)
    except Exception:
        pass
    t = (text or "").strip()
    # Strip Markdown code fences if present
    if t.startswith("```"):
        first_nl = t.find("\n")
        if first_nl != -1:
            t = t[first_nl + 1 :]
        if t.endswith("```"):
            t = t[:-3]
        try:
            return json.loads(t.strip())
        except Exception:
            pass
    # Extract largest JSON object block
    start = t.find("{")
    end = t.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = t[start : end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass
    raise ValueError("Could not parse JSON from model response")


def _load_dotenv_if_available():
    try:
        from dotenv import load_dotenv  # type: ignore
        load_dotenv()
    except Exception:
        pass


class LLMNotConfigured(RuntimeError):
    pass


def _env_truthy(name: str) -> bool:
    val = os.getenv(name)
    if not val:
        return False
    return val.strip().lower() in {"1", "true", "yes", "on"}


class GeminiClient:
    """
    Minimal Gemini client.
    If GEMINI_API_KEY or google-generativeai is missing, raises LLMNotConfigured so callers can fallback.
    """

    def __init__(self, model_name: str = "gemini-2.5-pro", log: bool | None = None):
        _load_dotenv_if_available()
        api_key = os.getenv("GEMINI_API_KEY")
        # Logging setup (optional)
        self._log_enabled = bool(_env_truthy("LLM_LOG") or _env_truthy("CONTRACT_AI_LLM_LOG")) if log is None else log
        self._logger = logging.getLogger("contract_ai.llm")
        if self._log_enabled and not any(isinstance(h, logging.FileHandler) for h in self._logger.handlers):
            try:
                log_path = os.getenv("LLM_LOG_FILE") or os.path.join(os.getcwd(), "logs", "llm.log")
                os.makedirs(os.path.dirname(log_path), exist_ok=True)
                fh = logging.FileHandler(log_path, encoding="utf-8")
                fmt = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
                fh.setFormatter(fmt)
                self._logger.setLevel(logging.INFO)
                self._logger.addHandler(fh)
            except Exception:
                # If file handler fails, fall back to standard logging without crashing
                pass

        if not api_key or genai is None:
            # Log fallback event if enabled
            if self._log_enabled:
                try:
                    reason = "missing SDK" if genai is None else "missing GEMINI_API_KEY"
                    self._logger.info(json.dumps({"event": "llm_fallback", "stage": "init", "reason": reason}))
                except Exception:
                    pass
            raise LLMNotConfigured("Gemini not configured (missing SDK or GEMINI_API_KEY)")

        genai.configure(api_key=api_key)
        # Allow model name override via environment
        env_model = os.getenv("GEMINI_MODEL")
        model_name = env_model or model_name
        # Prefer JSON responses when supported
        try:
            self.model = genai.GenerativeModel(
                model_name,
                generation_config={"response_mime_type": "application/json"},
            )
        except Exception:
            self.model = genai.GenerativeModel(model_name)

    def extract_and_analyze(self, text: str):
        """
        Ask the model for structured JSON with `metadata` and `risks` keys.
        Returns an object with `.metadata` (Metadata) and `.risks` (List[RiskFinding]).
        """
        schema = {
            "type": "object",
            "properties": {
                "metadata": {
                    "type": "object",
                    "properties": {
                        "parties": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "role": {"type": "string"}}, "required": ["name"]}},
                        "effective_date": {"type": ["string", "null"]},
                        "execution_date": {"type": ["string", "null"]},
                        "expiration_date": {"type": ["string", "null"]},
                        "amounts": {"type": "array", "items": {"type": ["string", "number"]}},
                        "obligations": {"type": "array", "items": {"type": "object", "properties": {"owner": {"type": ["string", "null"]}, "description": {"type": "string"}, "due_date": {"type": ["string", "null"]}}, "required": ["description"]}},
                        "governing_law": {"type": ["string", "null"]},
                        "term": {"type": ["string", "null"]},
                        "auto_renew": {"type": ["boolean", "null"]},
                    },
                },
                "risks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                            "title": {"type": "string"},
                            "detail": {"type": "string"},
                            "clause_snippet": {"type": ["string", "null"]},
                            "references": {"type": "array", "items": {"type": "string"}},
                            # Back-compat fields accepted but ignored if title/detail present
                            "message": {"type": ["string", "null"]},
                            "context": {"type": ["object", "null"]},
                        },
                        "required": ["id", "severity", "title", "detail"],
                    },
                },
            },
            "required": ["metadata", "risks"],
        }

        prompt = (
            "You are a contract analyst. Extract structured metadata and list notable risks.\n"
            "Return strictly valid JSON following this schema. Do not include any prose.\n"
            "Use lowercase severity values: low, medium, high, or critical.\n"
            f"Schema: {json.dumps(schema)}\n"
        )

        try:
            full_prompt = prompt + "\n\nTEXT:\n" + text
            response = self.model.generate_content([
                {"role": "user", "parts": [full_prompt]}
            ])
            content = response.text  # type: ignore[attr-defined]
            # Log raw response before parsing for troubleshooting
            if getattr(self, "_log_enabled", False):
                try:
                    self._logger.info(json.dumps({
                        "model": getattr(self.model, "model_name", "gemini"),
                        "prompt": prompt,
                        "response_text": content,
                    }, ensure_ascii=False))
                except Exception:
                    pass
            data = _coerce_json(content)
            # Normalize/bridge fields to internal models
            meta_in = data.get("metadata", {}) or {}
            # Ensure amounts are strings as our Metadata expects List[str]
            if isinstance(meta_in.get("amounts"), list):
                meta_in["amounts"] = [str(x) for x in meta_in["amounts"]]
            md = Metadata.model_validate(meta_in)

            def _map_risk(r: dict) -> dict:
                if not isinstance(r, dict):
                    return {}
                sev = str(r.get("severity", "")).strip().lower() or "low"
                title = r.get("title") or r.get("message") or "Risk"
                detail = r.get("detail") or r.get("message") or ""
                clause = r.get("clause_snippet") or (r.get("context") or {}).get("clause")
                refs = r.get("references") or []
                if not isinstance(refs, list):
                    refs = [str(refs)]
                return {
                    "id": r.get("id") or "risk",
                    "severity": sev,
                    "title": title,
                    "detail": detail,
                    "clause_snippet": clause,
                    "references": [str(x) for x in refs],
                }

            risks_raw = data.get("risks", []) or []
            risks: List[RiskFinding] = [RiskFinding.model_validate(_map_risk(r)) for r in risks_raw]

            class Result:
                def __init__(self, metadata: Metadata, risks: List[RiskFinding]):
                    self.metadata = metadata
                    self.risks = risks
                    # Debug fields for logging/inspection
                    self.prompt = prompt
                    self.response_text = content

            return Result(md, risks)
        except Exception as e:  # Any LLM error -> signal fallback
            if getattr(self, "_log_enabled", False):
                try:
                    self._logger.info(json.dumps({
                        "event": "llm_fallback",
                        "stage": "generate",
                        "reason": str(e),
                        "response_text": content if 'content' in locals() else None,
                    }))
                except Exception:
                    pass
            raise LLMNotConfigured(str(e))
