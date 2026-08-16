"""
Slice `parachute path asset.png` into per-step drop-path sprites.

The asset holds three columns — left (7 steps), centre (6), right (5).
Each cell becomes one game sprite, scaled by a shared factor so the
step-to-step proportions stay true to the reference art.

Run:  python3 tools/extract_path_sprites.py
Out:  public/sprites/path/<lane>_<step>.png
"""
import os
from PIL import Image

ASSET = "parachute path asset.png"
OUT = "public/sprites/path"
SCALE = 0.36  # 56px reference cell -> ~20px game sprite
ALPHA_CUT = 110

# Cell boxes measured from the asset (x0, y0, x1, y1), top-to-bottom per column.
CELLS = {
    "pathL": [
        (55, 34, 82, 63),
        (51, 86, 90, 119),
        (37, 140, 80, 191),
        (31, 212, 64, 273),
        (25, 286, 68, 339),
        (19, 358, 70, 411),
        (27, 432, 82, 487),
    ],
    "pathC": [
        (125, 36, 152, 65),
        (115, 84, 156, 115),
        (109, 136, 144, 201),
        (97, 210, 142, 265),
        (103, 282, 150, 339),
        (101, 356, 156, 413),
    ],
    "pathR": [
        (197, 34, 222, 61),
        (193, 72, 226, 119),
        (181, 138, 226, 189),
        (177, 206, 226, 261),
        (183, 278, 238, 333),
    ],
}


def extract(sheet, box):
    crop = sheet.crop(box).convert("L")
    w = max(1, round(crop.width * SCALE))
    h = max(1, round(crop.height * SCALE))
    small = crop.resize((w, h), Image.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sp = small.load()
    op = out.load()
    for y in range(h):
        for x in range(w):
            if sp[x, y] < 255 - ALPHA_CUT:
                op[x, y] = (0, 0, 0, 255)
    return out


def main():
    sheet = Image.open(ASSET)
    os.makedirs(OUT, exist_ok=True)
    for prefix, boxes in CELLS.items():
        for i, box in enumerate(boxes):
            img = extract(sheet, box)
            path = os.path.join(OUT, f"{prefix}_{i}.png")
            img.save(path)
            print(f"  {path} {img.width}x{img.height}")


if __name__ == "__main__":
    main()
