"""
Convert `miss.png` into a smooth hires HUD miss label.

Outputs label_miss_hires.png (81×24) — scaled at draw time to 27×8 LCD size.

Run:  python3 tools/extract_miss_label.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "miss.png")
OUT = os.path.join(ROOT, "public/sprites/ui")
LCD_W, LCD_H = 27, 8
HIRES_W, HIRES_H = LCD_W * 3, LCD_H * 3
INK_CUT = 140


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
            ink = min(255, int(a * (INK_CUT - l) / INK_CUT))
            if ink > 8:
                op[ox + x, oy + y] = (0, 0, 0, ink)
    return out


def main():
    if not os.path.isfile(SRC):
        raise FileNotFoundError(f"Missing source: {SRC}")

    os.makedirs(OUT, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    box = content_bbox(sheet)
    crop = sheet.crop((box[0], box[1], box[2] + 1, box[3] + 1))
    hires = downsample_hires(crop, HIRES_W, HIRES_H)
    out_path = os.path.join(OUT, "label_miss_hires.png")
    hires.save(out_path)
    print(
        f"  label_miss_hires.png {hires.width}×{hires.height} "
        f"(LCD {LCD_W}×{LCD_H}, content {crop.width}×{crop.height})"
    )

    ref = os.path.join(OUT, "miss_label_source.png")
    if not os.path.isfile(ref):
        sheet.save(ref)
        print("  miss_label_source.png (reference copy)")


if __name__ == "__main__":
    print("miss label")
    main()
