"""Find sprite bounding boxes inside a region of the sheet via gap projection."""
import sys
from PIL import Image

path = "spirite.PNG"
im = Image.open(path).convert("RGBA")
W, H = im.size
px = im.load()


def is_content(x, y):
    r, g, b, a = px[x, y]
    if a < 100:
        return False
    return not (r > 230 and g > 230 and b > 230)


def bbox(x0, y0, x1, y1):
    minx, miny, maxx, maxy = x1, y1, x0, y0
    found = False
    for y in range(y0, y1):
        for x in range(x0, x1):
            if is_content(x, y):
                found = True
                if x < minx:
                    minx = x
                if x > maxx:
                    maxx = x
                if y < miny:
                    miny = y
                if y > maxy:
                    maxy = y
    return (minx, miny, maxx + 1, maxy + 1) if found else None


def split_columns(x0, y0, x1, y1, gap=10):
    colhas = []
    for x in range(x0, x1):
        has = any(is_content(x, y) for y in range(y0, y1))
        colhas.append(has)
    groups = []
    start = None
    run = 0
    for i, h in enumerate(colhas):
        if h:
            if start is None:
                start = i
            run = 0
        else:
            if start is not None:
                run += 1
                if run >= gap:
                    groups.append((x0 + start, x0 + i - run + 1))
                    start = None
                    run = 0
    if start is not None:
        groups.append((x0 + start, x1))
    return groups


def split_rows(x0, y0, x1, y1, gap=10):
    rowhas = []
    for y in range(y0, y1):
        rowhas.append(any(is_content(x, y) for x in range(x0, x1)))
    groups = []
    start = None
    run = 0
    for i, h in enumerate(rowhas):
        if h:
            if start is None:
                start = i
            run = 0
        else:
            if start is not None:
                run += 1
                if run >= gap:
                    groups.append((y0 + start, y0 + i - run + 1))
                    start = None
                    run = 0
    if start is not None:
        groups.append((y0 + start, y1))
    return groups


def main():
    name = sys.argv[1]
    x0, y0, x1, y1 = (int(v) for v in sys.argv[2:6])
    gap = int(sys.argv[6]) if len(sys.argv) > 6 else 10
    mode = sys.argv[7] if len(sys.argv) > 7 else "cols"
    print(f"== {name} region=({x0},{y0},{x1},{y1}) gap={gap} mode={mode}")
    if mode == "rows":
        for gy0, gy1 in split_rows(x0, y0, x1, y1, gap):
            bb = bbox(x0, gy0, x1, gy1)
            if bb:
                print(f"  {bb}  w={bb[2]-bb[0]} h={bb[3]-bb[1]}")
    else:
        for gx0, gx1 in split_columns(x0, y0, x1, y1, gap):
            bb = bbox(gx0, y0, gx1, y1)
            if bb:
                print(f"  {bb}  w={bb[2]-bb[0]} h={bb[3]-bb[1]}")


main()
