# Generate crisp transparent Android launcher icons from the approved SAY AI emblem.
from pathlib import Path
from PIL import Image
import cairosvg
from io import BytesIO

root = Path("android/app/src/main/res")
source = Path("resources/say-ai-logo.svg")
png_bytes = cairosvg.svg2png(url=str(source), output_width=1024, output_height=1024)
image = Image.open(BytesIO(png_bytes)).convert("RGBA")
image.save(Path("resources/say-ai-logo.png"), format="PNG", optimize=True)

sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
for folder, size in sizes.items():
    target = root / folder
    target.mkdir(parents=True, exist_ok=True)
    icon = image.resize((size, size), Image.Resampling.LANCZOS)
    icon.save(target / "ic_launcher.png", format="PNG", optimize=True)
    icon.save(target / "ic_launcher_round.png", format="PNG", optimize=True)

adaptive = root / "mipmap-anydpi-v26"
for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
    path = adaptive / name
    if path.exists():
        path.unlink()

print("Installed the approved SAY AI emblem with a transparent background.")
