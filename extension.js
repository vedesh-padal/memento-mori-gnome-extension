/* extension.js
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Import from local modules
import {
  calculateAllProgress,
  getDaysUntilEvent,
  getLifeColorClass,
  getDayColorClass,
} from './lib/calculations.js';
import { MetricToggleItem } from './lib/widgets.js';

// ============================================================================
// Main Extension Class
// ============================================================================

export default class MementoMoriExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    // Panel indicator
    this._indicator = new PanelMenu.Button(0.0, 'Memento Mori', false);
    
    // Panel container - BoxLayout to hold per-metric labels
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
    
    this._buildMenu();
    this._addToPanel(); // Add to panel at configured position
    
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
    
    // Event countdown container
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
    refreshButton.connect('clicked', () => this._updateDisplay());
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
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = new PanelMenu.Button(0.0, 'Memento Mori', false);
      
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
      this._placeholderLabel.visible = true;
      for (const key in this._metricLabels) {
        this._metricLabels[key].text = '';
        this._metricLabels[key].visible = false;
      }
      this._countdownLabel.text = 'Configure in settings to start tracking';
      return;
    }
    
    this._placeholderLabel.visible = false;
    
    const birthYear = this._settings.get_int('birth-year');
    const birthMonth = this._settings.get_int('birth-month');
    const birthDay = this._settings.get_int('birth-day');
    const lifeExpectancy = this._settings.get_int('life-expectancy');
    
    const progress = calculateAllProgress(birthYear, birthMonth, birthDay, lifeExpectancy);
    
    this._updatePanelLabel(progress);
    this._updateDropdownItems(progress);
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
      for (const metric of metrics) {
        if (this._settings.get_boolean(metric.showKey)) {
          anyVisible = true;
          break;
        }
      }
      this._hourglassLabel.text = anyVisible ? '⏳ (time left) ' : '⏳ ';
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
      let text = isFirst ? '' : ' · ';
      isFirst = false;
      
      // Build text based on panel format
      if (panelFormat === 0) {
        text += `${metric.symbol} ${data.percent}%`;
        if (this._settings.get_boolean(metric.leftKey)) {
          text += ` (${data.leftText})`;
        }
      } else {
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
        case 0: displayText = `${data.percent}%`; break;
        case 1: displayText = data.ratioText; break;
        case 2: displayText = data.leftText; break;
        default: displayText = `${data.percent}%`;
      }
      
      this._metricItems[key].updateProgress(data.percent, displayText);
    }
  }
  
  _updateCountdown() {
    const countdownType = this._settings.get_int('countdown-type');
    
    if (countdownType === 0) {
      this._countdownLabel.text = '';
      this._countdownItem.visible = false;
      return;
    }
    
    this._countdownItem.visible = true;
    
    if (countdownType === 1) {
      const birthMonth = this._settings.get_int('birth-month');
      const birthDay = this._settings.get_int('birth-day');
      
      if (birthMonth === 0 || birthDay === 0) {
        this._countdownLabel.text = 'Set your full birth date for birthday countdown';
        return;
      }
      
      const days = getDaysUntilEvent(birthMonth, birthDay);
      this._countdownLabel.text = days === 0
        ? '🎂 Happy Birthday! 🎉'
        : `🎂 ${days} days until your birthday! 🎉`;
    } else if (countdownType === 2) {
      const eventMonth = this._settings.get_int('custom-event-month');
      const eventDay = this._settings.get_int('custom-event-day');
      const eventText = this._settings.get_string('custom-event-text');
      
      const days = getDaysUntilEvent(eventMonth, eventDay);
      this._countdownLabel.text = eventText.replace('{days}', days.toString());
    }
  }
  
  _checkNotifications() {
    if (!this._settings.get_boolean('enable-notifications')) return;
    
    const notified = this._settings.get_strv('notified-milestones');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
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
            Main.notify(`Memento Mori: ${q.quarter} starts!`, `${percent}% of ${currentYear} complete.`);
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
            Main.notify('Memento Mori: Happy Birthday! 🎂', 'Wishing you a wonderful day!');
            this._settings.set_strv('notified-milestones', [...notified, key]);
          }
        }
      }
    }
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