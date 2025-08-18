import axios from 'axios'
import { translate } from './httpGoogleServices.js'
import { toastError, toastSuccess } from '@/components/common/toast_dialog/toast.js'

axios.interceptors.response.use(
  async (res) => {
    let text = ''
    //catching successful response from API (200 status) returning BadRequest, Unauthorized... custom expected 'errors'
    //message returned from API in english
    if (res.data.statusCode >= 400 && res.data.statusCode < 500) {
      text = `${res.data.general}<br/>${res.data.message}`
      if (localStorage.getItem('locale') === 'fr') {
        text = (
          await translate({
            text,
            to: 'fr',
            from: 'en',
          })
        ).data
      }
      toastError(text)
      return Promise.reject('expected error returned from API')
    }
    if (res.data.statusCode === 200) {
      if (res.data.display) {
        text = res.data.message
        if (localStorage.getItem('locale') === 'fr')
          text = (
            await translate({
              text,
              to: 'fr',
              from: 'en',
            })
          ).data
        toastSuccess(text)
      }
      return Promise.resolve(res)
    }
  },
  async (error) => {
    //catching unexpected errors globally
    let text = 'Oups ... an unexpected error has occured :<br> '
    if (!error.response)
      //no response means network error
      text = text + 'network or connection to the API not available !'
    else {
      const expectedErr = error.response.status >= 400 && error.response.status < 500
      if (!expectedErr && error.code !== 'ERR_CANCELED' && error.name !== 'CanceledError')
        //canceled error coming from aborted data loading operations in order to avoid memory leak, no need to send alert message to the user
        text = text + error.message
    }
    try {
      if (localStorage.getItem('locale') === 'fr')
        text = (
          await translate({
            text,
            to: 'fr',
            from: 'en',
          })
        ).data
    } catch (error) {} //translate service not available in case of loss of connection with back-end API
    toastError(text)
    return Promise.reject(error)
  },
)
export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
}
