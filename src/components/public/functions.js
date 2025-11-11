import { getPublicEntitiesBySql } from '@/services/httpEntities.js'
export async function fetch(sql, signal, param = null, paramValue = null) {
  const { data: res } = await getPublicEntitiesBySql(sql, signal, param, paramValue)
  if (res.statusCode === 200) return res.data
}
