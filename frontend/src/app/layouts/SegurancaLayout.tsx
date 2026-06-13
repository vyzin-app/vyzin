import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUserPermissions } from '@/app/utils/permissions'
import { cn } from '@/app/components/ui/utils'
import { paths } from '@/app/router/paths'

/** Nested layout for the Segurança module (usuários + perfis). */
export function SegurancaLayout() {
  const { functions } = useAuth()
  const permissions = getUserPermissions(functions)
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      path: paths.seguranca.usuarios,
      label: 'Usuários',
      visible: permissions.canManageUsers,
    },
    {
      path: paths.seguranca.perfis,
      label: 'Perfis',
      visible: permissions.canAccessProfiles,
    },
  ].filter((tab) => tab.visible)

  useEffect(() => {
    if (location.pathname !== paths.seguranca.root) {
      return
    }
    const firstTab = tabs[0]?.path
    if (firstTab) {
      navigate(firstTab, { replace: true })
    }
  }, [
    location.pathname,
    navigate,
    permissions.canManageUsers,
    permissions.canAccessProfiles,
  ])

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-8 pb-4 border-b bg-background">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Segurança</h1>
            <p className="text-sm text-muted-foreground">
              Usuários do sistema e perfis de acesso
            </p>
          </div>
        </div>

        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
