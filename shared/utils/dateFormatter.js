/**
 * Comprehensive Date Formatting Utility
 * Provides centralized date formatting functions with multiple options
 */

// Default locale and timezone
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Main date formatting function with multiple format options
 * @param {string|Date} dateInput - Date string or Date object
 * @param {string} format - Format type ('short', 'long', 'iso', 'custom', 'relative')
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, format = 'short', options = {}) {
  if (!dateInput) return options.fallback || 'N/A';

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return options.fallback || 'Invalid Date';
    }

    const locale = options.locale || DEFAULT_LOCALE;
    const timezone = options.timezone || DEFAULT_TIMEZONE;

    switch (format) {
    case 'short':
      return formatDateShort(date, locale, timezone);
    case 'long':
      return formatDateLong(date, locale, timezone);
    case 'iso':
      return date.toISOString();
    case 'custom':
      return formatDateCustom(date, options.pattern || 'dd/MM/yyyy');
    case 'relative':
      return formatDateRelative(date, locale);
    case 'time':
      return formatTimeOnly(date, locale, timezone);
    case 'datetime':
      return formatDateTime(date, locale, timezone);
    default:
      return formatDateShort(date, locale, timezone);
    }
  } catch (error) {
    return options.fallback || dateInput.toString();
  }
}

/**
 * Format date in short format (DD/MM/YYYY)
 * @param {Date} date - Date object
 * @param {string} locale - Locale string
 * @param {string} timezone - Timezone string
 * @returns {string} Formatted date
 */
export function formatDateShort(date, locale = DEFAULT_LOCALE, timezone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: timezone
  }).format(date);
}

/**
 * Format date in long format (January 1, 2024)
 * @param {Date} date - Date object
 * @param {string} locale - Locale string
 * @param {string} timezone - Timezone string
 * @returns {string} Formatted date
 */
export function formatDateLong(date, locale = DEFAULT_LOCALE, timezone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone
  }).format(date);
}

/**
 * Format date and time together
 * @param {Date} date - Date object
 * @param {string} locale - Locale string
 * @param {string} timezone - Timezone string
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date, locale = DEFAULT_LOCALE, timezone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  }).format(date);
}

/**
 * Format time only (HH:MM)
 * @param {Date} date - Date object
 * @param {string} locale - Locale string
 * @param {string} timezone - Timezone string
 * @returns {string} Formatted time
 */
export function formatTimeOnly(date, locale = DEFAULT_LOCALE, timezone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  }).format(date);
}

/**
 * Custom date formatting with pattern support
 * @param {Date} date - Date object
 * @param {string} pattern - Date pattern (dd/MM/yyyy, MM-dd-yyyy, etc.)
 * @returns {string} Formatted date
 */
export function formatDateCustom(date, pattern = 'dd/MM/yyyy') {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return pattern
    .replace(/yyyy/g, year)
    .replace(/yy/g, year.toString().slice(-2))
    .replace(/MM/g, month)
    .replace(/dd/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
}

/**
 * Format date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date} date - Date object
 * @param {string} locale - Locale string
 * @returns {string} Relative time string
 */
export function formatDateRelative(date, locale = DEFAULT_LOCALE) {
  try {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDateShort(date, locale);
    }
  } catch (error) {
    return date.toString();
  }
}

/**
 * Calculate duration between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} unit - Unit for duration ('ms', 'seconds', 'minutes', 'hours', 'days')
 * @returns {number} Duration in specified unit
 */
export function calculateDuration(startDate, endDate, unit = 'hours') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();

  switch (unit) {
  case 'ms':
    return diffMs;
  case 'seconds':
    return Math.floor(diffMs / 1000);
  case 'minutes':
    return Math.floor(diffMs / (1000 * 60));
  case 'hours':
    return Math.floor(diffMs / (1000 * 60 * 60));
  case 'days':
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  default:
    return Math.floor(diffMs / (1000 * 60 * 60));
  }
}

/**
 * Format duration in human-readable format
 * @param {number} durationMs - Duration in milliseconds
 * @param {Object} options - Formatting options
 * @returns {string} Formatted duration
 */
export function formatDuration(durationMs, options = {}) {
  if (!durationMs || durationMs < 0) return options.fallback || '0 minutes';

  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];

  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 > 1 ? 's' : ''}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`);

  if (parts.length === 0) {
    return 'Less than a minute';
  }

  if (options.short) {
    return parts[0]; // Return only the largest unit
  }

  return parts.slice(0, 2).join(', '); // Return up to 2 units
}

/**
 * Check if a date is valid
 * @param {any} date - Date to validate
 * @returns {boolean} True if valid date
 */
export function isValidDate(date) {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Get current timestamp in various formats
 * @param {string} format - Format type ('iso', 'unix', 'ms')
 * @returns {string|number} Timestamp
 */
export function getCurrentTimestamp(format = 'iso') {
  const now = new Date();

  switch (format) {
  case 'unix':
    return Math.floor(now.getTime() / 1000);
  case 'ms':
    return now.getTime();
  case 'iso':
  default:
    return now.toISOString();
  }
}

/**
 * Parse various date formats into Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;

  try {
    // Try ISO format first
    if (dateString.includes('T') || dateString.includes('Z')) {
      return new Date(dateString);
    }

    // Try common formats
    const date = new Date(dateString);
    if (isValidDate(date)) {
      return date;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Legacy compatibility functions
export { formatDateCustom as formatDateCustomLegacy };
export { formatDateShort as formatDateDefault };

// Export all functions as default object for convenience
export default {
  formatDate,
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatTimeOnly,
  formatDateCustom,
  formatDateRelative,
  calculateDuration,
  formatDuration,
  isValidDate,
  getCurrentTimestamp,
  parseDate
};