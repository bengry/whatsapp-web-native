#!/usr/bin/env bash
# Render the Chrome Web Store images from store/screenshots/src/*.html.
# Uses headless Chrome with a throwaway profile, so your own profile is never touched.
# Run: tools/render_store_images.sh
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/store/screenshots/src"
OUT="$ROOT/store/screenshots"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT

render() {
  local page="$1" size="$2"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --user-data-dir="$PROFILE" --window-size="$size" \
    --screenshot="$OUT/${page%.html}.png" "file://$SRC/$page" 2>/dev/null
  echo "wrote store/screenshots/${page%.html}.png ($size)"
}

for page in 1-hero.html 2-rtl.html 3-shortcuts.html 4-clean.html 5-failsafe.html; do
  render "$page" 1280,800
done
render promo-tile.html 440,280
