# ⏳ Memento Mori - GNOME Shell Extension

> _"Remember that you must die"_ ~ Memento Mori

A GNOME Shell extension that displays how much of your **day**, **week**, **month**, **year**, and **life** has passed in the top panel. A gentle reminder to make the most of your time.

![GNOME 49](https://img.shields.io/badge/GNOME-45--49-blue?logo=gnome)
![License](https://img.shields.io/badge/License-GPL--3.0--or--later-green)

## 📸 Preview

The extension shows progress for:

- **𝗗** Day · **𝗪** Week · **𝗠** Month · **𝗬** Year · **𝗟** Life

**Panel Display (Percentage mode):**

```
⏳ 𝗗 65% · 𝗪 50% · 𝗠 45% · 𝗬 8% · 𝗟 27%
```

**Panel Display (Time Left mode):**

```
⏳ (time left) 𝗗 8h · 𝗪 3d · 𝗠 16d · 𝗬 336d · 𝗟 58 yrs
```

**Dropdown Menu (click to expand):**

- Toggle which metrics appear in the panel
- Visual progress bars for each metric
- Event countdown (birthday or custom)
- Quick access to settings

## 🚀 Installation

### From GNOME Extensions (Recommended)

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg" height="100">](https://extensions.gnome.org/extension/9136/memento-mori/)

### Manual Installation

```bash
git clone https://github.com/vedesh-padal/memento-mori-gnome-extension.git
cd memento-mori-gnome-extension/memento-mori@vedeshpadal
./install.sh
```

Then restart GNOME Shell:

- **Wayland**: Log out and log back in
- **X11**: Press `Alt + F2`, type `r`, press Enter

Enable the extension (choose one):

- **GUI**: Open [Extension Manager](https://github.com/mjakeman/extension-manager) and enable "Memento Mori"
- **Command**: `gnome-extensions enable memento-mori@vedeshpadal`

## ✨ Features

| Feature                   | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| **Multiple Metrics**      | Day, Week, Month, Year, and Life progress             |
| **Display Formats**       | Choose Percentage or Time Left mode for panel         |
| **Time Left Suffix**      | Optionally show remaining time next to percentage     |
| **Color Coding**          | Optional color indicators for Life and Day metrics    |
| **Dropdown Menu**         | Click to see progress bars and toggle metrics         |
| **Event Countdown**       | Birthday countdown or custom event with emoji support |
| **Notifications**         | Quarterly progress and birthday reminders             |
| **Panel Position**        | Left, Center, or Right placement                      |
| **Configurable Interval** | Update frequency from 10 to 300 seconds               |

## ⚙️ Configuration

Open extension settings via:

- **GNOME Extensions** app or **Extension Manager**
- Click the extension in the panel → **⚙️ Settings**

### Settings Pages

| Page              | Options                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| **General**       | Update interval, panel position, display format, color coding, time left suffix toggles |
| **Personal**      | Birth year/month/day, life expectancy, enable time tracking                             |
| **Events**        | Birthday countdown or custom event (name, date, display text with `{days}` placeholder) |
| **Notifications** | Quarterly year progress, birthday reminder, notification style (subtle/prominent)       |
| **About**         | Version info and GitHub link                                                            |

### Display Format Options

**Panel (Collapsed):**

- **Percentage**: `𝗗 65% · 𝗟 27%`
- **Time Left**: `(time left) 𝗗 8h · 𝗟 58 yrs`

**Dropdown (Expanded):**

- **Percentage**: `65%`
- **Ratio**: `15h / 24h`
- **Time Left**: `8h left`

### Color Coding

When enabled, metrics change color based on progress:

| Metric   | Green | Yellow | Red     |
| -------- | ----- | ------ | ------- |
| **Life** | 0-33% | 34-66% | 67-100% |
| **Day**  | 0-50% | 51-75% | 76-100% |

## ⚠️ GNOME Compatibility

| GNOME Version | Status             |
| ------------- | ------------------ |
| **45 - 49**   | ✅ Fully supported |
| **< 45**      | ❌ Not supported   |

Check your version:

```bash
gnome-shell --version
```

## 🛠️ Development

### View Logs

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

### Testing Changes

1. Make your changes to the source files
2. Compile schemas if modified: `glib-compile-schemas schemas/`
3. Restart GNOME Shell (log out/in on Wayland)
4. Check logs for errors

### Reset Settings

```bash
# Reset all extension settings to defaults
dconf reset -f /org/gnome/shell/extensions/memento-mori/
```

## 📁 Project Structure

```
memento-mori@vedeshpadal/
├── extension.js      # Main extension logic with PopupMenu
├── prefs.js          # Multi-page preferences UI
├── metadata.json     # Extension metadata
├── stylesheet.css    # Styling for panel and dropdown
├── schemas/          # GSettings schema
│   └── org.gnome.shell.extensions.memento-mori.gschema.xml
└── README.md
```

## 🙏 Credits

Inspired by [Pankaj Tanwar's blog post](https://www.pankajtanwar.in/blog/i-built-a-gnome-shell-extension-to-show-how-much-my-day-month-year-and-life-has-passed).

## 📄 License

**GNU General Public License v3.0 or later** - see [LICENSE](LICENSE).

---

Made with 💀 by [Vedesh Padal](https://github.com/vedesh-padal)

**Remember: Time is finite. Use it wisely.**
