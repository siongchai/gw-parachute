"""Crop a region of the sheet to /tmp for inspection."""
import sys
from PIL import Image

src, out, x0, y0, x1, y1 = sys.argv[1], sys.argv[2], *[int(v) for v in sys.argv[3:7]]
scale = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
im = Image.open(src).convert("RGBA")
crop = im.crop((x0, y0, x1, y1))
if scale != 1.0:
    crop = crop.resize(
        (max(1, int(crop.width * scale)), max(1, int(crop.height * scale))),
        Image.NEAREST,
    )
bg = Image.new("RGBA", crop.size, (255, 255, 255, 255))
bg.alpha_composite(crop)
bg.convert("RGB").save(out)
print(out, bg.size)
