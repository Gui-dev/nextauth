import { GetServerSidePropsContext } from 'next'
import axios, { AxiosError } from 'axios'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import Router from 'next/router'

import { AuthTokenError } from './../errors/AuthTokenError'

type ResponseProps = {
  token: string
  refreshToken: string
}

type setupAPIClientProps = {
  ctx?: GetServerSidePropsContext | undefined
}

export const setupAPIClient = ({ ctx = undefined }: setupAPIClientProps) => {

  let cookies = parseCookies(ctx)
  let isRefreshing = false
  let failedRequestQueue: {
    onSuccess: (token: string) => void,
    OnFailure: (error: AxiosError<never>) => void
  }[] = []

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })

  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError) => {
    if (error.response?.status === 401) {
      // @ts-ignore
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies(ctx)
        const { 'nextauth.refreshToken': refreshToken } = cookies
        const originalConfig = error.config

        if (!isRefreshing) {
          isRefreshing = true

          api.post('/refresh', { refreshToken })
          .then(response => {
            const { token, refreshToken } = response.data as ResponseProps

            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })

            setCookie(ctx, 'nextauth.refreshToken', refreshToken, {
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

            if (process.browser) {
              destroyCookie(ctx, 'nextauth.token')
              destroyCookie(ctx, 'nextauth.refreshToken')

              Router.push('/')
            }
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
        if (process.browser) {
          destroyCookie(ctx, 'nextauth.token')
          destroyCookie(ctx, 'nextauth.refreshToken')

          Router.push('/')
        } else {
          return Promise.reject(new AuthTokenError())
        }

      }
    }

    return Promise.reject(error)
  })

  return api
}
