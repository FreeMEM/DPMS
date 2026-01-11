/**
 * Date formatting utilities for consistent date display across the app
 */

/**
 * Format date string to localized short date (e.g., "15 ene 2025")
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting (default: 'es-ES')
 * @returns {string} Formatted date or '-' if invalid
 */
export const formatDate = (dateString, locale = 'es-ES') => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};

/**
 * Format date string to localized date with time (e.g., "15 de enero de 2025, 14:30")
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting (default: 'es-ES')
 * @returns {string} Formatted date/time or '-' if invalid
 */
export const formatDateTime = (dateString, locale = 'es-ES') => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * Format date string to relative time (e.g., "hace 2 días")
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale for formatting (default: 'es-ES')
 * @returns {string} Relative time string or '-' if invalid
 */
export const formatRelativeTime = (dateString, locale = 'es-ES') => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch {
    return '-';
  }
};
