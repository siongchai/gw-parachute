"""Build app/PWA icons from the extracted parachutist sprite."""
from PIL import Image

SRC = "public/sprites/parachutist/fall_0.png"
BG = (178, 190, 168, 255)  # LCD sage


def make(size, out, pad_ratio=0.16):
    base = Image.new("RGBA", (size, size), BG)
    sprite = Image.open(SRC).convert("RGBA")
    target = int(size * (1 - pad_ratio * 2))
    scale = max(1, target // max(sprite.width, sprite.height))
    sprite = sprite.resize((sprite.width * scale, sprite.height * scale), Image.NEAREST)
    base.alpha_composite(
        sprite,
        ((size - sprite.width) // 2, (size - sprite.height) // 2),
    )
    base.save(out)
    print(out, base.size)


make(192, "public/icon-192.png")
make(512, "public/icon-512.png")
make(180, "src/app/apple-icon.png")
make(64, "src/app/icon.png", pad_ratio=0.08)
