import axios from 'axios'
import { translate } from './httpGoogleServices.js'
import { toastError, toastSuccess } from '@/composable/toast.js'

axios.interceptors.response.use(
  async (res) => {
    // CHECK IF RESPONSE IS BLOB (binary data like zip files)
    if (res.config.responseType === 'blob') {
      // For blob responses, just return the response as-is
      return Promise.resolve(res)
    }
    const { statusCode, general, message, msgType, display } = res.data
    let text = ''
    //catching successful response from API (200 status) returning BadRequest, Unauthorized... custom expected 'errors'
    //message returned from API in english
    if (statusCode >= 400 && statusCode < 500) {
      text = `${general}<br/>${message}`
      if (localStorage.getItem('locale') === 'fr') {
        text = (
          await translate({
            text,
            to: 'fr',
            from: 'en',
          })
        ).data
      }
      toastError(text, msgType)
      return Promise.reject('expected error returned from API')
    }
    if (statusCode === 200) {
      if (display) {
        text = message
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
    //CATCHING UNEXPECTED ERRORS GLOBALLY
    //abort controllers cancellation errors >>> resolve in order to keep running code
    if (
      error?.code === 'ERR_CANCELED' ||
      error?.name === 'CanceledError' ||
      error?.message === 'canceled' ||
      (typeof axios.isCancel === 'function' && axios.isCancel(error))
    )
      return Promise.resolve({ data: null, __canceled: true }) // resolve instead of reject so nothing up the stack sees a rejection
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
