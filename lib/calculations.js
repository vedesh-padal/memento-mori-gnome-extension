/* lib/calculations.js
 * Time and progress calculation utilities
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// ============================================================================
// Time Calculation Helpers
// ============================================================================

export function getSecondsInYear(year) {
  const daysInYear = (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
  return daysInYear * 24 * 60 * 60;
}

export function getDaysInYear(year) {
  return (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
}

export function getSecondsInMonth(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  return daysInMonth * 24 * 60 * 60;
}

export function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

// ============================================================================
// Progress Calculations
// ============================================================================

export function calculateAllProgress(birthYear, birthMonth, birthDay, lifeExpectancy) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Day progress
  const secondsInDay = 24 * 60 * 60;
  const secondsElapsedToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayPercent = Math.floor((secondsElapsedToday / secondsInDay) * 100);
  const dayHoursElapsed = Math.floor(secondsElapsedToday / 3600);
  const dayHoursLeft = 24 - dayHoursElapsed;

  // Week progress (week starts on Sunday)
  const dayOfWeek = now.getDay();
  const secondsInWeek = 7 * 24 * 60 * 60;
  const secondsElapsedThisWeek = dayOfWeek * 24 * 3600 + secondsElapsedToday;
  const weekPercent = Math.floor((secondsElapsedThisWeek / secondsInWeek) * 100);
  const weekDaysElapsed = dayOfWeek;
  const weekDaysLeft = 7 - dayOfWeek;

  // Month progress
  const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1);
  const secondsElapsedThisMonth = (now - firstDayOfMonth) / 1000;
  const totalSecondsInMonth = getSecondsInMonth(currentMonth, currentYear);
  const monthPercent = Math.floor((secondsElapsedThisMonth / totalSecondsInMonth) * 100);
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const monthDaysElapsed = now.getDate();
  const monthDaysLeft = daysInMonth - monthDaysElapsed;

  // Year progress
  const firstDayOfYear = new Date(currentYear, 0, 1);
  const secondsElapsedThisYear = (now - firstDayOfYear) / 1000;
  const totalSecondsInYear = getSecondsInYear(currentYear);
  const yearPercent = Math.floor((secondsElapsedThisYear / totalSecondsInYear) * 100);
  const daysInYear = getDaysInYear(currentYear);
  const yearDayNumber = Math.floor(secondsElapsedThisYear / 86400) + 1;
  const yearDaysLeft = daysInYear - yearDayNumber;

  // Life progress
  const birthDate = new Date(birthYear, (birthMonth || 1) - 1, birthDay || 1);
  const secondsLived = (now - birthDate) / 1000;
  const totalLifeSeconds = lifeExpectancy * 365.25 * 24 * 60 * 60;
  const lifePercent = Math.floor((secondsLived / totalLifeSeconds) * 100);
  const yearsLived = Math.floor(secondsLived / (365.25 * 24 * 60 * 60));
  const yearsLeft = lifeExpectancy - yearsLived;

  return {
    day: {
      percent: dayPercent,
      elapsed: dayHoursElapsed,
      left: dayHoursLeft,
      total: 24,
      unit: 'h',
      ratioText: `${dayHoursElapsed}h / 24h`,
      leftText: `${dayHoursLeft}h left`,
    },
    week: {
      percent: weekPercent,
      elapsed: weekDaysElapsed,
      left: weekDaysLeft,
      total: 7,
      unit: 'd',
      ratioText: `${weekDaysElapsed}d / 7d`,
      leftText: `${weekDaysLeft}d left`,
    },
    month: {
      percent: monthPercent,
      elapsed: monthDaysElapsed,
      left: monthDaysLeft,
      total: daysInMonth,
      unit: 'd',
      ratioText: `${monthDaysElapsed}d / ${daysInMonth}d`,
      leftText: `${monthDaysLeft}d left`,
    },
    year: {
      percent: yearPercent,
      elapsed: yearDayNumber,
      left: yearDaysLeft,
      total: daysInYear,
      unit: 'd',
      ratioText: `Day ${yearDayNumber} / ${daysInYear}`,
      leftText: `${yearDaysLeft}d left`,
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
// Days Until Event
// ============================================================================

export function getDaysUntilEvent(month, day) {
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
// Display Helpers
// ============================================================================

export function createProgressBar(percent, width = 10) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

export function getLifeColorClass(percent) {
  if (percent <= 33) return 'memento-mori-life-green';
  if (percent <= 66) return 'memento-mori-life-yellow';
  return 'memento-mori-life-red';
}

export function getDayColorClass(percent) {
  if (percent <= 50) return 'memento-mori-life-green';
  if (percent <= 75) return 'memento-mori-life-yellow';
  return 'memento-mori-life-red';
}
