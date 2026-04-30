#!/usr/bin/env python3
"""
Создаёт в public/images/products/ сжатые превью с суффиксом _small (например DSC_2367_small.jpg).
Оригиналы не изменяются. Запуск из корня репозитория:
  python3 scripts/generate_product_images_small.py
Требуется Pillow (pip install -r scripts/requirements.txt).
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_DIR = ROOT / "public" / "images" / "products"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# Длинная сторона превью для веба (px)
WEB_PREVIEW_MAX_SIDE = 1600
JPEG_QUALITY = 82
WEBP_QUALITY = 80


def small_destination(original: Path) -> Path:
    return original.parent / f"{original.stem}_small{original.suffix.lower()}"


def is_already_small_variant(path: Path) -> bool:
    return path.stem.lower().endswith("_small")


def build_preview_from_original(src: Path, dest: Path) -> None:
    ext = src.suffix.lower()
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        im.load()
        w, h = im.size
        if w < 1 or h < 1:
            return
        if max(w, h) > WEB_PREVIEW_MAX_SIDE:
            scale = WEB_PREVIEW_MAX_SIDE / float(max(w, h))
            new_w = max(1, int(round(w * scale)))
            new_h = max(1, int(round(h * scale)))
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

        if ext in (".jpg", ".jpeg"):
            rgb = im
            if rgb.mode in ("RGBA", "P"):
                rgb = rgb.convert("RGB")
            elif rgb.mode == "CMYK":
                rgb = rgb.convert("RGB")
            elif rgb.mode != "RGB":
                rgb = rgb.convert("RGB")
            rgb.save(
                dest,
                format="JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )
        elif ext == ".png":
            if im.mode == "P" and "transparency" in im.info:
                im = im.convert("RGBA")
            im.save(dest, format="PNG", optimize=True)
        elif ext == ".webp":
            im.save(dest, format="WEBP", quality=WEBP_QUALITY, method=6)
        else:
            im.save(dest)


def main() -> int:
    if not PRODUCTS_DIR.is_dir():
        print(f"Папка не найдена: {PRODUCTS_DIR}", file=sys.stderr)
        return 1

    created = 0
    skipped = 0
    errors: list[str] = []

    for path in sorted(PRODUCTS_DIR.iterdir()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        if is_already_small_variant(path):
            skipped += 1
            continue

        dest = small_destination(path)
        try:
            build_preview_from_original(path, dest)
            created += 1
            print(f"OK {path.name} -> {dest.name}")
        except OSError as e:
            errors.append(f"{path.name}: {e}")

    print(f"Готово: создано/обновлено {created}, пропущено (_small исходники): {skipped}")
    if errors:
        print("Ошибки:", file=sys.stderr)
        for line in errors:
            print(f"  {line}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
