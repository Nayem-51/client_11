import { useAuth } from './useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export const useProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  return { isAuthenticated, loading }
}
