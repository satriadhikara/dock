from __future__ import annotations

from pathlib import Path


def read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def read_pdf_file(path: Path) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception as e:
        raise RuntimeError("pypdf is required to read PDF files") from e

    reader = PdfReader(str(path))
    texts = []
    for page in reader.pages:
        try:
            texts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(texts)


def read_docx_file(path: Path) -> str:
    try:
        import docx  # python-docx
    except Exception as e:
        raise RuntimeError("python-docx is required to read DOCX files") from e

    document = docx.Document(str(path))
    lines = [p.text for p in document.paragraphs]
    return "\n".join(lines)


def load_text(path: str | Path) -> str:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(p)
    suffix = p.suffix.lower()
    if suffix in (".txt", ".md", ".rtf"):
        return read_text_file(p)
    if suffix in (".pdf",):
        return read_pdf_file(p)
    if suffix in (".docx",):
        return read_docx_file(p)
    # fallback attempt: try text
    try:
        return read_text_file(p)
    except Exception:
        raise ValueError(f"Unsupported file type: {suffix}")
