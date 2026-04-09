#!/usr/bin/env python3
"""One-off: extract Характеристики section from product descriptions into characteristics[]."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "src/data/products.json"

# Order matters: more specific first
HEADER_PATTERNS = [
    r"Характеристики изделия:\s*",
    r"Характеритсики изделия:\s*",  # typo in data
    r"Характеристики кольца:\s*",
    r"Характеристика изделия:\s*",
    r"Характеристики:\s*",
]


def find_header_span(text: str) -> tuple[int | None, int | None]:
    for pat in HEADER_PATTERNS:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.start(), m.end()
    return None, None


def split_embedded_specs(line: str) -> list[str]:
    """Split '... - Дополнительные вставки: ...' on same line."""
    line = line.strip()
    if not line.startswith("-") and ":" in line[:120]:
        return [line]
    if line.startswith("-"):
        line = line[1:].strip()
    # Split on ' - ' when followed by Cyrillic capital (new label)
    parts = re.split(r"\s+-\s+(?=[А-ЯЁA-Z])", line)
    out = []
    for p in parts:
        p = p.strip()
        if p.startswith("-"):
            p = p[1:].strip()
        if p:
            out.append(p)
    return out if len(out) > 1 else [line]


def parse_key_value_line(line: str) -> tuple[str, str] | None:
    line = line.strip()
    if line.startswith("-"):
        line = line[1:].strip()
    m = re.match(r"^([^:\n]{1,100}):\s*(.+)$", line, re.DOTALL)
    if not m:
        return None
    key, val = m.group(1).strip(), m.group(2).strip()
    # Heuristic: real spec keys are short; prose lines often lack second part structure
    if len(key) > 90:
        return None
    if not val:
        return None
    return key, val


def extract(text: str) -> tuple[list[dict], str, str]:
    """Returns (characteristics, intro, outro)."""
    start, end = find_header_span(text)
    if start is None:
        return [], text.strip(), ""

    intro = text[:start].rstrip()
    rest = text[end:].lstrip()

    # Same-line header + first bullet: "Характеристики изделия:  - Материал: ..."
    rest = re.sub(r"^-\s+", "- ", rest)

    lines: list[str] = []
    for raw in rest.split("\n"):
        raw = raw.strip()
        if not raw:
            continue
        for piece in split_embedded_specs(raw):
            lines.append(piece)

    specs: list[dict] = []
    outro_lines: list[str] = []
    in_specs = True

    for line in lines:
        line = line.strip()
        if not line:
            continue
        kv = parse_key_value_line(line)
        if kv and in_specs:
            k, v = kv
            specs.append({"key": k, "value": v})
            continue
        in_specs = False
        outro_lines.append(line)

    outro = "\n\n".join(outro_lines).strip()
    return specs, intro.strip(), outro


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for p in data:
        desc = p.get("description", "")
        specs, intro, outro = extract(desc)
        p["description"] = intro
        if specs:
            p["characteristics"] = specs
        else:
            p.pop("characteristics", None)
        if outro:
            p["descriptionEnd"] = outro
        else:
            p.pop("descriptionEnd", None)

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {JSON_PATH}")


if __name__ == "__main__":
    main()
