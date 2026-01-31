/* prefs.js
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MementoMoriPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    // === General Settings Page ===
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
    const updateIntervalRow = new Adw.SpinRow({
      title: 'Update Interval',
      subtitle: 'How often to refresh (in seconds)',
      adjustment: new Gtk.Adjustment({
        lower: 10,
        upper: 300,
        step_increment: 10,
        page_increment: 60,
        value: settings.get_int('update-interval'),
      }),
    });
    generalGroup.add(updateIntervalRow);
    settings.bind('update-interval', updateIntervalRow, 'value', Gio.SettingsBindFlags.DEFAULT);

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

    const colorCodeLifeRow = new Adw.SwitchRow({
      title: 'Color Code Life Percentage',
      subtitle: '🟢 0-33%  🟡 34-66%  🔴 67-100%',
    });
    displayGroup.add(colorCodeLifeRow);
    settings.bind('color-code-life', colorCodeLifeRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    const colorCodeDayRow = new Adw.SwitchRow({
      title: 'Color Code Day Percentage',
      subtitle: '🟢 0-50%  🟡 51-75%  🔴 76-100%',
    });
    displayGroup.add(colorCodeDayRow);
    settings.bind('color-code-day', colorCodeDayRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    // --- Time Left Suffix Group (only visible when panel format is Percentage) ---
    const timeLeftGroup = new Adw.PreferencesGroup({
      title: 'Show "Time Left" Suffix',
      description: 'Add remaining time next to percentages in panel (e.g., "65% (8h left)")',
    });
    generalPage.add(timeLeftGroup);

    const timeLeftMetrics = [
      { key: 'show-left-day', title: 'Day', subtitle: 'e.g., "65% (8h left)"' },
      { key: 'show-left-week', title: 'Week', subtitle: 'e.g., "50% (3d left)"' },
      { key: 'show-left-month', title: 'Month', subtitle: 'e.g., "45% (16d left)"' },
      { key: 'show-left-year', title: 'Year', subtitle: 'e.g., "8% (336d left)"' },
      { key: 'show-left-life', title: 'Life', subtitle: 'e.g., "27% (58 yrs left)"' },
    ];

    for (const metric of timeLeftMetrics) {
      const row = new Adw.SwitchRow({
        title: metric.title,
        subtitle: metric.subtitle,
      });
      timeLeftGroup.add(row);
      settings.bind(metric.key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
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

    // === Personal Settings Page ===
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

    const birthYearRow = new Adw.SpinRow({
      title: 'Birth Year',
      subtitle: 'Your year of birth',
      adjustment: new Gtk.Adjustment({
        lower: 1900,
        upper: new Date().getFullYear(),
        step_increment: 1,
        page_increment: 10,
        value: settings.get_int('birth-year'),
      }),
    });
    birthGroup.add(birthYearRow);
    settings.bind('birth-year', birthYearRow, 'value', Gio.SettingsBindFlags.DEFAULT);

    const months = ['Not Set', 'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
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
    birthGroup.add(lifeExpectancyRow);
    settings.bind('life-expectancy', lifeExpectancyRow, 'value', Gio.SettingsBindFlags.DEFAULT);

    // Enable tracking button
    const configuredRow = new Adw.SwitchRow({
      title: 'Enable Time Tracking',
      subtitle: 'Start displaying progress percentages',
    });
    birthGroup.add(configuredRow);
    settings.bind('configured', configuredRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    // === Event Countdown Page ===
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

    const eventNameRow = new Adw.EntryRow({
      title: 'Event Name',
    });
    eventNameRow.text = settings.get_string('custom-event-name');
    customEventGroup.add(eventNameRow);
    eventNameRow.connect('changed', () => {
      settings.set_string('custom-event-name', eventNameRow.text);
    });

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

    const eventTextRow = new Adw.EntryRow({
      title: 'Display Text',
    });
    eventTextRow.text = settings.get_string('custom-event-text');
    customEventGroup.add(eventTextRow);
    eventTextRow.connect('changed', () => {
      settings.set_string('custom-event-text', eventTextRow.text);
    });

    const helpRow = new Adw.ActionRow({
      title: 'Tip',
      subtitle: 'Use {days} in your text to show the countdown number. Emojis are supported! 🎉',
    });
    customEventGroup.add(helpRow);

    const updateCustomEventVisibility = () => {
      customEventGroup.visible = countdownTypeRow.selected === 2;
    };
    updateCustomEventVisibility();

    // === Notifications Page ===
    const notificationsPage = new Adw.PreferencesPage({
      title: 'Notifications',
      icon_name: 'preferences-system-notifications-symbolic',
    });
    window.add(notificationsPage);

    const notificationsGroup = new Adw.PreferencesGroup({
      title: 'Notifications',
      description: 'Get notified about time milestones',
    });
    notificationsPage.add(notificationsGroup);

    const enableNotificationsRow = new Adw.SwitchRow({
      title: 'Enable Notifications',
      subtitle: 'Show desktop notifications for milestones',
    });
    notificationsGroup.add(enableNotificationsRow);
    settings.bind('enable-notifications', enableNotificationsRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    const quarterlyRow = new Adw.SwitchRow({
      title: 'Quarterly Progress',
      subtitle: 'Notify on Jan 1, Apr 1, Jul 1, Oct 1',
    });
    notificationsGroup.add(quarterlyRow);
    settings.bind('notify-quarterly', quarterlyRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    const birthdayNotifyRow = new Adw.SwitchRow({
      title: 'Birthday Reminder',
      subtitle: 'Notify on your birthday (requires birth date)',
    });
    notificationsGroup.add(birthdayNotifyRow);
    settings.bind('notify-birthday', birthdayNotifyRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    const notificationStyleRow = new Adw.ComboRow({
      title: 'Notification Style',
      model: Gtk.StringList.new(['Subtle', 'Prominent']),
      selected: settings.get_int('notification-style'),
    });
    notificationsGroup.add(notificationStyleRow);
    notificationStyleRow.connect('notify::selected', () => {
      settings.set_int('notification-style', notificationStyleRow.selected);
    });

    // === About Page ===
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
      title: 'Version 3.0',
      subtitle: '"Remember that you must die" — A reminder to make the most of your time.',
    });
    aboutGroup.add(aboutRow);

    const githubRow = new Adw.ActionRow({
      title: 'GitHub',
      subtitle: 'github.com/vedesh-padal/memento-mori-gnome-extension',
      activatable: true,
    });
    githubRow.add_suffix(new Gtk.Image({
      icon_name: 'go-next-symbolic',
    }));
    aboutGroup.add(githubRow);
    githubRow.connect('activated', () => {
      Gio.AppInfo.launch_default_for_uri('https://github.com/vedesh-padal/memento-mori-gnome-extension', null);
    });

    const creditsRow = new Adw.ActionRow({
      title: 'Credits',
      subtitle: 'Inspired by Pankaj Tanwar\'s original implementation',
    });
    aboutGroup.add(creditsRow);
  }
}
