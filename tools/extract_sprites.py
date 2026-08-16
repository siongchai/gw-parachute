"""
Slice the supplied sprite asset sheet into individual game sprites.

Each sprite is cropped from spirite.PNG, downscaled to its logical game size
and snapped to the sheet's 4-colour palette so edges stay hard.

Run:  python3 tools/extract_sprites.py
Out:  public/sprites/<category>/<name>.png
"""
import os
from PIL import Image

SHEET = "spirite.PNG"
OUT = "public/sprites"

PALETTE = [
    (0, 0, 0),        # LCD black
    (0, 176, 80),     # palm green   #00B050
    (230, 126, 34),   # trunk orange #E67E22
    (61, 168, 255),   # water blue   #3DA8FF
]

ALPHA_CUT = 110

sheet = Image.open(SHEET).convert("RGBA")


def snap(rgb):
    best = None
    bestd = 1 << 30
    for p in PALETTE:
        d = (rgb[0] - p[0]) ** 2 + (rgb[1] - p[1]) ** 2 + (rgb[2] - p[2]) ** 2
        if d < bestd:
            bestd = d
            best = p
    return best


def extract(box, width=None, height=None, pad=0):
    x0, y0, x1, y1 = box
    crop = sheet.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    sw, sh = crop.size
    if width and not height:
        height = max(1, round(sh * width / sw))
    elif height and not width:
        width = max(1, round(sw * height / sh))
    small = crop.resize((width, height), Image.LANCZOS)
    out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sp = small.load()
    op = out.load()
    for y in range(height):
        for x in range(width):
            r, g, b, a = sp[x, y]
            if a < ALPHA_CUT:
                continue
            c = snap((r, g, b))
            op[x, y] = (c[0], c[1], c[2], 255)
    return out


def save(img, category, name):
    d = os.path.join(OUT, category)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, f"{name}.png")
    img.save(p)
    print(f"  {p} {img.size[0]}x{img.size[1]}")


# Crisp 5×7 caps for HUD labels (sheet crops blur to noise at LCD size).
_PIXEL_FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
    "M": ["10001", "11011", "10101", "10001", "10001", "10001", "10001"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
}


def pixel_label(text: str, letter_gap: int = 1) -> Image.Image:
    width = len(text) * 5 + max(0, len(text) - 1) * letter_gap
    out = Image.new("RGBA", (width, 7), (0, 0, 0, 0))
    px = out.load()
    x = 0
    for i, ch in enumerate(text):
        rows = _PIXEL_FONT[ch]
        for y, row in enumerate(rows):
            for cx, bit in enumerate(row):
                if bit == "1":
                    px[x + cx, y] = (0, 0, 0, 255)
        x += 5 + letter_gap
    return out


# ── Helicopter ──────────────────────────────────────────────────────────────
HELI = [
    (22, 68, 154, 147),
    (190, 68, 316, 147),
    (328, 64, 459, 148),
    (488, 73, 614, 147),
]

# ── Parachutist ─────────────────────────────────────────────────────────────
FALL = [
    (22, 229, 86, 314),
    (124, 229, 185, 307),
    (218, 228, 279, 305),
    (315, 226, 379, 305),
    (418, 226, 482, 305),
    (525, 225, 591, 303),
]
SPIN = [
    (22, 385, 93, 450),
    (128, 385, 169, 454),
    (222, 380, 277, 454),
    (323, 385, 375, 453),
    (409, 375, 461, 457),
    (514, 375, 579, 449),
]
PALM_HANG = [
    (26, 520, 98, 616),
    (138, 514, 200, 612),
    (235, 526, 304, 608),
    (334, 522, 403, 593),
    (444, 509, 516, 607),
    (557, 514, 622, 622),
]
SPLASH = [
    (1300, 325, 1382, 390),
    (1419, 325, 1499, 390),
    (1314, 408, 1385, 455),
    (1414, 408, 1500, 455),
]

# ── Boat ────────────────────────────────────────────────────────────────────
BOAT = [
    (35, 695, 143, 763),
    (178, 690, 282, 770),
    (314, 698, 431, 770),
    (462, 698, 574, 760),
]

