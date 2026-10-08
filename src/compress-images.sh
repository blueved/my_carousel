#!/usr/bin/env bash
#
# compress-images.sh - batch resize + compress JPG/PNG images, optionally make WebP copies.
#
# Usage:
#   chmod +x compress-images.sh
#   ./compress-images.sh [input_dir] [output_dir]
#
# Defaults: input_dir = current folder, output_dir = ./compressed
# Originals are NEVER modified. Results go to output_dir, keeping subfolder structure.
#
# Optional settings (override via environment variables):
#   MAX_WIDTH=1600      shrink images wider than this (never enlarges)
#   JPEG_QUALITY=80     JPEG max quality (1-100)
#   PNG_QUALITY=65-85   pngquant quality range
#   WEBP_QUALITY=80     WebP quality (1-100)
#   MAKE_WEBP=yes       also create .webp versions (yes/no)
#
# Examples:
#   ./compress-images.sh ~/Pictures/site-images
#   MAX_WIDTH=1200 JPEG_QUALITY=75 ./compress-images.sh ./photos ./photos-small
#   MAKE_WEBP=no ./compress-images.sh

set -euo pipefail

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./compressed}"
MAX_WIDTH="${MAX_WIDTH:-1600}"
JPEG_QUALITY="${JPEG_QUALITY:-80}"
PNG_QUALITY="${PNG_QUALITY:-65-85}"
WEBP_QUALITY="${WEBP_QUALITY:-80}"
MAKE_WEBP="${MAKE_WEBP:-yes}"

# --- Check dependencies ------------------------------------------------------
missing=()
for cmd in jpegoptim pngquant optipng mogrify; do
  command -v "$cmd" >/dev/null 2>&1 || missing+=("$cmd")
done
if [[ "$MAKE_WEBP" == "yes" ]]; then
  command -v cwebp >/dev/null 2>&1 || missing+=("cwebp")
fi
if (( ${#missing[@]} > 0 )); then
  echo "Missing tools: ${missing[*]}"
  echo "Install them with:"
  echo "  sudo apt update && sudo apt install jpegoptim optipng pngquant webp imagemagick"
  exit 1
fi

if [[ ! -d "$INPUT_DIR" ]]; then
  echo "Input folder not found: $INPUT_DIR"
  exit 1
fi

INPUT_DIR="$(realpath "$INPUT_DIR")"
OUTPUT_DIR="$(realpath -m "$OUTPUT_DIR")"

if [[ "$INPUT_DIR" == "$OUTPUT_DIR" ]]; then
  echo "Output folder must be different from the input folder."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Input:   $INPUT_DIR"
echo "Output:  $OUTPUT_DIR"
echo "Settings: max width ${MAX_WIDTH}px, JPEG q${JPEG_QUALITY}, PNG q${PNG_QUALITY}, WebP: ${MAKE_WEBP} (q${WEBP_QUALITY})"
echo

count=0
total_before=0
total_after=0

human() { numfmt --to=iec --suffix=B "$1" 2>/dev/null || echo "$1 bytes"; }

# --- Process images ----------------------------------------------------------
# -prune skips the output folder in case it sits inside the input folder
while IFS= read -r -d '' src; do
  rel="${src#"$INPUT_DIR"/}"
  dst="$OUTPUT_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  cp -- "$src" "$dst"

  ext="${dst##*.}"
  ext="${ext,,}"

  # 1) Resize (only if wider than MAX_WIDTH) and fix orientation
  mogrify -auto-orient -resize "${MAX_WIDTH}x>" "$dst"

  # 2) Compress
  case "$ext" in
    jpg|jpeg)
      jpegoptim --max="$JPEG_QUALITY" --strip-all --quiet "$dst"
      ;;
    png)
      # pngquant exits non-zero if it can't hit the quality target; that's fine
      pngquant --quality="$PNG_QUALITY" --force --skip-if-larger --ext .png "$dst" || true
      optipng -o2 -quiet "$dst"
      ;;
  esac

  # 3) Optional WebP copy (made from the already-resized file)
  if [[ "$MAKE_WEBP" == "yes" ]]; then
    cwebp -quiet -q "$WEBP_QUALITY" "$dst" -o "${dst%.*}.webp"
  fi

  before=$(stat -c%s "$src")
  after=$(stat -c%s "$dst")
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  count=$((count + 1))

  printf '%-50s %8s -> %8s\n' "${rel:0:50}" "$(human "$before")" "$(human "$after")"
done < <(find "$INPUT_DIR" -path "$OUTPUT_DIR" -prune -o -type f \
          \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)

# --- Summary -----------------------------------------------------------------
echo
if (( count == 0 )); then
  echo "No JPG/PNG images found in $INPUT_DIR"
  exit 0
fi

saved=$((total_before - total_after))
pct=$(( total_before > 0 ? saved * 100 / total_before : 0 ))
echo "Done: $count image(s)"
echo "Before: $(human "$total_before")   After: $(human "$total_after")   Saved: $(human "$saved") (${pct}%)"
if [[ "$MAKE_WEBP" == "yes" ]]; then
  echo "WebP versions were also created next to each compressed file."
fi