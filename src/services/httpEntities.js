import http from './httpService.js'
import { environment } from '@/config/environment.js'

const api = environment.api_url
export function getEntities(entity, signal) {
  return http.get(`${api}/entities/${entity}`, {
    signal,
  })
}
export function getEntitiesBySql(stored_proc, token, signal, params, paramsValues) {
  if (!params)
    return http.get(`${api}/sql-entities/noparams/${stored_proc}`, {
      headers: { 'x-auth-token': token },
      signal,
    })
  return http.get(`${api}/sql-entities/${stored_proc}/${params}/${paramsValues}`, {
    headers: { 'x-auth-token': token },
    signal,
  })
}
export function getPublicEntitiesBySql(stored_proc, signal, params, paramsValues) {
  if (!params)
    return http.get(`${api}/sql-entities/public/noparams/${stored_proc}`, {
      signal,
    })
  return http.get(`${api}/sql-entities/public/${stored_proc}/${params}/${paramsValues}`, {
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
export function getEntityFields(entity, token, signal) {
  return http.get(`${api}/utilities/fields/${entity}`, {
    headers: { 'x-auth-token': token },
    signal,
  })
}
