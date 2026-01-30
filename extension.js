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
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// ============================================================================
// Time Calculation Helpers
// ============================================================================

function getSecondsInYear(year) {
  const daysInYear = (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
  return daysInYear * 24 * 60 * 60;
}

function getDaysInYear(year) {
  return (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
}

function getSecondsInMonth(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  return daysInMonth * 24 * 60 * 60;
}

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

// ============================================================================
// Progress Calculations
// ============================================================================

function calculateAllProgress(birthYear, birthMonth, birthDay, lifeExpectancy) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Day progress
  const secondsInDay = 24 * 60 * 60;
  const secondsElapsedToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayPercent = Math.floor((secondsElapsedToday / secondsInDay) * 100);
  const dayHoursElapsed = Math.floor(secondsElapsedToday / 3600);
  const daySecondsLeft = secondsInDay - secondsElapsedToday;
  const dayHoursLeft = Math.floor(daySecondsLeft / 3600);
  const dayMinutesLeft = Math.floor(daySecondsLeft / 60);

  // Week progress (week starts on Sunday)
  const dayOfWeek = now.getDay();
  const secondsInWeek = 7 * 24 * 60 * 60;
  const secondsElapsedThisWeek = dayOfWeek * 24 * 3600 + secondsElapsedToday;
  const weekPercent = Math.floor((secondsElapsedThisWeek / secondsInWeek) * 100);
  const weekDaysElapsed = dayOfWeek;
  const weekSecondsLeft = secondsInWeek - secondsElapsedThisWeek;
  const weekDaysLeft = Math.floor(weekSecondsLeft / 86400);
  const weekHoursLeft = Math.floor(weekSecondsLeft / 3600);

  // Month progress
  const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1);
  const secondsElapsedThisMonth = (now - firstDayOfMonth) / 1000;
  const totalSecondsInMonth = getSecondsInMonth(currentMonth, currentYear);
  const monthPercent = Math.floor((secondsElapsedThisMonth / totalSecondsInMonth) * 100);
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const monthDaysElapsed = now.getDate();
  const monthSecondsLeft = totalSecondsInMonth - secondsElapsedThisMonth;
  const monthDaysLeft = Math.floor(monthSecondsLeft / 86400);
  const monthHoursLeft = Math.floor(monthSecondsLeft / 3600);

  // Year progress
  const firstDayOfYear = new Date(currentYear, 0, 1);
  const secondsElapsedThisYear = (now - firstDayOfYear) / 1000;
  const totalSecondsInYear = getSecondsInYear(currentYear);
  const yearPercent = Math.floor((secondsElapsedThisYear / totalSecondsInYear) * 100);
  const daysInYear = getDaysInYear(currentYear);
  const yearDayNumber = Math.floor(secondsElapsedThisYear / 86400) + 1;
  const yearSecondsLeft = totalSecondsInYear - secondsElapsedThisYear;
  const yearDaysLeft = Math.floor(yearSecondsLeft / 86400);
  const yearHoursLeft = Math.floor(yearSecondsLeft / 3600);

  // Life progress
  const birthDate = new Date(birthYear, (birthMonth || 1) - 1, birthDay || 1);
  const secondsLived = (now - birthDate) / 1000;
  const totalLifeSeconds = lifeExpectancy * 365.25 * 24 * 60 * 60;
  const lifePercent = Math.floor((secondsLived / totalLifeSeconds) * 100);
  const yearsLived = Math.floor(secondsLived / (365.25 * 24 * 60 * 60));
  const yearsLeft = lifeExpectancy - yearsLived;

  // Smart contextual units for "left" display
  // Day: show minutes if < 1 hour left, otherwise hours
  const dayLeftValue = dayHoursLeft < 1 ? dayMinutesLeft : dayHoursLeft;
  const dayLeftUnit = dayHoursLeft < 1 ? 'm' : 'h';
  
  // Week: show hours if < 1 day left, otherwise days
  const weekLeftValue = weekDaysLeft < 1 ? weekHoursLeft : weekDaysLeft;
  const weekLeftUnit = weekDaysLeft < 1 ? 'h' : 'd';
  
  // Month: show hours if < 1 day left, otherwise days
  const monthLeftValue = monthDaysLeft < 1 ? monthHoursLeft : monthDaysLeft;
  const monthLeftUnit = monthDaysLeft < 1 ? 'h' : 'd';
  
  // Year: show hours if < 1 day left, otherwise days
  const yearLeftValue = yearDaysLeft < 1 ? yearHoursLeft : yearDaysLeft;
  const yearLeftUnit = yearDaysLeft < 1 ? 'h' : 'd';

  return {
    day: {
      percent: dayPercent,
      elapsed: dayHoursElapsed,
      left: dayLeftValue,
      total: 24,
      unit: dayLeftUnit,
      ratioText: `${dayHoursElapsed}h / 24h`,
      leftText: `${dayLeftValue}${dayLeftUnit} left`,
    },
    week: {
      percent: weekPercent,
      elapsed: weekDaysElapsed,
      left: weekLeftValue,
      total: 7,
      unit: weekLeftUnit,
      ratioText: `${weekDaysElapsed}d / 7d`,
      leftText: `${weekLeftValue}${weekLeftUnit} left`,
    },
    month: {
      percent: monthPercent,
      elapsed: monthDaysElapsed,
      left: monthLeftValue,
      total: daysInMonth,
      unit: monthLeftUnit,
      ratioText: `${monthDaysElapsed}d / ${daysInMonth}d`,
      leftText: `${monthLeftValue}${monthLeftUnit} left`,
    },
    year: {
      percent: yearPercent,
      elapsed: yearDayNumber,
      left: yearLeftValue,
      total: daysInYear,
      unit: yearLeftUnit,
      ratioText: `Day ${yearDayNumber} / ${daysInYear}`,
      leftText: `${yearLeftValue}${yearLeftUnit} left`,
    },
    life: {
      percent: Math.min(lifePercent, 100),
      elapsed: yearsLived,
      left: Math.max(yearsLeft, 0),
      total: lifeExpectancy,
      unit: 'yrs',
      ratioText: `${yearsLived} yrs / ${lifeExpectancy} yrs`,
      leftText: `${Math.max(yearsLeft, 0)} yrs left`,
    },
  };
}

