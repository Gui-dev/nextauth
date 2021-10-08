import { createContext, ReactNode } from 'react'

type SignInCredenntials = {
  email: string
  password: string
}

type AuthProviderProps = {
  children: ReactNode
}

type AuthContextProps = {
  isAuthenticated: boolean
  signIn: ({email, password}: SignInCredenntials) => Promise<void>
}

export const AuthContext = createContext({} as AuthContextProps)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const isAuthenticated = false

  const signIn = async ({ email, password }: SignInCredenntials):Promise<void> => {
    console.log(email, password)
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn
    }}>
      { children }
    </AuthContext.Provider>
  )
}