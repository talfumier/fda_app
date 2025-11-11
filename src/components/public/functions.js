import { getEntitiesBySql } from '@/services/httpEntities.js'
import { environment } from '@/config/environment.js'
export async function fetch(sql, signal, param = null, paramValue = null) {
  const { data: res } = await getEntitiesBySql(
    sql,
    environment.public_token,
    signal,
    param,
    paramValue,
  )
  if (res.statusCode === 200) return res.data
}
