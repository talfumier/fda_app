import { getEntities } from '@/services/httpEntities.js'
export let statusText = null
export let artistPartnerOnly = null
export async function loadGlobals() {
  const ctrl = new AbortController() // AbortController's object' used in http request operation
  try {
    const { data: res1 } = await getEntities('Status', ctrl.signal)
    if (res1.statusCode === 200) {
      const arr = res1.data.map((item) => {
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
    const { data: res2 } = await getEntities('Admin', ctrl.signal)
    if (res2.statusCode === 200) artistPartnerOnly = res2.data[0].artistPartnerOnly
  } catch (error) {
  } finally {
    ctrl.abort()
  }
}
export function setGlobals(cs, val) {
  switch (cs) {
    case 'Admin':
      artistPartnerOnly = val
  }
}
