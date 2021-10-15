import { useEffect } from 'react'

import { useAuth } from "../hooks/useAuth"
import { api } from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()

  useEffect(() => {
    api.get('/me')
      .then(response => {
        console.log(response)
      })
      .catch((error) => console.log(error))
  }, [])

  return (
    <h1>Dash: { user?.email }</h1>
  )
}

export default Dashboard
