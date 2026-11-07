from pathlib import Path
import io
import cairosvg
from PIL import Image

root = Path("android/app/src/main/res")
svg = Path("resources/say-ai-logo.svg").read_bytes()
png = cairosvg.svg2png(bytestring=svg, output_width=1024, output_height=1024)
image = Image.open(io.BytesIO(png)).convert("RGBA")

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

# Use the generated density-specific bitmap icons instead of Capacitor's placeholder adaptive icon.
adaptive = root / "mipmap-anydpi-v26"
for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
    path = adaptive / name
    if path.exists():
        path.unlink()

print("Installed the approved SAY AI neon swirl launcher icon.")
