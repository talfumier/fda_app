import { date as qdate } from 'quasar'
export function useFormatDate() {
  const DEFAULT_DATE = 'DD/MM/YYYY'
  const DEFAULT_DATETIME = 'DD/MM/YYYY HH:mm'

  function format(d, mask = DEFAULT_DATE) {
    return qdate.formatDate(d, mask)
  }

  function formatDate(d, mask = DEFAULT_DATE) {
    return format(d, mask)
  }

  function formatDateTime(d, mask = DEFAULT_DATETIME) {
    return format(d, mask)
  }
  return { format, formatDate, formatDateTime }
}
