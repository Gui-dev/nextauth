import axios, { AxiosError } from 'axios'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import Router from 'next/router'

type ResponseProps = {
  token: string
  refreshToken: string
}

let cookies = parseCookies()
let isRefreshing = false
let failedRequestQueue: {
  onSuccess: (token: string) => void,
  OnFailure: (error: AxiosError<never>) => void
}[] = []

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
})

api.interceptors.response.use(response => {
  return response
}, (error: AxiosError) => {
  if (error.response?.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      cookies = parseCookies()
      const { 'nextauth.refreshToken': refreshToken } = cookies
      const originalConfig = error.config

      if (!isRefreshing) {
        isRefreshing = true

        api.post('/refresh', { refreshToken })
        .then(response => {
          const { token, refreshToken } = response.data as ResponseProps

          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          })

          setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          })

          if (api.defaults.headers) {
            api.defaults.headers['Authorization'] = `Bearer ${token}`
          }

          failedRequestQueue.forEach(request => request.onSuccess(token))
          failedRequestQueue = []
        })
        .catch((err) => {
          failedRequestQueue.forEach(request => request.OnFailure(err))
          failedRequestQueue = []
        })
        .finally(() => {
          isRefreshing = false
        })
      }

      return new Promise((resolve, reject) => {
        failedRequestQueue.push({
          onSuccess: (token: string) => {
            if (originalConfig.headers)  originalConfig.headers['Authorization'] = `Bearer ${token}`

            resolve(api(originalConfig))
          },
          OnFailure: (error: AxiosError) => {
            reject(error)
          }
        })
      })
    } else { // deslogar usuario
      destroyCookie(undefined, 'nextauth.token')
      destroyCookie(undefined, 'nextauth.refreshToken')

      Router.push('/')

    }
  }

  return Promise.reject(error)
})
