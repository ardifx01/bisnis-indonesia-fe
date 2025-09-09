import axios from 'axios'
import { parseCookies } from 'nookies'

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL_API
})

instance.interceptors.request.use(
  config => {
    const cookies = parseCookies()

    if (cookies.token) {
      config.headers.Authorization = `Bearer ${cookies.token}`
    }

    return config
  },
  error => Promise.reject(error)
)

export default instance
