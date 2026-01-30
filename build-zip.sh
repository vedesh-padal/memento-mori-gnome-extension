#!/bin/bash
# build-zip.sh - Build extension zip for GNOME Extensions website upload

set -e

EXT_UUID="memento-mori@vedeshpadal"
ZIP_FILE="$EXT_UUID.zip"

echo "📦 Building $ZIP_FILE..."

# Remove old zip if exists
rm -f "$ZIP_FILE"

# Create zip with only required files (including lib/ and ui/ for modular version)
zip -r "$ZIP_FILE" \
  extension.js \
  prefs.js \
  metadata.json \
  stylesheet.css \
  LICENSE \
  lib/*.js \
  ui/*.js \
  schemas/*.xml

echo ""
echo "✅ Created: $ZIP_FILE"
echo ""
echo "📤 Upload to: https://extensions.gnome.org/upload/"
