"""
Slice `helicopter 0.png` … `helicopter 3.png` into aligned game sprites.

All frames share one crop box so only the rotors animate.
Outputs LCD (40×26) and hires (120×78) versions.

Run:  python3 tools/extract_helicopter.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/sprites/helicopter")
LCD_W, LCD_H = 40, 26
HIRES_W, HIRES_H = 120, 78
SUPERSAMPLE = 4
INK_CUT = 140
FRAME_SOURCES = [os.path.join(ROOT, f"helicopter {i}.png") for i in range(4)]


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


def union_bbox(boxes):
    box_list = list(boxes)
    if not box_list:
        raise ValueError("No content boxes to union")
    return (
        min(b[0] for b in box_list),
        min(b[1] for b in box_list),
        max(b[2] for b in box_list),
        max(b[3] for b in box_list),
    )


def downsample_lcd(crop, target_w, target_h):
    """Fixed-size LCD silhouette for fallback sprites."""
    hi_w = target_w * SUPERSAMPLE
    hi_h = target_h * SUPERSAMPLE
    hi = crop.resize((hi_w, hi_h), Image.LANCZOS)
    hp = hi.load()

    out = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    op = out.load()
    for sy in range(target_h):
        for sx in range(target_w):
            for yy in range(sy * SUPERSAMPLE, min(hi_h, (sy + 1) * SUPERSAMPLE)):
                for xx in range(sx * SUPERSAMPLE, min(hi_w, (sx + 1) * SUPERSAMPLE)):
                    r, g, b, a = hp[xx, yy]
                    if a > 80 and lum(r, g, b) < INK_CUT:
                        op[sx, sy] = (0, 0, 0, 255)
                        break
                else:
                    continue
                break
    return out


def downsample_hires(crop, target_w, target_h):
    """Smooth anti-aliased silhouette — stays sharp when scaled down."""
    hi = crop.resize((target_w, target_h), Image.LANCZOS)
    hp = hi.load()
    out = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    op = out.load()
    for y in range(target_h):
        for x in range(target_w):
            r, g, b, a = hp[x, y]
            if a < 40:
                continue
            l = lum(r, g, b)
            if l >= INK_CUT:
                continue
            ink = min(255, int(a * (INK_CUT - l) / INK_CUT))
            if ink > 8:
                op[x, y] = (0, 0, 0, ink)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)

    sources = []
    for src in FRAME_SOURCES:
        if not os.path.isfile(src):
            raise FileNotFoundError(f"Missing source: {src}")
        sources.append(Image.open(src).convert("RGBA"))

    crop_box = union_bbox(content_bbox(im) for im in sources)
    minx, miny, maxx, maxy = crop_box
    print(
        f"helicopter frames (shared crop {maxx - minx + 1}×{maxy - miny + 1})"
    )

    for i, (src_path, im) in enumerate(zip(FRAME_SOURCES, sources)):
        crop = im.crop((minx, miny, maxx + 1, maxy + 1))
        lcd = downsample_lcd(crop, LCD_W, LCD_H)
        hires = downsample_hires(crop, HIRES_W, HIRES_H)
        lcd.save(os.path.join(OUT, f"heli_{i}.png"))
        hires.save(os.path.join(OUT, f"heli_hires_{i}.png"))
        print(
            f"  heli_{i}.png {lcd.width}x{lcd.height}, "
            f"heli_hires_{i}.png {hires.width}x{hires.height} "
            f"(from {os.path.basename(src_path)})"
        )


if __name__ == "__main__":
    main()
