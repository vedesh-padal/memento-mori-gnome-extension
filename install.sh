#!/bin/bash
# install.sh - Install Memento Mori extension locally

set -e

EXT_UUID="memento-mori@vedeshpadal"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"

echo "📦 Installing Memento Mori extension..."

# Create extension directory
mkdir -p "$EXT_DIR/schemas" "$EXT_DIR/lib" "$EXT_DIR/ui"

# Copy extension files
cp extension.js prefs.js metadata.json stylesheet.css "$EXT_DIR/"
cp -r lib/*.js "$EXT_DIR/lib/"
cp -r ui/*.js "$EXT_DIR/ui/"
cp -r schemas/*.xml "$EXT_DIR/schemas/"

# Copy LICENSE if exists
[ -f LICENSE ] && cp LICENSE "$EXT_DIR/"

# Compile schemas
echo "🔧 Compiling schemas..."
glib-compile-schemas "$EXT_DIR/schemas/"

echo ""
echo "✅ Installed to: $EXT_DIR"
echo ""
echo "🔄 Restart GNOME Shell to activate:"
echo "   • X11: Press Alt+F2, type 'r', press Enter"
echo "   • Wayland: Log out and log back in"
echo ""
echo "⚙️  Enable the extension (choose one):"
echo "   • Command: gnome-extensions enable $EXT_UUID"
echo "   • GUI: Open 'Extension Manager' app and enable 'Memento Mori'"
echo ""
echo "📦 Get Extension Manager: https://flathub.org/apps/com.mattjakeman.ExtensionManager"
