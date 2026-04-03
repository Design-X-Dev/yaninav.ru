#!/usr/bin/env python3
"""One-off: Товары на сайт (1).csv -> src/data/products.json"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "Товары на сайт (1).csv"
OUT_PATH = ROOT / "src" / "data" / "products.json"

BOILERPLATE_START = "Как заказать?"


def normalize_category(cat: str) -> str:
    c = cat.strip()
    low = c.lower()
    if low.startswith("мужск") and "обручальн" in low:
        return "Мужские обручальные кольца"
    if low.startswith("женск") and "обручальн" in low:
        return "Женские обручальные кольца"
    if "серьги" in low and "пусет" in low:
        return "Серьги и пусеты"
    return c


def parse_price(raw: str):
    if raw is None:
        return None
    s = raw.strip().lower().replace("\xa0", " ")
    if not s or "по запросу" in s:
        return None
    # "1 100 000,00  "
    clean = s.replace(" ", "").replace("\u202f", "")
    if "," in clean:
        clean = clean.split(",")[0]  # drop kopecks
    try:
        return int(clean)
    except ValueError:
        return None


def strip_boilerplate(desc: str) -> str:
    if not desc:
        return ""
    if BOILERPLATE_START in desc:
        desc = desc.split(BOILERPLATE_START, 1)[0]
    desc = desc.rstrip()
    # Remove trailing orphan asterisk lines
    desc = re.sub(r"\n\s*\*\s*Окончательная.*$", "", desc, flags=re.DOTALL | re.IGNORECASE)
    return desc.rstrip()


def main():
    with CSV_PATH.open("r", encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";", quotechar='"')
        rows = list(reader)

    products = []
    i = 0
    # skip header rows until we see numeric id in col0
    while i < len(rows):
        row = rows[i]
        if not row or len(row) < 6:
            i += 1
            continue
        id_raw = row[0].strip()
        if not id_raw.isdigit():
            i += 1
            continue

        pid = int(id_raw)
        image = row[1].strip()
        category = normalize_category(row[2])
        name = row[3].strip().replace("\n", " ").strip()
        description = strip_boilerplate(row[4].strip())
        price = parse_price(row[5])
        banner_image = (row[7] or "").strip() if len(row) > 7 else ""

        extra_images: list[str] = []
        i += 1
        while i < len(rows):
            nxt = rows[i]
            if not nxt:
                i += 1
                continue
            next_id = nxt[0].strip()
            if next_id.isdigit():
                break
            # continuation row: image in col1
            img2 = (nxt[1] or "").strip()
            if img2 and img2.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                extra_images.append(img2)
            i += 1

        image2 = extra_images[0] if len(extra_images) > 0 else None
        image3 = extra_images[1] if len(extra_images) > 1 else None

        item = {
            "id": pid,
            "image": image,
            "category": category,
            "name": name,
            "description": description,
            "price": price,
            "bannerImage": banner_image,
        }
        if image2:
            item["image2"] = image2
        if image3:
            item["image3"] = image3

        products.append(item)

    products.sort(key=lambda p: p["id"])
    ids = [p["id"] for p in products]
    if len(ids) != len(set(ids)):
        raise SystemExit(f"Duplicate ids: {ids}")

    OUT_PATH.write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(products)} products to {OUT_PATH}")


if __name__ == "__main__":
    main()
