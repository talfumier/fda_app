import cookies from 'js-cookie'
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useCookieRef(name, intervalMs = 1000) {
  const value = ref(cookies.get(name) ?? null)
  let timer

  const read = () => cookies.get(name) ?? null

  function set(val, options) {
    cookies.set(name, val, options)
    value.value = val
  }
  function remove() {
    cookies.remove(name)
    value.value = null
  }
  onMounted(() => {
    // poll for changes (including expiry/removal by the browser)
    timer = setInterval(() => {
      const v = read()
      if (v !== value.value) value.value = v
    }, intervalMs)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })
  return { value, read, set, remove }
}
