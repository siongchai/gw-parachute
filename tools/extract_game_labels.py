"""
Convert `game A.png` and `game B.png` into smooth hires mode labels.

Outputs label_game_a_hires.png and label_game_b_hires.png (69×15)
— scaled at draw time to 23×5 LCD size.

Run:  python3 tools/extract_game_labels.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/sprites/ui")
LCD_W, LCD_H = 23, 5
HIRES_W, HIRES_H = LCD_W * 3, LCD_H * 3
INK_CUT = 140
# Pure black LCD ink
INK_RGB = (0, 0, 0)
INK_BOOST = 1.45

SOURCES = [
    ("a", os.path.join(ROOT, "game A.png"), "label_game_a_hires.png"),
    ("b", os.path.join(ROOT, "game B.png"), "label_game_b_hires.png"),
]


def lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def content_bbox(im):
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 80 and lum(r, g, b) < 180:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
                found = True
    if not found:
        return 0, 0, w, h
    return minx, miny, maxx, maxy


def downsample_hires(crop, target_w, target_h):
    """Smooth anti-aliased silhouette — stays sharp when scaled down."""
    src_w, src_h = crop.size
    scale = min(target_w / src_w, target_h / src_h)
    fit_w = max(1, round(src_w * scale))
    fit_h = max(1, round(src_h * scale))
    hi = crop.resize((fit_w, fit_h), Image.LANCZOS)
    hp = hi.load()

    out = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    ox = (target_w - fit_w) // 2
    oy = (target_h - fit_h) // 2
    op = out.load()

    for y in range(fit_h):
        for x in range(fit_w):
            r, g, b, a = hp[x, y]
            if a < 40:
                continue
            l = lum(r, g, b)
            if l >= INK_CUT:
                continue
            ink = min(255, int(a * (INK_CUT - l) / INK_CUT * INK_BOOST) + 20)
            if ink > 4:
                op[ox + x, oy + y] = (*INK_RGB, ink)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)

    for label, src_path, out_name in SOURCES:
        if not os.path.isfile(src_path):
            raise FileNotFoundError(f"Missing source: {src_path}")

        sheet = Image.open(src_path).convert("RGBA")
        box = content_bbox(sheet)
        crop = sheet.crop((box[0], box[1], box[2] + 1, box[3] + 1))
        hires = downsample_hires(crop, HIRES_W, HIRES_H)
        hires.save(os.path.join(OUT, out_name))
        print(
            f"  {out_name} {hires.width}×{hires.height} "
            f"(LCD {LCD_W}×{LCD_H}, content {crop.width}×{crop.height})"
        )

        ref = os.path.join(OUT, f"game_{label}_source.png")
        if not os.path.isfile(ref):
            sheet.save(ref)
            print(f"  game_{label}_source.png (reference copy)")


if __name__ == "__main__":
    print("game labels")
    main()
