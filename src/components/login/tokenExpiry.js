import { toastWarning, closeToast } from '@/composable/toast.js'
import { useFormatDate } from '@/composable/useFormatDate.js'
export function setUpTokenExpiry(t, exp, router) {
  const { formatTime } = useFormatDate()
  setTimeout(
    () => {
      const msg = `${t(t('comps.login.token_expiry.warning'))} ${formatTime(new Date(Date.now() + 5 * 60 * 1000))}`
      toastWarning(msg, 'persistent', true)
    },
    exp * 1000 - Date.now() - 5 * 60 * 1000,
  )
  setTimeout(
    () => {
      closeToast() //close previous persistent toast
      toastWarning(t('comps.login.token_expiry.error'), 'persistent')
      router.push({ name: 'public home' })
    },
    exp * 1000 - Date.now(),
  )
}
