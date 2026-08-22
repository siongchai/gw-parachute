"""
Convert `splash.png` (six horizontal frames) into smooth miss-splash sprites.

Positions traced from LCD mockup.jpg — bottom water row under the boat,
left → right (man splash → shark fin → shark lunge near MISS).

Run:  python3 tools/extract_splash.py
"""
import json
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "splash.png")
MOCKUP = os.path.join(ROOT, "LCD mockup.jpg")
OUT = os.path.join(ROOT, "public/sprites/splash")
LCD_W = 22
HIRES_SCALE = 3
INK_CUT = 140
SUPERSAMPLE = 4
GAME_W = 164
GAME_H = 108
LANE_CX = [48, 82, 116]
LCD_W = 22
TOP_Y = 67
BOTTOM_Y = 78


def lane_x(idx):
    return round(LANE_CX[idx] - LCD_W / 2)


# Spatial slots from LCD mockup (sprite index = column in splash.png).
# Runtime animation plays right→left on top, then left→right on bottom.
MOCKUP_PATH = [
    {"lane": 2, "y": TOP_Y, "label": "splash 1 top-right"},
    {"lane": 1, "y": TOP_Y, "label": "splash 2 top-center"},
    {"lane": 0, "y": TOP_Y, "label": "splash 3 top-left"},
    {"lane": 0, "y": BOTTOM_Y, "label": "splash 4 bottom-left"},
    {"lane": 1, "y": BOTTOM_Y, "label": "splash 5 bottom-center"},
    {"lane": 2, "y": BOTTOM_Y, "label": "splash 6 bottom-right"},
]


def lum(r, g, b):
    return 0.299 * r + 0.587 * g + 0.114 * b


def near(a, b, tol=15):
    return all(abs(a[i] - b[i]) <= tol for i in range(3))


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


def measure_mockup_path():
    """Confirm lane row Y values from LCD mockup.jpg; keep lane columns fixed."""
    if not os.path.isfile(MOCKUP):
        return MOCKUP_PATH

    im = Image.open(MOCKUP).convert("RGB")
    px = im.load()
    w, h = im.size
    lcd_col = (177, 188, 192)
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if near(px[x, y], lcd_col, 15):
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    lcd_w = maxx - minx + 1
    lcd_h = maxy - miny + 1
    sy = GAME_H / lcd_h

    def row_top(y_game_lo, y_game_hi):
        y0 = miny + int(y_game_lo / GAME_H * lcd_h)
        y1 = miny + int(y_game_hi / GAME_H * lcd_h)
        tops = []
        for lane in LANE_CX:
            mx = minx + int(lane / GAME_W * lcd_w)
            best = None
            for x in range(mx - 15, mx + 16):
                for y in range(y0, y1):
                    if lum(*px[x, y]) < 85:
                        gy = (y - miny) * sy
                        if best is None or gy < best:
                            best = gy
            tops.append(round(best) if best is not None else y_game_lo)
        return tops

    top_tops = row_top(67, 74)
    bot_tops = row_top(74, 82)
    top_y = min(top_tops) if top_tops else TOP_Y
    bot_y = min(bot_tops) if bot_tops else BOTTOM_Y

    return [
        {"lane": 2, "y": top_y, "label": "splash 1 top-right"},
        {"lane": 1, "y": top_y, "label": "splash 2 top-center"},
        {"lane": 0, "y": top_y, "label": "splash 3 top-left"},
        {"lane": 0, "y": bot_y, "label": "splash 4 bottom-left"},
        {"lane": 1, "y": bot_y, "label": "splash 5 bottom-center"},
        {"lane": 2, "y": bot_y, "label": "splash 6 bottom-right"},
    ]


def downsample_lcd(crop, target_w, target_h):
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
    if not os.path.isfile(SRC):
        raise FileNotFoundError(f"Missing source: {SRC}")

    os.makedirs(OUT, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    col_w = sheet.width // 6
    path = measure_mockup_path()
    meta = []

    print("miss splash (6 frames, 2-lane LCD mockup grid)")
    for i in range(6):
        col = sheet.crop((i * col_w, 0, (i + 1) * col_w, sheet.height))
        box = content_bbox(col)
        crop = col.crop((box[0], box[1], box[2] + 1, box[3] + 1))
        cw, ch = crop.size
        lcd_h = max(1, round(ch * LCD_W / cw))
        hires_w, hires_h = LCD_W * HIRES_SCALE, lcd_h * HIRES_SCALE

        lcd = downsample_lcd(crop, LCD_W, lcd_h)
        hires = downsample_hires(crop, hires_w, hires_h)
        lcd.save(os.path.join(OUT, f"splash_{i}.png"))
        hires.save(os.path.join(OUT, f"splash_hires_{i}.png"))

        slot = path[i]
        lane = slot["lane"]
        y = slot["y"]
        x = lane_x(lane)
        entry = {
            "frame": i,
            "w": LCD_W,
            "h": lcd_h,
            "x": x,
            "y": y,
            "lane": lane,
            "label": slot["label"],
        }
        meta.append(entry)
        print(f"  splash_{i}.png {LCD_W}×{lcd_h} @ ({x},{y}) {slot['label']}")

    meta_path = os.path.join(OUT, "splash_meta.json")
    with open(meta_path, "w", encoding="utf-8") as fh:
        json.dump({"frames": meta}, fh, indent=2)
    print(f"  splash_meta.json")


if __name__ == "__main__":
    main()
