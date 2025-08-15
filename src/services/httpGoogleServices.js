import http from './httpService.js'

const api = 'http://localhost:3000/api'

export async function translate(data) {
  //data is an object >>> {text, to, from}
  try {
    const { data: res } = await http.post(`${api}/translate`, data)
    return res.text
  } catch (error) {
    return data.text //return non translated text in case of error
  }
}
