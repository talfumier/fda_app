import { date as qdate } from 'quasar'
export function useFormatDate() {
  const DEFAULT_DATE = 'DD/MM/YYYY'
  const DEFAULT_DATETIME = 'DD/MM/YYYY HH:mm'
  const DEFAULT_TIME = 'HH:mm'

  function format(d, mask = DEFAULT_DATE) {
    return qdate.formatDate(d, mask)
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
  const date_time_format = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: undefined,
  }
  const date_format = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  function formatLocalDate(date, locale, fmt) {
    const dt = new Intl.DateTimeFormat(
      locale,
      fmt === 'dtf' ? date_time_format : date_format,
    ).formatToParts(new Date(date))
    const parts = Object.fromEntries(dt.map((p) => [p.type, p.value]))
    switch (locale) {
      case 'fr':
        return (
          parts.weekday.charAt(0).toUpperCase() +
          parts.weekday.slice(1) +
          ` ${parts.day} ${parts.month} ${fmt === 'dtf' ? 'à ' + parts.hour + 'h' : ''}`
        )
      case 'en':
        return (
          parts.weekday +
          `, ${parts.day} ${parts.month} ${fmt === 'dtf' ? 'at ' + parts.hour + ' ' + parts.dayPeriod?.toLowerCase() : ''}`
        )
    }
  }
  return { format, formatDate, formatDateTime, formatTime, formatLocalDate }
}
