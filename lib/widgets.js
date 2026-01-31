/* lib/widgets.js
 * Custom UI widgets for the extension
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { createProgressBar } from './calculations.js';

// === Metric Toggle Menu Item ===
export const MetricToggleItem = GObject.registerClass(
class MetricToggleItem extends PopupMenu.PopupBaseMenuItem {
  _init(label, symbol, settings, settingKey, params) {
    super._init(params);
    
    this._settings = settings;
    this._settingKey = settingKey;
    
    this._check = new St.Icon({
      icon_name: 'emblem-ok-symbolic',
      style_class: 'popup-menu-icon',
    });
    this.add_child(this._check);
    
    this._symbol = new St.Label({
      text: symbol,
      style_class: 'memento-mori-metric-symbol',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this._symbol);
    
    this._label = new St.Label({
      text: label,
      style_class: 'memento-mori-metric-label',
      y_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
    });
    this.add_child(this._label);
    
    this._progressBar = new St.Label({
      text: '░░░░░░░░░░',
      style_class: 'memento-mori-progress-bar',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this._progressBar);
    
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
    return Clutter.EVENT_STOP;
  }
  
  updateProgress(percent, displayText) {
    this._progressBar.text = createProgressBar(percent);
    this._value.text = displayText;
  }
});
