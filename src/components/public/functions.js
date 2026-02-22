import { getPublicEntitiesBySql } from '@/services/httpEntities.js'
export async function fetch(sql, signal, param = null, paramValue = null) {
  const { data: res } = await getPublicEntitiesBySql(sql, signal, param, paramValue)
  if (res.statusCode === 200) return res.data
}
export async function openPdf(docUrl) {
  const res = await globalThis.fetch(docUrl) //native js fetch method
  const buffer = await res.arrayBuffer()
  const blob = new Blob([buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
