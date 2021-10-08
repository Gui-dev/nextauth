import { FormEvent, useContext, useState } from 'react'

import { AuthContext } from '../contexts/AuthContext'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useContext(AuthContext)

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault()
    signIn({
      email,
      password
    })
  }

  return (
    <>
      <form onSubmit={ handleSignIn }>
        <input 
          type="email" 
          name="email"
          placeholder="Seu e-mail" 
          value={email}
          onChange={ event => setEmail(event.target.value) }
        />
        <input 
          type="password"
          name="password"
          placeholder="Sua senha"
          value={password}
          onChange={ event => setPassword(event.target.value) } 
        />

        <button>Entrar</button>
      </form>
    </>
  )
}