# ── Sharks ──────────────────────────────────────────────────────────────────
FIN_UP = [(657, 65, 732, 106), (752, 68, 829, 106), (847, 67, 935, 106)]
FIN_DIP = [(664, 139, 734, 182), (746, 139, 820, 182), (839, 139, 927, 182)]
ATTACK = [(663, 208, 748, 267), (766, 216, 850, 267), (870, 196, 961, 265)]

# ── Environment ─────────────────────────────────────────────────────────────
PALM_LEFT = (650, 516, 815, 732)
PALM_RIGHT = (866, 514, 1016, 732)
WAVES = [
    (675, 339, 1164, 366),
    (675, 383, 1164, 411),
    (675, 414, 1164, 448),
]

# ── UI ──────────────────────────────────────────────────────────────────────
MISS_ICONS = [(997, 203, 1036, 246), (1051, 203, 1090, 246), (1106, 203, 1145, 246)]
LABEL_GAME_A = (990, 63, 1160, 91)
LABEL_GAME_B = (990, 95, 1160, 126)
LABEL_MISS = (997, 155, 1120, 192)

DIGITS = [
    (1198, 61, 1241, 126),
    (1287, 64, 1302, 123),
    (1323, 61, 1365, 126),
    (1394, 61, 1432, 126),
    (1462, 64, 1500, 123),
    (1197, 155, 1235, 219),
    (1262, 155, 1302, 219),
    (1334, 155, 1366, 216),
    (1390, 155, 1432, 219),
    (1461, 155, 1500, 219),
]

DIGIT_W, DIGIT_H = 11, 16


def digit_cell(box):
    """Scale by a shared factor and centre the glyph in a fixed cell."""
    x0, y0, x1, y1 = box
    src_h = 66.0
    factor = DIGIT_H / src_h
    w = max(1, round((x1 - x0) * factor))
    glyph = extract(box, width=w, height=DIGIT_H)
    cell = Image.new("RGBA", (DIGIT_W, DIGIT_H), (0, 0, 0, 0))
    cell.alpha_composite(glyph, ((DIGIT_W - w) // 2, 0))
    return cell


def main():
    print("helicopter")
    for i, b in enumerate(HELI):
        save(extract(b, width=40), "helicopter", f"heli_{i}")

    print("parachutist")
    for i, b in enumerate(FALL):
        save(extract(b, width=18), "parachutist", f"fall_{i}")
    for i, b in enumerate(SPIN):
        save(extract(b, height=20), "parachutist", f"spin_{i}")
    for i, b in enumerate(PALM_HANG):
        save(extract(b, width=20), "parachutist", f"hang_{i}")
    for i, b in enumerate(SPLASH):
        save(extract(b, width=22), "parachutist", f"splash_{i}")

    print("boat")
    for i, b in enumerate(BOAT):
        save(extract(b, width=40), "boat", f"boat_{i}")

    print("shark")
    for i, b in enumerate(FIN_UP):
        save(extract(b, width=22), "shark", f"fin_up_{i}")
    for i, b in enumerate(FIN_DIP):
        save(extract(b, width=22), "shark", f"fin_dip_{i}")
    for i, b in enumerate(ATTACK):
        save(extract(b, width=26), "shark", f"attack_{i}")

    print("palm")
    save(extract(PALM_LEFT, width=44), "palm", "palm_left")
    save(extract(PALM_RIGHT, width=40), "palm", "palm_right")

    print("water")
    for i, b in enumerate(WAVES):
        save(extract(b, width=147), "water", f"wave_{i}")

    print("ui")
    for i, b in enumerate(MISS_ICONS):
        save(extract(b, width=9), "ui", f"miss_icon_{i}")
    # Sheet crops for GAME A/B are too soft at LCD size — bake crisp 5x7 labels.
    save(pixel_label("GAME A"), "ui", "label_game_a")
    save(pixel_label("GAME B"), "ui", "label_game_b")
    save(extract(LABEL_MISS, height=8), "ui", "label_miss")

    print("digits")
    for i, b in enumerate(DIGITS):
        save(digit_cell(b), "digits", f"digit_{i}")


main()
