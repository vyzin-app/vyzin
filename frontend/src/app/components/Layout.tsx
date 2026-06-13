import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserPermissions } from '../utils/permissions'
import { CondoDataProvider } from '../contexts/CondoDataContext'
import { Login } from './Login'
import { Sidebar } from './Sidebar'
import { VyzinDashboard } from './VyzinDashboard'
import { Reservations } from './Reservas'
import { MuralAvisos } from './MuralAvisos'
import { Visitantes } from './Visitantes'
import { Informacoes } from './Informacoes'
import { UserManagement } from './UserManagement'
import { ProfileManagement } from './ProfileManagement'

const PAGE_PERMISSIONS: Record<
  string,
  keyof ReturnType<typeof getUserPermissions> | null
> = {
  dashboard: 'canAccessDashboard',
  reservations: 'canAccessReservations',
  mural: 'canAccessNoticeBoard',
  visitantes: 'canAccessVisitors',
  informacoes: 'canAccessInformation',
  usuarios: 'canManageUsers',
  perfis: 'canAccessProfiles',
}

export function Layout() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [openNewReservationModal, setOpenNewReservationModal] = useState(false)
  const [openNewVisitorModal, setOpenNewVisitorModal] = useState(false)
  const { isAuthenticated, loading, functions } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return
    const permissions = getUserPermissions(functions)
    const required = PAGE_PERMISSIONS[currentPage]
    if (required && !permissions[required]) {
      setCurrentPage('dashboard')
    }
  }, [currentPage, functions, isAuthenticated])

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

  if (!isAuthenticated) {
    return <Login />
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <VyzinDashboard
            onPageChange={setCurrentPage}
            onOpenNewReservation={() => {
              setCurrentPage('reservations')
              setOpenNewReservationModal(true)
            }}
            onOpenNewVisitor={() => {
              setCurrentPage('visitantes')
              setOpenNewVisitorModal(true)
            }}
          />
        )
      case 'reservations':
        return (
          <Reservations
            openNewModal={openNewReservationModal}
            onCloseNewModal={() => setOpenNewReservationModal(false)}
          />
        )
      case 'mural':
        return <MuralAvisos />
      case 'visitantes':
        return (
          <Visitantes
            openNewModal={openNewVisitorModal}
            onCloseNewModal={() => setOpenNewVisitorModal(false)}
          />
        )
      case 'informacoes':
        return <Informacoes />
      case 'usuarios':
        return <UserManagement />
      case 'perfis':
        return <ProfileManagement />
      default:
        return (
          <VyzinDashboard
            onPageChange={setCurrentPage}
            onOpenNewReservation={() => {
              setCurrentPage('reservations')
              setOpenNewReservationModal(true)
            }}
            onOpenNewVisitor={() => {
              setCurrentPage('visitantes')
              setOpenNewVisitorModal(true)
            }}
          />
        )
    }
  }

  return (
    <CondoDataProvider>
      <div className="flex h-screen bg-background">
        <div className="flex-shrink-0">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </CondoDataProvider>
  )
}