// ============================================================================
// Progress Bar Helper
// ============================================================================

function createProgressBar(percent, width = 10) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

// ============================================================================
// Color Coding Helper
// ============================================================================

function getLifeColorClass(percent) {
  if (percent <= 33) return 'memento-mori-life-green';
  if (percent <= 66) return 'memento-mori-life-yellow';
  return 'memento-mori-life-red';
}

function getDayColorClass(percent) {
  if (percent <= 50) return 'memento-mori-life-green';
  if (percent <= 75) return 'memento-mori-life-yellow';
  return 'memento-mori-life-red';
}

// ============================================================================
// Days Until Event Helper
// ============================================================================

function getDaysUntilEvent(month, day) {
  const now = new Date();
  const currentYear = now.getFullYear();
  let eventDate = new Date(currentYear, month - 1, day);
  
  // If the event has passed this year, calculate for next year
  if (eventDate < now) {
    eventDate = new Date(currentYear + 1, month - 1, day);
  }
  
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ============================================================================
// Metric Toggle Menu Item
// ============================================================================

const MetricToggleItem = GObject.registerClass(
class MetricToggleItem extends PopupMenu.PopupBaseMenuItem {
  _init(label, symbol, settings, settingKey, params) {
    super._init(params);
    
    this._settings = settings;
    this._settingKey = settingKey;
    
    // Checkbox
    this._check = new St.Icon({
      icon_name: 'emblem-ok-symbolic',
      style_class: 'popup-menu-icon',
    });
    this.add_child(this._check);
    
    // Symbol
    this._symbol = new St.Label({
      text: symbol,
      style_class: 'memento-mori-metric-symbol',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this._symbol);
    
    // Label
    this._label = new St.Label({
      text: label,
      style_class: 'memento-mori-metric-label',
      y_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
    });
    this.add_child(this._label);
    
    // Progress bar
    this._progressBar = new St.Label({
      text: '░░░░░░░░░░',
      style_class: 'memento-mori-progress-bar',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this._progressBar);
    
    // Value
    this._value = new St.Label({
      text: '0%',
      style_class: 'memento-mori-metric-value',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this._value);
    
    this._updateCheckVisibility();
  }
  
  _updateCheckVisibility() {
    const isEnabled = this._settings.get_boolean(this._settingKey);
    this._check.opacity = isEnabled ? 255 : 0;
  }
  
  activate(event) {
    const current = this._settings.get_boolean(this._settingKey);
    this._settings.set_boolean(this._settingKey, !current);
    this._updateCheckVisibility();
    // Don't close the menu
    return Clutter.EVENT_STOP;
  }
  
  updateProgress(percent, displayText) {
    this._progressBar.text = createProgressBar(percent);
    this._value.text = displayText;
  }
});

// ============================================================================
// Main Extension Class
// ============================================================================

export default class MementoMoriExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    
    // Create the panel indicator
    this._indicator = new PanelMenu.Button(0.0, 'Memento Mori', false);
    
    // Panel container - BoxLayout to hold per-metric labels
    this._panelBox = new St.BoxLayout({
      style_class: 'memento-mori-panel-box',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this._indicator.add_child(this._panelBox);
    
    // Hourglass icon
    this._hourglassLabel = new St.Label({
      text: '⏳ ',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this._panelBox.add_child(this._hourglassLabel);
    
    // Per-metric labels (for individual color coding)
    this._metricLabels = {};
    const metricKeys = ['day', 'week', 'month', 'year', 'life'];
    for (const key of metricKeys) {
      this._metricLabels[key] = new St.Label({
        text: '',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._panelBox.add_child(this._metricLabels[key]);
    }
    
    // Placeholder label for unconfigured state
    this._placeholderLabel = new St.Label({
      text: 'memento mori.',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this._panelBox.add_child(this._placeholderLabel);
    
    // Build the dropdown menu
    this._buildMenu();
    
    // Add to panel at configured position
    this._addToPanel();
    
    // Listen for settings changes
    this._settingsChangedIds = [];
    this._settingsChangedIds.push(
      this._settings.connect('changed', () => this._updateDisplay())
    );
    this._settingsChangedIds.push(
      this._settings.connect('changed::panel-position', () => this._repositionIndicator())
    );
    
    // Initial update
    this._updateDisplay();
    
    // Start update timer
    const interval = this._settings.get_int('update-interval');
    this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
      this._updateDisplay();
      this._checkNotifications();
      return GLib.SOURCE_CONTINUE;
    });
  }
  
  _buildMenu() {
    // Header
    const headerItem = new PopupMenu.PopupMenuItem('Memento Mori', {
      reactive: false,
      style_class: 'memento-mori-header',
    });
    this._indicator.menu.addMenuItem(headerItem);
    
    this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    
    // Metric toggles
    this._metricItems = {};
    
    this._metricItems.day = new MetricToggleItem('Day', '𝗗', this._settings, 'show-day');
    this._indicator.menu.addMenuItem(this._metricItems.day);
    
    this._metricItems.week = new MetricToggleItem('Week', '𝗪', this._settings, 'show-week');
    this._indicator.menu.addMenuItem(this._metricItems.week);
    
    this._metricItems.month = new MetricToggleItem('Month', '𝗠', this._settings, 'show-month');
    this._indicator.menu.addMenuItem(this._metricItems.month);
    
    this._metricItems.year = new MetricToggleItem('Year', '𝗬', this._settings, 'show-year');
    this._indicator.menu.addMenuItem(this._metricItems.year);
    
    this._metricItems.life = new MetricToggleItem('Life', '𝗟', this._settings, 'show-life');
    this._indicator.menu.addMenuItem(this._metricItems.life);
    
    this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    
    // Event countdown - use custom item for center alignment
    const countdownContainer = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
      style_class: 'memento-mori-countdown',
    });
    this._countdownLabel = new St.Label({
      text: '',
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
    });
    countdownContainer.add_child(this._countdownLabel);
    this._countdownItem = countdownContainer;
    this._indicator.menu.addMenuItem(this._countdownItem);
    
    this._indicator.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    
    // Action buttons
    const actionsItem = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
      style_class: 'memento-mori-actions',
    });
    
    const actionsBox = new St.BoxLayout({
      style_class: 'memento-mori-actions-box',
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
    });
    
    const refreshButton = new St.Button({
      label: '🔄 Refresh',
      style_class: 'memento-mori-action-button',
    });
    refreshButton.connect('clicked', () => {
      this._updateDisplay();
    });
    actionsBox.add_child(refreshButton);
    
    const settingsButton = new St.Button({
      label: '⚙️ Settings',
      style_class: 'memento-mori-action-button',
    });
    settingsButton.connect('clicked', () => {
      this._indicator.menu.close();
      this.openPreferences();
    });
    actionsBox.add_child(settingsButton);
    
    actionsItem.add_child(actionsBox);
    this._indicator.menu.addMenuItem(actionsItem);
  }
  
  _addToPanel() {
    const position = this._settings.get_int('panel-position');
    const positions = ['left', 'center', 'right'];
    Main.panel.addToStatusArea('memento-mori', this._indicator, 1, positions[position]);
  }
  
  _repositionIndicator() {
    // Remove and re-add to panel at new position
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = new PanelMenu.Button(0.0, 'Memento Mori', false);
      
      // Recreate panel structure
      this._panelBox = new St.BoxLayout({
        style_class: 'memento-mori-panel-box',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._indicator.add_child(this._panelBox);
      
      this._hourglassLabel = new St.Label({
        text: '⏳ ',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._panelBox.add_child(this._hourglassLabel);
      
      this._metricLabels = {};
      const metricKeys = ['day', 'week', 'month', 'year', 'life'];
      for (const key of metricKeys) {
        this._metricLabels[key] = new St.Label({
          text: '',
          y_align: Clutter.ActorAlign.CENTER,
        });
        this._panelBox.add_child(this._metricLabels[key]);
      }
      
      this._placeholderLabel = new St.Label({
        text: 'memento mori.',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._panelBox.add_child(this._placeholderLabel);
      
      this._buildMenu();
      this._addToPanel();
      this._updateDisplay();
    }
  }
  
  _updateDisplay() {
    const configured = this._settings.get_boolean('configured');
    
    if (!configured) {
      // Show placeholder, hide all metrics
      this._placeholderLabel.visible = true;
      for (const key in this._metricLabels) {
        this._metricLabels[key].text = '';
        this._metricLabels[key].visible = false;
      }
      this._countdownLabel.text = 'Configure in settings to start tracking';
      return;
    }
    
    // Hide placeholder when configured
    this._placeholderLabel.visible = false;
    
    const birthYear = this._settings.get_int('birth-year');
    const birthMonth = this._settings.get_int('birth-month');
    const birthDay = this._settings.get_int('birth-day');
    const lifeExpectancy = this._settings.get_int('life-expectancy');
    
    const progress = calculateAllProgress(birthYear, birthMonth, birthDay, lifeExpectancy);
    
    // Update panel label
    this._updatePanelLabel(progress);
    
    // Update dropdown menu items
    this._updateDropdownItems(progress);
    
    // Update countdown
    this._updateCountdown();
  }
  
  _updatePanelLabel(progress) {
    const panelFormat = this._settings.get_int('panel-format');
    const colorCodeLife = this._settings.get_boolean('color-code-life');
    const colorCodeDay = this._settings.get_boolean('color-code-day');
    
    const metrics = [
      { key: 'day', symbol: '𝗗', showKey: 'show-day', leftKey: 'show-left-day' },
      { key: 'week', symbol: '𝗪', showKey: 'show-week', leftKey: 'show-left-week' },
      { key: 'month', symbol: '𝗠', showKey: 'show-month', leftKey: 'show-left-month' },
      { key: 'year', symbol: '𝗬', showKey: 'show-year', leftKey: 'show-left-year' },
      { key: 'life', symbol: '𝗟', showKey: 'show-life', leftKey: 'show-left-life' },
    ];
    
    let isFirst = true;
    let anyVisible = false;
    
    // Check if we're in "time left" mode - add prefix indicator
    if (panelFormat === 1) {
      // Find if any metrics are visible
      for (const metric of metrics) {
        if (this._settings.get_boolean(metric.showKey)) {
          anyVisible = true;
          break;
        }
      }
      if (anyVisible) {
        this._hourglassLabel.text = '⏳ (time left) ';
      } else {
        this._hourglassLabel.text = '⏳ ';
      }
    } else {
      this._hourglassLabel.text = '⏳ ';
    }
    
    for (const metric of metrics) {
      const label = this._metricLabels[metric.key];
      const isVisible = this._settings.get_boolean(metric.showKey);
      
      if (!isVisible) {
        label.text = '';
        label.visible = false;
        label.style_class = '';
        continue;
      }
      
      label.visible = true;
      anyVisible = true;
      
      const data = progress[metric.key];
      let text = '';
      
      // Add separator if not first
      if (!isFirst) {
        text = ' · ';
      }
      isFirst = false;
      
      // Build text based on panel format
      if (panelFormat === 0) {
        // Percentage mode
        text += `${metric.symbol} ${data.percent}%`;
        
        // Add optional suffix if enabled
        if (this._settings.get_boolean(metric.leftKey)) {
          text += ` (${data.leftText})`;
        }
      } else {
        // Time Left mode: show just the time left value
        text += `${metric.symbol} ${data.left}${data.unit}`;
      }
      
      label.text = text;
      
      // Apply color coding
      if (metric.key === 'life' && colorCodeLife) {
        label.style_class = getLifeColorClass(progress.life.percent);
      } else if (metric.key === 'day' && colorCodeDay) {
        label.style_class = getDayColorClass(progress.day.percent);
      } else {
        label.style_class = '';
      }
    }
    
    // If no metrics visible, show just hourglass
    if (!anyVisible) {
      this._hourglassLabel.text = '⏳';
    }
  }
  
  _updateDropdownItems(progress) {
    const format = this._settings.get_int('dropdown-format');
    
    for (const key of ['day', 'week', 'month', 'year', 'life']) {
      const data = progress[key];
      let displayText;
      
      switch (format) {
        case 0: // Percentage
          displayText = `${data.percent}%`;
          break;
        case 1: // Ratio
          displayText = data.ratioText;
          break;
        case 2: // Left
          displayText = data.leftText;
          break;
        default:
          displayText = `${data.percent}%`;
      }
      
      this._metricItems[key].updateProgress(data.percent, displayText);
    }
  }
  
  _updateCountdown() {
    const countdownType = this._settings.get_int('countdown-type');
    
    if (countdownType === 0) {
      // None
      this._countdownLabel.text = '';
      this._countdownItem.visible = false;
      return;
    }
    
    this._countdownItem.visible = true;
    
    if (countdownType === 1) {
      // Birthday
      const birthMonth = this._settings.get_int('birth-month');
      const birthDay = this._settings.get_int('birth-day');
      
      if (birthMonth === 0 || birthDay === 0) {
        this._countdownLabel.text = 'Set your full birth date for birthday countdown';
        return;
      }
      
      const days = getDaysUntilEvent(birthMonth, birthDay);
      if (days === 0) {
        this._countdownLabel.text = '🎂 Happy Birthday! 🎉';
      } else {
        this._countdownLabel.text = `🎂 ${days} days until your birthday! 🎉`;
      }
    } else if (countdownType === 2) {
      // Custom event
      const eventMonth = this._settings.get_int('custom-event-month');
      const eventDay = this._settings.get_int('custom-event-day');
      const eventText = this._settings.get_string('custom-event-text');
      
      const days = getDaysUntilEvent(eventMonth, eventDay);
      const displayText = eventText.replace('{days}', days.toString());
      this._countdownLabel.text = displayText;
    }
  }
  
  _checkNotifications() {
    if (!this._settings.get_boolean('enable-notifications')) return;
    
    const notified = this._settings.get_strv('notified-milestones');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    // Quarterly notifications (Jan 1, Apr 1, Jul 1, Oct 1)
    if (this._settings.get_boolean('notify-quarterly')) {
      const quarterStarts = [
        { month: 1, day: 1, quarter: 'Q1' },
        { month: 4, day: 1, quarter: 'Q2' },
        { month: 7, day: 1, quarter: 'Q3' },
        { month: 10, day: 1, quarter: 'Q4' },
      ];
      
      for (const q of quarterStarts) {
        if (currentMonth === q.month && currentDay === q.day) {
          const key = `quarterly-${currentYear}-${q.quarter}`;
          if (!notified.includes(key)) {
            const percent = Math.floor(((q.month - 1) / 12) * 100);
            this._notify(`${q.quarter} starts!`, `${percent}% of ${currentYear} complete.`);
            this._settings.set_strv('notified-milestones', [...notified, key]);
          }
        }
      }
    }
    
    // Birthday notification
    if (this._settings.get_boolean('notify-birthday')) {
      const birthMonth = this._settings.get_int('birth-month');
      const birthDay = this._settings.get_int('birth-day');
      
      if (birthMonth !== 0 && birthDay !== 0) {
        if (currentMonth === birthMonth && currentDay === birthDay) {
          const key = `birthday-${currentYear}`;
          if (!notified.includes(key)) {
            this._notify('Happy Birthday! 🎂', 'Wishing you a wonderful day!');
            this._settings.set_strv('notified-milestones', [...notified, key]);
          }
        }
      }
    }
  }
  
  _notify(title, body) {
    const style = this._settings.get_int('notification-style');
    // For now, just use Main.notify. Sound could be added for prominent style.
    Main.notify(`Memento Mori: ${title}`, body);
  }
  
  disable() {
    if (this._timeout) {
      GLib.Source.remove(this._timeout);
      this._timeout = null;
    }
    
    if (this._settingsChangedIds) {
      for (const id of this._settingsChangedIds) {
        this._settings.disconnect(id);
      }
      this._settingsChangedIds = null;
    }
    
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
    
    this._panelBox = null;
    this._hourglassLabel = null;
    this._metricLabels = null;
    this._placeholderLabel = null;
    this._metricItems = null;
    this._countdownItem = null;
    this._countdownLabel = null;
    this._settings = null;
  }
}