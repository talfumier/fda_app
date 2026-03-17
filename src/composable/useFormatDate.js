import { date as qdate } from 'quasar'
export function useFormatDate() {
  const DEFAULT_DATE = 'DD/MM/YYYY'
  const DEFAULT_DATETIME = 'DD/MM/YYYY HH:mm'
  const DEFAULT_TIME = 'HH:mm'
  function format(d, mask = DEFAULT_DATE) {
    const safeDate = toSafeDate(d)
    if (!safeDate) return ''
    return qdate.formatDate(safeDate, mask)
  }
  function formatDate(d, mask = DEFAULT_DATE) {
    return format(d, mask)
  }
  function formatDateTime(d, mask = DEFAULT_DATETIME) {
    return format(d, mask)
  }
  function formatTime(d, mask = DEFAULT_TIME) {
    return format(d, mask)
  }
  const dateTimeFormat = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }
  const dateFormat = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  function toSafeDate(value) {
    if (!value) return null
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }
    if (typeof value === 'number') {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? null : d
    }
    if (typeof value !== 'string') return null
    let normalized = value.trim()
    if (!normalized) return null
    // Safari often fails on "YYYY-MM-DD HH:mm:ss"
    // Convert space separator to ISO-like "T"
    normalized = normalized.replace(' ', 'T')
    // Safari can also dislike timezone-less strings with seconds in some cases.
    // Leave full ISO strings intact, but only normalize when needed.
    const d = new Date(normalized)
    if (!Number.isNaN(d.getTime())) return d
    // Fallback for plain dates like YYYY-MM-DD
    const plainDateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (plainDateMatch) {
      const [, y, m, day] = plainDateMatch
      const fallbackDate = new Date(Number(y), Number(m) - 1, Number(day))
      return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate
    }
    return null
  }

  function formatLocalDate(value, locale = 'fr', fmt = 'df') {
    const safeDate = toSafeDate(value)
    if (!safeDate) return ''
    try {
      const formatter = new Intl.DateTimeFormat(locale, fmt === 'dtf' ? dateTimeFormat : dateFormat)
      const dt = formatter.formatToParts(safeDate)
      const parts = Object.fromEntries(dt.map((p) => [p.type, p.value]))
      switch (locale) {
        case 'fr':
          return (
            (parts.weekday ? parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1) : '') +
            `${parts.day ? ` ${parts.day}` : ''}` +
            `${parts.month ? ` ${parts.month}` : ''}` +
            `${fmt === 'dtf' && parts.hour ? ` à ${parts.hour}${parts.minute ? `h${parts.minute}` : ''}` : ''}`
          ).trim()
        case 'en':
          return (
            `${parts.weekday ?? ''}` +
            `${parts.day ? `, ${parts.day}` : ''}` +
            `${parts.month ? ` ${parts.month}` : ''}` +
            `${parts.year ? ` ${parts.year}` : ''}` +
            `${
              fmt === 'dtf' && parts.hour
                ? ` at ${parts.hour}${parts.minute ? `:${parts.minute}` : ''}${parts.dayPeriod ? ` ${parts.dayPeriod.toLowerCase()}` : ''}`
                : ''
            }`
          ).trim()
        default:
          return formatter.format(safeDate)
      }
    } catch (error) {
      console.error('formatLocalDate failed in useFormatDate.js', value, error)
      return ''
    }
  }
  return { format, formatDate, formatDateTime, formatTime, formatLocalDate }
}
