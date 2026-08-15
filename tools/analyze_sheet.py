"""Coarse occupancy map of the sprite sheet, used to locate sections."""
import sys
from PIL import Image

path = sys.argv[1] if len(sys.argv) > 1 else "spirite.PNG"
im = Image.open(path).convert("RGBA")
W, H = im.size
px = im.load()

CELL = 16
cols = W // CELL
rows = H // CELL

print(f"size={W}x{H} cell={CELL} grid={cols}x{rows}")
header = "    " + "".join(str((c // 10) % 10) if c % 5 == 0 else " " for c in range(cols))
print(header)
for r in range(rows):
    line = []
    for c in range(cols):
        black = colored = 0
        for y in range(r * CELL, min((r + 1) * CELL, H), 2):
            for x in range(c * CELL, min((c + 1) * CELL, W), 2):
                pr, pg, pb, pa = px[x, y]
                if pa < 100:
                    continue
                if pr < 90 and pg < 90 and pb < 90:
                    black += 1
                elif not (pr > 225 and pg > 225 and pb > 225):
                    colored += 1
        if black > 6:
            line.append("#")
        elif colored > 6:
            line.append("o")
        elif black + colored > 0:
            line.append(".")
        else:
            line.append(" ")
    print(f"{r:3d} " + "".join(line))
