"""Report dominant colors and the LCD screen rectangle of the mockup."""
from collections import Counter
from PIL import Image

im = Image.open("mockup.PNG").convert("RGB")
W, H = im.size
px = im.load()

# Dominant colours in the main device area (top-left card)
c = Counter()
for y in range(20, 260, 2):
    for x in range(10, 420, 2):
        c[px[x, y]] += 1
print("main device dominant colours:")
for col, n in c.most_common(14):
    print(f"  #{col[0]:02x}{col[1]:02x}{col[2]:02x}  {n}")


def near(a, b, tol):
    return all(abs(a[i] - b[i]) <= tol for i in range(3))


# Find LCD rect: sage green-grey
target = None
for col, _ in c.most_common(14):
    r, g, b = col
    if 170 < r < 215 and 180 < g < 220 and 165 < b < 205 and g >= r:
        target = col
        break
print("lcd colour guess:", target)

if target:
    minx, miny, maxx, maxy = W, H, 0, 0
    for y in range(0, 300):
        for x in range(0, 440):
            if near(px[x, y], target, 12):
                minx = min(minx, x)
                maxx = max(maxx, x)
                miny = min(miny, y)
                maxy = max(maxy, y)
    w = maxx - minx
    h = maxy - miny
    print(f"lcd rect x={minx} y={miny} w={w} h={h} ratio={w/h:.3f}")

# Sample specific points for palette
points = {
    "outer_frame": (12, 150),
    "faceplate": (200, 30),
    "bezel_ring": (95, 60),
    "button_red": (57, 213),
    "screen_bg": (200, 150),
}
print("samples:")
for name, (x, y) in points.items():
    r, g, b = px[x, y]
    print(f"  {name:14s} #{r:02x}{g:02x}{b:02x}")
