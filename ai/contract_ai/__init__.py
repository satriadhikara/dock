"""Contract AI package (hybrid-only).

This package provides:
- Parsing and extraction of contract metadata
- Risk and compliance analysis
- Jinja2-based drafting support
- FastAPI server and CLI

Hybrid-only: LLM (Gemini) + rule-based, with fallback to rules-only if LLM is unavailable.
"""

__all__ = [
    "types",
]
