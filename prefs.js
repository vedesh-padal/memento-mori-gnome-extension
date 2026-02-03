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

/* exported init, fillPreferencesWindow */

const {Adw, Gtk, Gio} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
  // Nothing to initialize
}
function fillPreferencesWindow(window) {
  Adw.init();

  const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.memento-mori');

  // ========================================================================
  // General Settings Page
  // ========================================================================
  const generalPage = new Adw.PreferencesPage({
    title: 'General',
    icon_name: 'preferences-system-symbolic',
  });
  window.add(generalPage);

  // --- General Group ---
  const generalGroup = new Adw.PreferencesGroup({
    title: 'General',
    description: 'Basic extension settings',
  });
  generalPage.add(generalGroup);

  // Update interval
  const updateIntervalRow = new Adw.ActionRow({
    title: 'Update Interval',
    subtitle: 'How often to refresh (in seconds)',
  });

  const updateIntervalSpin = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 10,
      upper: 300,
      step_increment: 10,
      page_increment: 60,
      value: settings.get_int('update-interval'),
    }),
    valign: Gtk.Align.CENTER,
  });

  updateIntervalRow.add_suffix(updateIntervalSpin);
  updateIntervalRow.activatable_widget = updateIntervalSpin;
  generalGroup.add(updateIntervalRow);

  // Panel position
  const panelPositionRow = new Adw.ComboRow({
    title: 'Position in Panel',
    subtitle: 'Where to show the indicator',
    model: Gtk.StringList.new(['Left', 'Center', 'Right']),
    selected: settings.get_int('panel-position'),
  });
  generalGroup.add(panelPositionRow);
  panelPositionRow.connect('notify::selected', () => {
    settings.set_int('panel-position', panelPositionRow.selected);
  });

  // --- Display Group ---
  const displayGroup = new Adw.PreferencesGroup({
    title: 'Panel Display',
    description: 'Configure what appears in the top panel',
  });
  generalPage.add(displayGroup);

  // Panel format
  const panelFormatRow = new Adw.ComboRow({
    title: 'Display Format',
    subtitle: 'How to show metrics in the panel',
    model: Gtk.StringList.new(['Percentage (𝗗 65%)', 'Time Left (𝗗 8h)']),
    selected: settings.get_int('panel-format'),
  });
  displayGroup.add(panelFormatRow);
  panelFormatRow.connect('notify::selected', () => {
    settings.set_int('panel-format', panelFormatRow.selected);
    updateTimeLeftGroupVisibility();
  });

  // Color code life
  const colorCodeLifeRow = new Adw.ActionRow({
    title: 'Color Code Life Percentage',
    subtitle: '🟢 0-33%  🟡 34-66%  🔴 67-100%',
  });

  const colorCodeLifeSwitch = new Gtk.Switch({valign: Gtk.Align.CENTER});

  colorCodeLifeRow.add_suffix(colorCodeLifeSwitch);
  colorCodeLifeRow.activatable_widget = colorCodeLifeSwitch;
  displayGroup.add(colorCodeLifeRow);

  settings.bind('color-code-life', colorCodeLifeSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  // Color code day
  const colorCodeDayRow = new Adw.ActionRow({
    title: 'Color Code Day Percentage',
    subtitle: '🟢 0-50%  🟡 51-75%  🔴 76-100%',
  });

  const colorCodeDaySwitch = new Gtk.Switch({valign: Gtk.Align.CENTER});

  colorCodeDayRow.add_suffix(colorCodeDaySwitch);
  colorCodeDayRow.activatable_widget = colorCodeDaySwitch;
  displayGroup.add(colorCodeDayRow);

  settings.bind('color-code-day', colorCodeDaySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  // --- Time Left Suffix Group (only visible when panel format is Percentage) ---
  const timeLeftGroup = new Adw.PreferencesGroup({
    title: 'Show "Time Left" Suffix',
    description: 'Add remaining time next to percentages in panel (e.g., "65% (8h left)")',
  });
  generalPage.add(timeLeftGroup);

  const timeLeftMetrics = [
    {key: 'show-left-day', title: 'Day', subtitle: 'e.g., "65% (8h left)"'},
    {key: 'show-left-week', title: 'Week', subtitle: 'e.g., "50% (3d left)"'},
    {key: 'show-left-month', title: 'Month', subtitle: 'e.g., "45% (16d left)"'},
    {key: 'show-left-year', title: 'Year', subtitle: 'e.g., "8% (336d left)"'},
    {key: 'show-left-life', title: 'Life', subtitle: 'e.g., "27% (58 yrs left)"'},
  ];

  for (const metric of timeLeftMetrics) {
    const row = new Adw.ActionRow({
      title: metric.title,
      subtitle: metric.subtitle,
    });

    const sw = new Gtk.Switch({valign: Gtk.Align.CENTER});

    row.add_suffix(sw);
    row.activatable_widget = sw;
    timeLeftGroup.add(row);

    settings.bind(metric.key, sw, 'active', Gio.SettingsBindFlags.DEFAULT);
  }

  // Conditional visibility for time left suffix group
  const updateTimeLeftGroupVisibility = () => {
    // Only show when panel format is Percentage (0)
    timeLeftGroup.visible = panelFormatRow.selected === 0;
  };
  updateTimeLeftGroupVisibility();

  // --- Dropdown Format Group ---
  const dropdownGroup = new Adw.PreferencesGroup({
    title: 'Dropdown Display',
    description: 'Format for metrics in the expanded menu',
  });
  generalPage.add(dropdownGroup);

  const dropdownFormatRow = new Adw.ComboRow({
    title: 'Display Format',
    subtitle: 'How to show values in dropdown',
    model: Gtk.StringList.new(['Percentage (65%)', 'Ratio (15h / 24h)', 'Time Left (8h left)']),
    selected: settings.get_int('dropdown-format'),
  });
  dropdownGroup.add(dropdownFormatRow);
  dropdownFormatRow.connect('notify::selected', () => {
    settings.set_int('dropdown-format', dropdownFormatRow.selected);
  });

  // ========================================================================
  // Personal Settings Page
  // ========================================================================
  const personalPage = new Adw.PreferencesPage({
    title: 'Personal',
    icon_name: 'avatar-default-symbolic',
  });
  window.add(personalPage);

  // --- Birth Info Group ---
  const birthGroup = new Adw.PreferencesGroup({
    title: 'Birth Information',
    description: 'Used to calculate life progress and birthday countdown',
  });
  personalPage.add(birthGroup);

  // Birth year
  const birthYearRow = new Adw.ActionRow({
    title: 'Birth Year',
    subtitle: 'Your year of birth',
  });

  const birthYearSpin = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 1900,
      upper: new Date().getFullYear(),
      step_increment: 1,
      page_increment: 10,
      value: settings.get_int('birth-year'),
    }),
    valign: Gtk.Align.CENTER,
  });

  birthYearRow.add_suffix(birthYearSpin);
  birthYearRow.activatable_widget = birthYearSpin;
  birthGroup.add(birthYearRow);

  settings.bind(
    'birth-year',
    birthYearSpin,
    'value',
    Gio.SettingsBindFlags.DEFAULT,
    (value) => Math.round(value),
    (value) => value,
  );

  // Birth month
  const months = ['Not Set', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const birthMonthRow = new Adw.ComboRow({
    title: 'Birth Month',
    subtitle: 'Optional - needed for birthday countdown',
    model: Gtk.StringList.new(months),
    selected: settings.get_int('birth-month'),
  });
  birthGroup.add(birthMonthRow);
  birthMonthRow.connect('notify::selected', () => {
    settings.set_int('birth-month', birthMonthRow.selected);
    updateDayDropdown();
  });

  // Birth day
  const birthDayRow = new Adw.ComboRow({
    title: 'Birth Day',
    subtitle: 'Optional - needed for birthday countdown',
  });
  birthGroup.add(birthDayRow);

  const updateDayDropdown = () => {
    const month = birthMonthRow.selected;
    const year = settings.get_int('birth-year');
    let daysInMonth = 31;

    if (month > 0) {
      daysInMonth = new Date(year, month, 0).getDate();
    }

    const days = ['Not Set'];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i.toString());
    }

    birthDayRow.model = Gtk.StringList.new(days);
    const currentDay = settings.get_int('birth-day');
    birthDayRow.selected = currentDay <= daysInMonth ? currentDay : 0;
  };

  updateDayDropdown();
  birthDayRow.connect('notify::selected', () => {
    settings.set_int('birth-day', birthDayRow.selected);
  });

  // Life expectancy
  const lifeExpectancyRow = new Adw.ActionRow({
    title: 'Life Expectancy',
    subtitle: 'Expected lifespan in years',
  });

  const lifeExpectancySpin = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 1,
      upper: 150,
      step_increment: 1,
      page_increment: 10,
      value: settings.get_int('life-expectancy'),
    }),
    valign: Gtk.Align.CENTER,
  });

  lifeExpectancyRow.add_suffix(lifeExpectancySpin);
  lifeExpectancyRow.activatable_widget = lifeExpectancySpin;
  birthGroup.add(lifeExpectancyRow);

  settings.bind(
    'life-expectancy',
    lifeExpectancySpin,
    'value',
    Gio.SettingsBindFlags.DEFAULT,
    (value) => Math.round(value),
    (value) => value,
  );

  // Enable tracking button
  const configuredRow = new Adw.ActionRow({
    title: 'Enable Time Tracking',
    subtitle: 'Start displaying progress percentages',
  });

  const configuredSwitch = new Gtk.Switch({valign: Gtk.Align.CENTER});

  configuredRow.add_suffix(configuredSwitch);
  configuredRow.activatable_widget = configuredSwitch;
  birthGroup.add(configuredRow);

  settings.bind('configured', configuredSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  // ========================================================================
  // Event Countdown Page
  // ========================================================================
  const eventsPage = new Adw.PreferencesPage({
    title: 'Events',
    icon_name: 'x-office-calendar-symbolic',
  });
  window.add(eventsPage);

  // --- Countdown Type Group ---
  const countdownGroup = new Adw.PreferencesGroup({
    title: 'Event Countdown',
    description: 'Show a countdown to a special event in the dropdown menu',
  });
  eventsPage.add(countdownGroup);

  const countdownTypeRow = new Adw.ComboRow({
    title: 'Show Countdown',
    subtitle: 'Select event type to count down to',
    model: Gtk.StringList.new(['None', 'Birthday', 'Custom Event']),
    selected: settings.get_int('countdown-type'),
  });
  countdownGroup.add(countdownTypeRow);
  countdownTypeRow.connect('notify::selected', () => {
    settings.set_int('countdown-type', countdownTypeRow.selected);
    updateCustomEventVisibility();
  });

  // --- Custom Event Group ---
  const customEventGroup = new Adw.PreferencesGroup({
    title: 'Custom Event',
    description: 'Configure your custom event countdown',
  });
  eventsPage.add(customEventGroup);

  // Event name
  const eventNameRow = new Adw.ActionRow({
    title: 'Event Name',
  });

  const eventNameEntry = new Gtk.Entry({
    text: settings.get_string('custom-event-name'),
    valign: Gtk.Align.CENTER,
  });

  eventNameRow.add_suffix(eventNameEntry);
  eventNameRow.activatable_widget = eventNameEntry;
  customEventGroup.add(eventNameRow);

  eventNameEntry.connect('changed', () => {
    settings.set_string('custom-event-name', eventNameEntry.text);
  });

  // Event month
  const eventMonthRow = new Adw.ComboRow({
    title: 'Event Month',
    model: Gtk.StringList.new(months.slice(1)), // Exclude "Not Set"
    selected: settings.get_int('custom-event-month') - 1,
  });
  customEventGroup.add(eventMonthRow);
  eventMonthRow.connect('notify::selected', () => {
    settings.set_int('custom-event-month', eventMonthRow.selected + 1);
    updateEventDayDropdown();
  });

  // Event day
  const eventDayRow = new Adw.ComboRow({
    title: 'Event Day',
  });
  customEventGroup.add(eventDayRow);

  const updateEventDayDropdown = () => {
    const month = eventMonthRow.selected + 1;
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i.toString());
    }

    eventDayRow.model = Gtk.StringList.new(days);
    const currentDay = settings.get_int('custom-event-day');
    eventDayRow.selected = Math.min(currentDay - 1, daysInMonth - 1);
  };

  updateEventDayDropdown();
  eventDayRow.connect('notify::selected', () => {
    settings.set_int('custom-event-day', eventDayRow.selected + 1);
  });

  // Event text
  const eventTextRow = new Adw.ActionRow({
    title: 'Display Text',
  });

  const eventTextEntry = new Gtk.Entry({
    text: settings.get_string('custom-event-text'),
    valign: Gtk.Align.CENTER,
  });

  eventTextRow.add_suffix(eventTextEntry);
  eventTextRow.activatable_widget = eventTextEntry;
  customEventGroup.add(eventTextRow);

  eventTextEntry.connect('changed', () => {
    settings.set_string('custom-event-text', eventTextEntry.text);
  });

  // Help text
  const helpRow = new Adw.ActionRow({
    title: 'Tip',
    subtitle: 'Use {days} in your text to show the countdown number. Emojis are supported! 🎉',
  });
  customEventGroup.add(helpRow);

  const updateCustomEventVisibility = () => {
    customEventGroup.visible = countdownTypeRow.selected === 2;
  };
  updateCustomEventVisibility();

  // ========================================================================
  // Notifications Page
  // ========================================================================
  const notificationsPage = new Adw.PreferencesPage({
    title: 'Notifications',
    icon_name: 'preferences-system-notifications-symbolic',
  });
  window.add(notificationsPage);

  // --- Notifications Group ---
  const notificationsGroup = new Adw.PreferencesGroup({
    title: 'Notifications',
    description: 'Get notified about time milestones',
  });
  notificationsPage.add(notificationsGroup);

  // Enable notifications
  const enableNotificationsRow = new Adw.ActionRow({
    title: 'Enable Notifications',
    subtitle: 'Show desktop notifications for milestones',
  });

  const enableNotificationsSwitch = new Gtk.Switch({valign: Gtk.Align.CENTER});

  enableNotificationsRow.add_suffix(enableNotificationsSwitch);
  enableNotificationsRow.activatable_widget = enableNotificationsSwitch;
  notificationsGroup.add(enableNotificationsRow);

  settings.bind('enable-notifications', enableNotificationsSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  // Quarterly
  const quarterlyRow = new Adw.ActionRow({
    title: 'Quarterly Progress',
    subtitle: 'Notify on Jan 1, Apr 1, Jul 1, Oct 1',
  });

  const quarterlySwitch = new Gtk.Switch({valign: Gtk.Align.CENTER});

  quarterlyRow.add_suffix(quarterlySwitch);
  quarterlyRow.activatable_widget = quarterlySwitch;
  notificationsGroup.add(quarterlyRow);

  settings.bind('notify-quarterly', quarterlySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  // Birthday
  const birthdayNotifyRow = new Adw.ActionRow({
    title: 'Birthday Reminder',
    subtitle: 'Notify on your birthday (requires birth date)',
  });

  const birthdayNotifySwitch = new Gtk.Switch({valign: Gtk.Align.CENTER});

  birthdayNotifyRow.add_suffix(birthdayNotifySwitch);
  birthdayNotifyRow.activatable_widget = birthdayNotifySwitch;
  notificationsGroup.add(birthdayNotifyRow);

  settings.bind('notify-birthday', birthdayNotifySwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

  // Notification style
  const notificationStyleRow = new Adw.ComboRow({
    title: 'Notification Style',
    model: Gtk.StringList.new(['Subtle', 'Prominent']),
    selected: settings.get_int('notification-style'),
  });
  notificationsGroup.add(notificationStyleRow);
  notificationStyleRow.connect('notify::selected', () => {
    settings.set_int('notification-style', notificationStyleRow.selected);
  });

  // ========================================================================
  // About Page
  // ========================================================================
  const aboutPage = new Adw.PreferencesPage({
    title: 'About',
    icon_name: 'help-about-symbolic',
  });
  window.add(aboutPage);

  const aboutGroup = new Adw.PreferencesGroup({
    title: 'Memento Mori',
  });
  aboutPage.add(aboutGroup);

  const aboutRow = new Adw.ActionRow({
    title: 'Version 3.0 (Legacy)',
    subtitle: '"Remember that you must die" — A reminder to make the most of your time.',
  });
  aboutGroup.add(aboutRow);

  const githubRow = new Adw.ActionRow({
    title: 'GitHub',
    subtitle: 'github.com/vedesh-padal/memento-mori-gnome-extension',
    activatable: true,
  });
  githubRow.add_suffix(
    new Gtk.Image({
      icon_name: 'go-next-symbolic',
    }),
  );
  aboutGroup.add(githubRow);
  githubRow.connect('activated', () => {
    Gio.AppInfo.launch_default_for_uri('https://github.com/vedesh-padal/memento-mori-gnome-extension', null);
  });

  const creditsRow = new Adw.ActionRow({
    title: 'Credits',
    subtitle: "Inspired by Pankaj Tanwar's original implementation",
  });
  aboutGroup.add(creditsRow);

  const compatRow = new Adw.ActionRow({
    title: 'Compatibility',
    subtitle: 'GNOME 42, 43, 44 (Ubuntu 22.04 LTS)',
  });
  aboutGroup.add(compatRow);
}
