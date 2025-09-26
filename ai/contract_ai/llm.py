from __future__ import annotations

import os
from typing import List

try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover - optional dep
    genai = None  # fallback when not installed

from .types import Metadata, RiskFinding


class LLMNotConfigured(RuntimeError):
    pass


class GeminiClient:
    """
    Minimal Gemini client.
    If GEMINI_API_KEY or google-generativeai is missing, raises LLMNotConfigured so callers can fallback.
    """

    def __init__(self, model_name: str = "gemini-1.5-pro-latest"):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or genai is None:
            raise LLMNotConfigured("Gemini not configured (missing SDK or GEMINI_API_KEY)")
        genai.configure(api_key=api_key)
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
                        "amounts": {"type": "array", "items": {"type": "number"}},
                        "obligations": {"type": "array", "items": {"type": "object", "properties": {"party": {"type": ["string", "null"]}, "description": {"type": "string"}, "due_date": {"type": ["string", "null"]}}, "required": ["description"]}},
                        "governing_law": {"type": ["string", "null"]},
                        "term": {"type": ["string", "null"]},
                        "auto_renew": {"type": ["boolean", "null"]},
                    },
                },
                "risks": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "severity": {"type": "string"}, "message": {"type": "string"}, "context": {"type": ["object", "null"]}}, "required": ["id", "severity", "message"]}},
            },
            "required": ["metadata", "risks"],
        }

        prompt = (
            "You are a contract analyst. Extract structured metadata and list notable risks.\n"
            "Return strictly valid JSON following this schema: metadata + risks. Do not include any prose.\n"
        )

        try:
            response = self.model.generate_content([
                {"role": "user", "parts": [prompt + "\n\nTEXT:\n" + text]}
            ])
            content = response.text  # type: ignore[attr-defined]
            import json

            data = json.loads(content)
            # Pydantic validation/coercion
            md = Metadata.model_validate(data.get("metadata", {}))
            risks: List[RiskFinding] = [RiskFinding.model_validate(r) for r in data.get("risks", [])]

            class Result:
                def __init__(self, metadata: Metadata, risks: List[RiskFinding]):
                    self.metadata = metadata
                    self.risks = risks

            return Result(md, risks)
        except Exception as e:  # Any LLM error -> signal fallback
            raise LLMNotConfigured(str(e))
