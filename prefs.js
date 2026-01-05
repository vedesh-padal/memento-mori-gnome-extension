/* prefs.js
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

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MementoMoriPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    // Create a preferences page
    const page = new Adw.PreferencesPage({
      title: 'Settings',
      icon_name: 'preferences-system-symbolic',
    });
    window.add(page);

    // Create a preferences group
    const group = new Adw.PreferencesGroup({
      title: 'Life Settings',
      description: 'Configure your birth year and life expectancy to calculate life progress',
    });
    page.add(group);

    // Birth Year setting
    const birthYearRow = new Adw.SpinRow({
      title: 'Birth Year',
      subtitle: 'Enter your birth year (e.g., 1990)',
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: new Date().getFullYear(),
        step_increment: 1,
        page_increment: 10,
        value: settings.get_int('birth-year'),
      }),
    });
    group.add(birthYearRow);

    // Life Expectancy setting
    const lifeExpectancyRow = new Adw.SpinRow({
      title: 'Life Expectancy',
      subtitle: 'Expected lifespan in years',
      adjustment: new Gtk.Adjustment({
        lower: 1,
        upper: 150,
        step_increment: 1,
        page_increment: 10,
        value: settings.get_int('life-expectancy'),
      }),
    });
    group.add(lifeExpectancyRow);

    // Bind settings
    settings.bind(
      'birth-year',
      birthYearRow,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );

    settings.bind(
      'life-expectancy',
      lifeExpectancyRow,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );

    // Info group
    const infoGroup = new Adw.PreferencesGroup({
      title: 'About',
    });
    page.add(infoGroup);

    const infoRow = new Adw.ActionRow({
      title: 'Memento Mori',
      subtitle: '"Remember that you must die" - A reminder to make the most of your time.',
    });
    infoGroup.add(infoRow);
  }
}
