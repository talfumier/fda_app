import { environment } from '@/config/environment.js'

let bootstrapPromise = null

export function useGoogleMaps() {
  function bootstrap() {
    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = new Promise((resolve, reject) => {
      const g = { key: environment.google_api_key, v: 'weekly' }

      // Google's bootstrap snippet (split out for readability)
      const c = 'google',
        l = 'importLibrary',
        q = '__ib__'
      const b = window[c] || (window[c] = {})
      const d = b.maps || (b.maps = {})
      const r = new Set()
      const e = new URLSearchParams()

      const loadScript = () => {
        const script = document.createElement('script')
        for (const k in g)
          e.set(
            k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()),
            g[k],
          )
        e.set('callback', `${c}.maps.${q}`)
        script.src = `https://maps.${c}apis.com/maps/api/js?` + e
        d[q] = resolve
        script.onerror = () => reject(new Error('Google Maps could not load.'))
        document.head.appendChild(script)
      }

      if (d[l]) {
        resolve() // already loaded
      } else {
        d[l] = (f, ...n) => {
          r.add(f)
          return loadScript()
        }
        loadScript()
      }
    })

    return bootstrapPromise
  }

  async function importLibrary(name) {
    await bootstrap()
    return google.maps.importLibrary(name)
  }

  return { importLibrary }
}
