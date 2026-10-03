#!/bin/bash
# install.sh - Install Memento Mori extension locally

set -e

EXT_UUID="memento-mori@vedeshpadal"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$EXT_UUID"

echo "📦 Installing Memento Mori extension..."

# Fresh install: drop stale files and any pending store update that would overwrite this build on next login
rm -rf "$EXT_DIR" "$HOME/.local/share/gnome-shell/extension-updates/$EXT_UUID"
mkdir -p "$EXT_DIR/schemas" "$EXT_DIR/lib"

cp extension.js prefs.js metadata.json stylesheet.css "$EXT_DIR/"
cp -r lib/*.js "$EXT_DIR/lib/"
cp -r schemas/*.xml "$EXT_DIR/schemas/"

[ -f LICENSE ] && cp LICENSE "$EXT_DIR/"

echo "🔧 Compiling schemas..."
glib-compile-schemas "$EXT_DIR/schemas/"

echo ""
echo "✅ Installed to: $EXT_DIR"
echo ""
echo "==> Restart GNOME Shell to activate:"
echo "   - X11: Press Alt+F2, type 'r', press Enter"
echo "   - Wayland: Log out and log back in"
echo ""
echo "==> Enable the extension (choose one):"
echo "   - Command: gnome-extensions enable $EXT_UUID"
echo "   - GUI: Open 'Extension Manager' app and enable 'Memento Mori'"
echo ""
echo "==> Get Extension Manager @ https://github.com/mjakeman/extension-manager OR https://flathub.org/apps/com.mattjakeman.ExtensionManager"
