/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

function getSecondsInYear(year) {
  const daysInYear =
    (year % 4 === 0 && year % 100 > 0) || year % 400 == 0 ? 366 : 365;
  return daysInYear * 24 * 60 * 60;
}

function getSecondsInMonth(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  return daysInMonth * 24 * 60 * 60;
}

function calculatePercentages(birthYear, ageExpectancy) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Calculate seconds elapsed for the day
  const secondsInDay = 24 * 60 * 60;
  const secondsOfDay = Math.floor(
    (currentDate.getHours() * 3600 +
      currentDate.getMinutes() * 60 +
      currentDate.getSeconds()) %
      secondsInDay
  );

  const dayPercentage = Math.floor((secondsOfDay / secondsInDay) * 100);

  // Calculate seconds elapsed for the month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const secondsInMonth = (currentDate - firstDayOfMonth) / 1000; // divide by 1000 to convert milli seconds to seconds
  const monthPercentage = Math.floor(
    (secondsInMonth / getSecondsInMonth(currentMonth, currentYear)) * 100
  );

  // Calculate seconds elapsed for the year
  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const secondsInYear = (currentDate - firstDayOfYear) / 1000;
  const yearPercentage = Math.floor(
    (secondsInYear / getSecondsInYear(currentYear)) * 100
  );

  // Calculate seconds elapsed for the entire life
  const secondsInLife = (currentDate - new Date(birthYear, 0, 1)) / 1000;
  const lifePercentage = Math.floor(
    (secondsInLife / (ageExpectancy * 31536000)) * 100  // 60 * 60 * 24 * 365
  )

  return `⏳ 𝗗 ${dayPercentage}% · 𝗠 ${monthPercentage}% · 𝗬 ${yearPercentage}% · 𝗟 ${lifePercentage}%`;
}

export default class MementoMoriExtension extends Extension {
  enable() {
    this._settings = this.getSettings();

    this._panelButton = new St.Bin({
      style_class: 'panel-button',
      reactive: true,
      can_focus: true,
      track_hover: true,
    });

    this._panelButtonText = new St.Label({
      text: '⏳ memento mori.',
      y_align: Clutter.ActorAlign.CENTER,
    });

    this._panelButton.set_child(this._panelButtonText);

    // Create tooltip label (hidden by default)
    this._tooltip = new St.Label({
      style_class: 'memento-mori-tooltip',
      text: 'Set your birth year in GNOME Extensions settings',
      visible: false,
    });
    Main.uiGroup.add_child(this._tooltip);

    // Show/hide tooltip on hover when birth year is not set
    this._panelButton.connect('notify::hover', () => {
      const birthYear = this._settings.get_int('birth-year');
      if (birthYear === 0) {
        if (this._panelButton.hover) {
          // Position tooltip below the panel button
          const [x, y] = this._panelButton.get_transformed_position();
          const [width, height] = this._panelButton.get_size();
          this._tooltip.set_position(Math.max(0, x - 50), y + height + 5);
          this._tooltip.show();
        } else {
          this._tooltip.hide();
        }
      }
    });

    Main.panel._rightBox.insert_child_at_index(this._panelButton, 1);

    // Listen for settings changes
    this._settingsChangedId = this._settings.connect('changed', () => {
      this._updateDisplay();
    });

    // Initial update
    this._updateDisplay();

    this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
      this._updateDisplay();
      return GLib.SOURCE_CONTINUE;
    });
  }

  _updateDisplay() {
    const birthYear = this._settings.get_int('birth-year');
    const lifeExpectancy = this._settings.get_int('life-expectancy');

    if (birthYear === 0) {
      this._panelButtonText.set_text('⏳ memento mori.');
    } else {
      this._panelButtonText.set_text(calculatePercentages(birthYear, lifeExpectancy));
    }
  }

  disable() {
    if (this._timeout) {
      GLib.Source.remove(this._timeout);
      this._timeout = null;
    }

    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId);
      this._settingsChangedId = null;
    }

    if (this._tooltip) {
      Main.uiGroup.remove_child(this._tooltip);
      this._tooltip = null;
    }

    Main.panel._rightBox.remove_child(this._panelButton);
    this._panelButton = null;
    this._panelButtonText = null;
    this._settings = null;
  }
}