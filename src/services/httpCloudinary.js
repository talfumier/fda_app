import http from './httpService.js'
import { environment } from '@/config/environment.js'

const api = environment.api_url
export function postInCloud(publicId, data, token, signal, option = null) {
  return http.post(
    `${api}/files/cloudinary-upload${option ? option : ''}`,
    { publicId, data },
    {
      headers: { 'x-auth-token': token },
      signal,
    },
  )
}
export function deleteInCloud(publicId, token, signal) {
  return http.post(
    `${api}/files/cloudinary-delete`,
    { publicId },
    {
      headers: { 'x-auth-token': token },
      signal,
    },
  )
}
