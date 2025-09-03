import http from './httpService.js'

const api = 'http://localhost:3000/api'

export function getEntities(entity, signal) {
  return http.get(`${api}/entities/${entity}`, {
    signal,
  })
}
export function getEntitiesBySql(stored_proc, params, paramsValues, token, signal) {
  return http.get(`${api}/sql-entities/${stored_proc}/${params}/${paramsValues}`, {
    headers: { 'x-auth-token': token },
    signal,
  })
}
export function getEntity(entity, id, signal) {
  return http.get(`${api}/entities/${entity}/${id}`, {
    signal,
  })
}
export function patchEntity(entity, id, data, token, signal) {
  return http.patch(`${api}/entities/${entity}/${id}`, data, {
    headers: { 'x-auth-token': token },
    signal,
  })
}
export function postEntity(entity, data, token, signal) {
  return http.post(`${api}/entities/${entity}`, data, {
    headers: { 'x-auth-token': token },
    signal,
  })
}
export function deleteEntity(entity, id, token, signal) {
  return http.delete(`${api}/entities/${entity}/${id}`, {
    headers: { 'x-auth-token': token },
    signal,
  })
}
