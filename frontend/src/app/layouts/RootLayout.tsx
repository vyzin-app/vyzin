import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/contexts/AuthContext'
import { paths } from '@/app/router/paths'

export function RootLayout() {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && location.pathname !== paths.login) {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }

  if (isAuthenticated && location.pathname === paths.login) {
    return <Navigate to={paths.dashboard} replace />
  }

  return <Outlet />
}
