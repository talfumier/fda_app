import cookies from 'js-cookie'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { decodeJWT } from '@/services/httpUsers.js'

export function useCookieRef(name) {
  const token = ref(cookies.get(name) ?? null)
  const decoded = computed(() => {
    return token.value ? decodeJWT(token.value) : null
  })

  let timer = null
  const read = () => cookies.get(name) ?? null

  function set(val, options) {
    cookies.set(name, val, options)
    token.value = val
  }
  function remove() {
    cookies.remove(name)
    token.value = null
  }
  onMounted(() => {
    // poll for changes (including expiry/removal by the browser)
    timer = setInterval(() => {
      const v = read()
      if (v !== token.value) token.value = v
    }, 1000)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })
  return { token, decoded, read, set, remove }
}
