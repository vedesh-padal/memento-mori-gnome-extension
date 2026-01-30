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

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Local imports
import {
  buildGeneralPage,
  buildPersonalPage,
  buildEventsPage,
  buildNotificationsPage,
  buildAboutPage,
} from './ui/prefsPages.js';

export default class MementoMoriPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    // Add all pages
    window.add(buildGeneralPage(settings));
    window.add(buildPersonalPage(settings));
    window.add(buildEventsPage(settings));
    window.add(buildNotificationsPage(settings));
    window.add(buildAboutPage());
  }
}
