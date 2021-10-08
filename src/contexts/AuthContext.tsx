import { createContext, ReactNode, useState } from 'react'
import Router from 'next/router'
import { setCookie } from 'nookies'

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
}

export const AuthContext = createContext({} as AuthContextProps)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProps>()
  const isAuthenticated = !!user

  const signIn = async ({ email, password }: SignInCredenntials):Promise<void> => {
    try {
      const { data } = await api.post('/sessions', {
        email,
        password
      }) as ResponseProps

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

     Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      signIn
    }}>
      { children }
    </AuthContext.Provider>
  )
}
