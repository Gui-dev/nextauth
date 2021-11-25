import { useEffect } from 'react'
import { Can } from '../components/Can'

import { useAuth } from "../hooks/useAuth"
// import { useCan } from '../hooks/useCan'
import { setupAPIClient } from '../services/api'
import { api } from '../services/apiClient'
import { withSSRAuth } from '../utils/withSSRAuth'

const Dashboard = () => {
  const { user } = useAuth()

  // const userCanSeeMetrics = useCan({
  //   permissions: ['metrics.list'],
  // })

  useEffect(() => {
    api.get('/me')
      .then(response => {
        console.log(response)
      })
      .catch((error) => console.log(error))
  }, [])

  return (
    <>
      <h1>Dash: { user?.email }</h1>

      <Can permissions={['metrics.list']}>
        <div>Metricas</div>
      </Can>

      {/* { userCanSeeMetrics && (
        <div>Metricas</div>
      ) } */}
    </>
  )
}

export default Dashboard

export const getServerSideProps = withSSRAuth (async (_ctx) => {
  const apiClient = setupAPIClient({ctx: _ctx})
  const response = await apiClient.get('/me')

  return {
    props: {

    }
  }
})
