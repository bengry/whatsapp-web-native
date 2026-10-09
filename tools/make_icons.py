"""Render the extension icons (green squircle, white chat bubble, ⌘).

Run: uv run --no-project --with pillow tools/make_icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

CANVAS = 1024
SIZES = (16, 32, 48, 128)
TOP_GREEN = (91, 229, 132)
BOTTOM_GREEN = (29, 170, 97)
GLYPH_GREEN = (22, 150, 84)
FONTS = ("/System/Library/Fonts/SFNS.ttf", "/System/Library/Fonts/Apple Symbols.ttf")
OUT_DIR = Path(__file__).resolve().parent.parent / "icons"


def gradient() -> Image.Image:
    column = Image.new("RGB", (1, CANVAS))
    for y in range(CANVAS):
        t = y / (CANVAS - 1)
        column.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(TOP_GREEN, BOTTOM_GREEN)))
    return column.resize((CANVAS, CANVAS))


def squircle_mask() -> Image.Image:
    mask = Image.new("L", (CANVAS, CANVAS), 0)
    margin = round(CANVAS * 0.06)
    ImageDraw.Draw(mask).rounded_rectangle(
        (margin, margin, CANVAS - margin, CANVAS - margin), radius=round(CANVAS * 0.22), fill=255
    )
    return mask


def glyph_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONTS:
        font = ImageFont.truetype(path, size)
        if font.getmask("⌘").getbbox():
            return font
    raise SystemExit("No installed font has the ⌘ glyph")


def draw_bubble(draw: ImageDraw.ImageDraw) -> None:
    cx, cy, r = CANVAS * 0.5, CANVAS * 0.48, CANVAS * 0.29
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill="white")
    # Tail at the bottom left, like a chat bubble.
    draw.polygon(
        [(cx - r * 0.75, cy + r * 0.45), (cx - r * 1.05, cy + r * 1.2), (cx - r * 0.1, cy + r * 0.95)],
        fill="white",
    )
    font = glyph_font(round(CANVAS * 0.34))
    draw.text((cx, cy), "⌘", font=font, fill=GLYPH_GREEN, anchor="mm")


def render() -> Image.Image:
    icon = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    icon.paste(gradient(), mask=squircle_mask())
    draw_bubble(ImageDraw.Draw(icon))
    return icon


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    icon = render()
    for size in SIZES:
        icon.resize((size, size), Image.LANCZOS).save(OUT_DIR / f"icon{size}.png")
        print(f"wrote icons/icon{size}.png")


if __name__ == "__main__":
    main()
