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
export function downloadCsv(stored_proc, idExpo, filename, token, signal) {
  //idExpo=-1 > all idExpo
  return http.get(`${api}/files/download-csv/${stored_proc}/${idExpo}/${filename}`, {
    headers: { 'x-auth-token': token },
    signal,
    responseType: 'blob',
  })
}
export async function downloadPDF(token, signal, source, url, params, paramsValues, header) {
  return http.post(
    `${api}/downloadPDF`,
    { source, url, params, paramsValues, header },
    {
      headers: { 'x-auth-token': token },
      signal,
      responseType: 'blob',
    },
  )
}
