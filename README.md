# ⏳ Memento Mori - GNOME Shell Extension

> *"Remember that you must die"* ~ Memento Mori

A GNOME Shell extension that displays how much of your **day**, **month**, **year**, and **life** has passed in the top panel. A gentle reminder to make the most of your time.

![GNOME 48](https://img.shields.io/badge/GNOME-45--48-blue?logo=gnome)
![License](https://img.shields.io/badge/License-GPL--3.0--or--later-green)

## 📸 **Preview**

![memento-extension-demo](https://github.com/user-attachments/assets/373c39c2-fe21-4d54-9b18-8ecb5bad79e4)


The extension shows:
- **𝗗** - Day progress (percentage of current day elapsed)
- **𝗠** - Month progress (percentage of current month elapsed)
- **𝗬** - Year progress (percentage of current year elapsed)
- **𝗟** - Life progress (percentage of expected lifespan elapsed)

## 🚀 Installation

### Method 1: Manual Installation (Recommended for now)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vedesh-padal/memento-mori-gnome-extension.git
   ```

2. **Copy to GNOME extensions directory:**
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/memento-mori@vedeshpadal
   cp -r memento-mori-gnome-extension/* ~/.local/share/gnome-shell/extensions/memento-mori@vedeshpadal/
   ```

3. **Restart GNOME Shell:**
   - On **X11**: Press `Alt + F2`, type `r`, and press Enter
   - On **Wayland**: Log out and log back in

4. **Enable the extension:**
   - Using GNOME Extensions app or Extension Manager
   - Or via terminal:
     ```bash
     gnome-extensions enable memento-mori@vedeshpadal
     ```

### NOTE

Wating for approval of this extension on [extensions.gnome.org](https://extensions.gnome.org), will add those steps once approved 🙂

## ⚙️ Configuration

After installing the extension, configure it through **GNOME Extensions** or **Extension Manager**:

1. Open **GNOME Extensions** app or **Extension Manager**
2. Find **Memento Mori** in the list
3. Click the ⚙️ (settings/gear) icon
4. Set your **Birth Year** and **Life Expectancy**

Until you set your birth year, the extension will display `⏳ memento mori.` and hovering over it will prompt you to configure the settings.

## ⚠️ Important Caveats

### GNOME Version Compatibility

| GNOME Version | Compatibility |
|---------------|---------------|
| **45 - 48** | ✅ Fully supported |
| **< 45** | ❌ Not supported (uses legacy import system) |

This extension uses the modern ES Module syntax and Extension class API introduced in GNOME 45. It is **not compatible** with GNOME 44 and below.

### Check Your GNOME Version

```bash
gnome-shell --version
```

## ️ Project Structure

```
memento-mori@vedeshpadal/
├── extension.js      # Main extension logic
├── prefs.js          # Preferences/settings UI
├── metadata.json     # Extension metadata
├── stylesheet.css    # Styling
├── schemas/          # GSettings schema
│   └── org.gnome.shell.extensions.memento-mori.gschema.xml
└── README.md         # This file
```

## 🛠️ Development

### Testing Changes

1. Make your changes to `extension.js`
2. Restart GNOME Shell:
   - X11: `Alt + F2` → `r` → Enter
   - Wayland: Log out and log back in
3. Check for errors:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell
   ```

### Debugging

View extension logs:
```bash
journalctl -f -o cat GNOME_SHELL_EXTENSION_UUID=memento-mori@vedeshpadal
```

Or use Looking Glass (`Alt + F2` → `lg` → Enter) on X11.

## 🙏 Credits

This extension is heavily inspired by and based on the excellent blog post by **Pankaj Tanwar**:

**[I built a gnome shell extension to show how much my day, month, year and life has passed](https://www.pankajtanwar.in/blog/i-built-a-gnome-shell-extension-to-show-how-much-my-day-month-year-and-life-has-passed)**

The original implementation and the core logic for calculating time percentages comes from Pankaj's work. I've made minor visual changes to the display format (using `⏳ 𝗗 · 𝗠 · 𝗬 · 𝗟` instead of `Day:, Month:, Year:, Life:`) and updated the code to work with GNOME 48's (actually works with >= 46) modern ES Module syntax.

Follow Pankaj on:
- GitHub: [@pankajtanwarbanna](https://github.com/pankajtanwarbanna/)
- Twitter/X: [@the2ndfloorguy](https://twitter.com/the2ndfloorguy)

## 📚 Resources

- [GNOME Shell Extensions Guide](https://gjs.guide/extensions/)
- [GJS Documentation](https://gjs.guide/)
- [GNOME Extensions Website](https://extensions.gnome.org/)
- [Extension Manager](https://github.com/mjakeman/extension-manager)
- [Mr. Just Perfection (YouTube)](https://www.youtube.com/@jperfection) - Great tutorials for GNOME extension development

## 📄 License

This project is licensed under the **GNU General Public License v3.0 or later** - see the [LICENSE](LICENSE) file for details.

---

Made with 💀 by [Vedesh Padal](https://github.com/vedesh-padal)

*Remember: Time is finite. Use it wisely.*
