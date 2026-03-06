import http from './httpService.js'
import { environment } from '@/config/environment.js'

const api = environment.api_url
export function downloadCatalogueZip(stored_proc, token, signal, params, paramsValues) {
  return http.get(`${api}/files/cloudinary-download-zip/${stored_proc}/${params}/${paramsValues}`, {
    headers: { 'x-auth-token': token },
    signal,
    responseType: 'blob',
  })
}
export function downloadCsv(stored_proc, filename, token, signal) {
  return http.get(`${api}/files/download-csv/${stored_proc}/${filename}`, {
    headers: { 'x-auth-token': token },
    signal,
    responseType: 'blob',
  })
}
export async function downloadCataloguePDF(token, signal, source, params, paramsValues) {
  return http.post(
    `${api}/catalogue`,
    { source, params, paramsValues },
    {
      headers: { 'x-auth-token': token },
      signal,
      responseType: 'blob',
    },
  )
}
