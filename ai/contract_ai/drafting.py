from __future__ import annotations

from pathlib import Path
from typing import Dict, Any, List

from jinja2 import Environment, FileSystemLoader, select_autoescape


def _env(templates_dir: Path) -> Environment:
    return Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(enabled_extensions=(".html", ".jinja")),
        trim_blocks=True,
        lstrip_blocks=True,
    )


def render_contract(template_name: str, variables: Dict[str, Any], templates_dir: str | Path) -> str:
    env = _env(Path(templates_dir))
    tpl = env.get_template(template_name)
    return tpl.render(**variables)


def select_clauses(clause_library: Dict[str, str], requested: List[str] | None) -> Dict[str, str]:
    if not requested:
        return clause_library
    return {k: v for k, v in clause_library.items() if k in requested}
