import http from './httpService.js'
import { environment } from '@/config/environment.js'

const api = environment.api_url

export async function translate(data) {
  //data is an object >>> {text, to, from}  >>> from optional
  try {
    const res = await http.post(`${api}/translate`, data)
    return res.data
  } catch (error) {
    return data //return non translated text in case of error
  }
}
