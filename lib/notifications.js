/* lib/notifications.js
 * Notification handling for the extension
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

// ============================================================================
// Notification Handler
// ============================================================================

export function notify(settings, title, body) {
  const style = settings.get_int('notification-style');
  // For now, just use Main.notify. Sound could be added for prominent style.
  Main.notify(`Memento Mori: ${title}`, body);
}

// ============================================================================
// Check and Send Notifications
// ============================================================================

export function checkNotifications(settings) {
  if (!settings.get_boolean('enable-notifications')) return;
  
  const notified = settings.get_strv('notified-milestones');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  // Quarterly notifications (Jan 1, Apr 1, Jul 1, Oct 1)
  if (settings.get_boolean('notify-quarterly')) {
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
          notify(settings, `${q.quarter} starts!`, `${percent}% of ${currentYear} complete.`);
          settings.set_strv('notified-milestones', [...notified, key]);
        }
      }
    }
  }
  
  // Birthday notification
  if (settings.get_boolean('notify-birthday')) {
    const birthMonth = settings.get_int('birth-month');
    const birthDay = settings.get_int('birth-day');
    
    if (birthMonth !== 0 && birthDay !== 0) {
      if (currentMonth === birthMonth && currentDay === birthDay) {
        const key = `birthday-${currentYear}`;
        if (!notified.includes(key)) {
          notify(settings, 'Happy Birthday! 🎂', 'Wishing you a wonderful day!');
          settings.set_strv('notified-milestones', [...notified, key]);
        }
      }
    }
  }
}
