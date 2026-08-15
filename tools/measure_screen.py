"""Measure sprite sizes/positions inside the mockup's LCD screen."""
from PIL import Image

im = Image.open("mockup.PNG").convert("RGB")
px = im.load()

X0, Y0, X1, Y1 = 228, 138, 556, 422
W, H = X1 - X0, Y1 - Y0
print(f"screen box {X0},{Y0} -> {X1},{Y1}  {W}x{H} ratio={W/H:.3f}")


def kind(p):
    r, g, b = p
    if r < 90 and g < 90 and b < 90:
        return "k"
    if b > 150 and b > r + 40 and g > r:
        return "w"  # water blue
    if g > 110 and g > r + 30 and g > b + 30:
        return "g"  # palm green
    if r > 150 and 70 < g < 160 and b < 90:
        return "o"  # trunk orange
    return "."


# ASCII map of the screen at 4px cells
CELL = 4
print("   " + "".join(str((c // 10) % 10) if c % 5 == 0 else " " for c in range(W // CELL)))
for r in range(H // CELL):
    line = []
    for c in range(W // CELL):
        counts = {}
        for y in range(Y0 + r * CELL, min(Y0 + (r + 1) * CELL, Y1)):
            for x in range(X0 + c * CELL, min(X0 + (c + 1) * CELL, X1)):
                k = kind(px[x, y])
                counts[k] = counts.get(k, 0) + 1
        best = max(counts, key=lambda k: (counts[k] if k != "." else 0))
        line.append(best if counts.get(best, 0) >= 3 and best != "." else " ")
    print(f"{r:3d}" + "".join(line))
