import { Notify } from 'quasar'
export function toastSuccess(message, msgType = 'non-persistent') {
  switch (msgType) {
    case 'persistent':
      toastPersistent(message, 'positive', 'check')
      break
    case 'non-persistent':
      toast(message, 'positive', 'check')
  }
}
export function toastInfo(message, msgType = 'non-persistent') {
  switch (msgType) {
    case 'persistent':
      toastPersistent(message, 'primary', 'check')
      break
    case 'non-persistent':
      toast(message, 'primary', 'check')
  }
}
export function toastWarning(message, msgType = 'non-persistent') {
  switch (msgType) {
    case 'persistent':
      toastPersistent(message, 'warning', 'warning')
      break
    case 'non-persistent':
      toast(message, 'warning', 'warning')
  }
}
export function toastError(message, msgType = 'non-persistent') {
  switch (msgType) {
    case 'persistent':
      toastPersistent(message, 'negative', 'error')
    case 'non-persistent':
      toast(message, 'negative', 'error')
  }
}
function toastPersistent(message, color, icon) {
  Notify.create({
    message,
    icon,
    color,
    timeout: 0,
    spinner: true,
    actions: [{ label: 'Close', color: 'white' }],
  })
}
function toast(message, color = 'primary', icon = 'check', position = 'top-right', timeout = 2500) {
  // Give this toast a unique root class so we can reliably target it
  const uid = `q-notif-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const rootClass = `hoverable-${uid}`
  // Create as persistent; we'll dismiss via our own timer
  const handle = Notify.create({
    message,
    color,
    icon,
    position,
    timeout: 0, // keep it until we say so
    html: true,
    classes: rootClass, // attaches to the toast root element
  })
  // Get a dismiss function compatible with both Quasar return styles
  const dismiss =
    typeof handle === 'function'
      ? handle
      : handle && typeof handle.dismiss === 'function'
        ? () => handle.dismiss()
        : null

  if (!dismiss) return

  let remaining = timeout
  let start = Date.now()
  let timer = setTimeout(() => dismiss(), remaining)
  // Wait until the DOM node for THIS toast exists, then bind listeners to the whole toast
  waitForEl(`.${rootClass}`, 2000).then((el) => {
    if (!el) return
    // If the root’s inner content doesn’t fill the area, ensure it’s hoverable
    // (optional but helps on certain skins)
    el.style.pointerEvents = 'auto'

    el.addEventListener('mouseenter', () => {
      const elapsed = Date.now() - start
      remaining = Math.max(0, remaining - elapsed)
      clearTimeout(timer)
    })

    el.addEventListener('mouseleave', () => {
      if (remaining <= 0) {
        dismiss()
      } else {
        start = Date.now()
        timer = setTimeout(() => dismiss(), remaining)
      }
    })
  })
}
/**
 * Waits for a DOM element to appear (polls with rAF); resolves null if not found by deadline.
 */
function waitForEl(selector, maxMs = 1000) {
  return new Promise((resolve) => {
    const start = performance.now()
    const tick = () => {
      const el = document.querySelector(selector)
      if (el) return resolve(el)
      if (performance.now() - start > maxMs) return resolve(null)
      requestAnimationFrame(tick)
    }
    tick()
  })
}
