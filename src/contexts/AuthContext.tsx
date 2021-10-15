import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { AxiosError } from 'axios'

import { api } from '../services/api'

type UserProps = {
  email: string
  permissions: string[]
  roles: string[]
}

type ResponseProps = {
  data: {
    permissions: string[]
    roles: string[]
    refreshToken: string
    token: string
  }
}

type SignInCredenntials = {
  email: string
  password: string
}

type AuthProviderProps = {
  children: ReactNode
}

type AuthContextProps = {
  user: UserProps | undefined
  isAuthenticated: boolean
  signIn: ({email, password}: SignInCredenntials) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext({} as AuthContextProps)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProps>()
  const isAuthenticated = !!user

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data
          setUser({
            email,
            permissions,
            roles
          })
        })
        .catch(() => {
          signOut()
        })
    }
  }, [])

  const signIn = async ({ email, password }: SignInCredenntials):Promise<void> => {
    try {
      const { data }: ResponseProps = await api.post('/sessions', {
        email,
        password
      })

      const { permissions, refreshToken, roles, token } = data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      if (api.defaults.headers) {
        api.defaults.headers['Authorization'] = `Bearer ${token}`
      }

      Router.push('/dashboard')
    } catch (error) {
      const err = error as AxiosError

      if (err) {
        console.log(err.response?.status)
      }
    }
  }

  const signOut = () => {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    Router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      signIn,
      signOut
    }}>
      { children }
    </AuthContext.Provider>
  )
}
