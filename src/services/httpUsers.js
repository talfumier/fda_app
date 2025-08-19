import http from './httpService.js'
import { jwtDecode } from 'jwt-decode'

const api = 'http://localhost:3000/api'
export function login(email, pwd) {
  return http.post(`${api}/login`, { email, pwd })
}
export function register(email, idRole, pwd) {
  return http.post(`${api}/register`, {
    email,
    idRole,
    lang: localStorage.getItem('locale'),
    pwd,
  })
}
export function forgotPassword(email, lang) {
  return http.post(`${api}/resetpassword/forgotPassword`, { email, lang })
}
export function resetPassword(id, resetToken, pwd) {
  return http.patch(`${api}/resetpassword/forgotPassword/${id}/${resetToken}`, {
    pwd,
  })
}
export function decodeJWT(jwt) {
  try {
    return jwtDecode(jwt)
  } catch (error) {}
  return null
}
