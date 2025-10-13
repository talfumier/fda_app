import { getEntities } from '@/services/httpEntities.js'
export let statusText = null
export async function loadStatus() {
  const ctrl = new AbortController() // AbortController's object' used in http request operation
  const { data: res } = await getEntities('Status', ctrl.signal)
  if (res.statusCode === 200) {
    ctrl.abort()
    const arr = res.data.map((item) => {
      const { type, createdAt, updatedAt, ...rest } = item
      return rest
    })
    statusText = arr.reduce((acc, item) => {
      acc[item.idStatus] = {
        idStatus: item.idStatus,
        status_fr: item.title_fr,
        status_en: item.title_en,
      }
      return acc
    }, {})
  }
}
