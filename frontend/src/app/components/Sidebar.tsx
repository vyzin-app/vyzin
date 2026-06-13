import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from './ui/utils'
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Info,
  Building2,
  X,
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { paths } from '@/app/router/paths'
import { getUserPermissions } from '@/app/utils/permissions'
import { display } from '@/app/utils/displayLabels'

interface NavigationItem {
  id: string
  path: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  requiresPermission?: keyof ReturnType<typeof getUserPermissions>
  submenu?: {
    id: string
    path: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    requiresPermission?: keyof ReturnType<typeof getUserPermissions>
  }[]
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const { user, functions, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const permissions = user ? getUserPermissions(functions) : null

  useEffect(() => {
    if (location.pathname.startsWith(paths.seguranca.root)) {
      setExpandedMenus((prev) =>
        prev.includes('seguranca') ? prev : [...prev, 'seguranca'],
      )
    }
  }, [location.pathname])

  const handleNavigation = (path: string) => {
    if (!isExpanded) {
      setIsExpanded(true)
      setTimeout(() => navigate(path), 150)
    } else {
      navigate(path)
    }
  }

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    )
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      path: paths.dashboard,
      name: display.dashboard,
      icon: LayoutDashboard,
      description: 'Visão geral',
      requiresPermission: 'canAccessDashboard',
    },
    {
      id: 'reservations',
      path: paths.reservations,
      name: 'Reservas',
      icon: Calendar,
      description: 'Agendar espaços',
      requiresPermission: 'canAccessReservations',
    },
    {
      id: 'mural',
      path: paths.mural,
      name: 'Mural de Avisos',
      icon: MessageSquare,
      description: 'Comunicados',
      requiresPermission: 'canAccessNoticeBoard',
    },
    {
      id: 'visitantes',
      path: paths.visitantes,
      name: 'Visitantes',
      icon: Users,
      description: 'Cadastro de visitas',
      requiresPermission: 'canAccessVisitors',
    },
    {
      id: 'seguranca',
      path: paths.seguranca.root,
      name: 'Segurança',
      icon: Shield,
      description: 'Usuários e perfis',
      submenu: [
        {
          id: 'usuarios',
          path: paths.seguranca.usuarios,
          name: 'Usuários',
          icon: Users,
          requiresPermission: 'canManageUsers',
        },
        {
          id: 'perfis',
          path: paths.seguranca.perfis,
          name: 'Perfis',
          icon: ShieldCheck,
          requiresPermission: 'canAccessProfiles',
        },
      ],
    },
    {
      id: 'informacoes',
      path: paths.informacoes,
      name: 'Informações',
      icon: Info,
      description: 'Regras e contatos',
      requiresPermission: 'canAccessInformation',
    },
  ]

  const filteredNavigationItems = navigationItems
    .filter((item) => {
      if (!permissions) return true

      if (item.submenu) {
        const visibleSubmenu = item.submenu.filter((subItem) => {
          if (!subItem.requiresPermission) return true
          return permissions[subItem.requiresPermission]
        })
        return visibleSubmenu.length > 0
      }

      if (item.requiresPermission && !permissions[item.requiresPermission]) {
        return false
      }

      return true
    })
    .map((item) => {
      if (!item.submenu || !permissions) return item
      return {
        ...item,
        submenu: item.submenu.filter((subItem) => {
          if (!subItem.requiresPermission) return true
          return permissions[subItem.requiresPermission]
        }),
      }
    })

  const isPathActive = (path: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      return location.pathname.startsWith(path)
    }
    return location.pathname === path
  }

  return (
    <div className="ml-6 my-6 flex-shrink-0">
      <div
        className={cn(
          'flex flex-col h-[calc(100vh-3rem)] transition-all duration-300 ease-in-out rounded-3xl',
          'bg-gradient-to-b from-sidebar via-sidebar to-sidebar-accent shadow-2xl border border-sidebar-border/20',
          isExpanded ? 'w-64' : 'w-20',
        )}
        style={{ overflow: 'hidden' }}
      >
        <div className="p-6 flex flex-col items-center relative flex-shrink-0">
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          )}

          <div className="w-12 h-12 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {isExpanded && (
            <div className="mt-3 text-center overflow-hidden">
              <h2 className="text-sidebar-foreground font-semibold text-base whitespace-nowrap overflow-hidden">
                Vyzin
              </h2>
              <p className="text-sidebar-foreground/70 text-xs whitespace-nowrap mt-1 overflow-hidden">
                Gestão Condominial
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
          <div className="space-y-2">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon
              const hasSubmenu = item.submenu && item.submenu.length > 0
              const isActive = isPathActive(item.path, !!hasSubmenu)
              const isSubmenuExpanded = expandedMenus.includes(item.id)

              return (
                <div key={item.id}>
                  <div className="relative group">
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleSubmenu(item.id)
                        } else {
                          handleNavigation(item.path)
                        }
                      }}
                      className={cn(
                        'transition-all duration-300 flex items-center relative',
                        'hover:shadow-lg',
                        isExpanded
                          ? 'w-full px-4 py-3 justify-start rounded-xl'
                          : 'w-12 h-12 justify-center mx-auto rounded-full',
                        isActive && !hasSubmenu
                          ? 'bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30 scale-105'
                          : 'bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 hover:from-sidebar-primary/80 hover:to-sidebar-primary/60',
                      )}
                    >
                      <Icon
                        className={cn(
                          'transition-colors duration-300 flex-shrink-0 w-5 h-5',
                          isActive && !hasSubmenu
                            ? 'text-sidebar-primary-foreground'
                            : 'text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground',
                        )}
                      />

                      {isExpanded && (
                        <div className="ml-3 overflow-hidden flex-1 flex items-center justify-between min-w-0">
                          <span
                            className={cn(
                              'font-medium text-sm whitespace-nowrap truncate transition-colors duration-300',
                              isActive && !hasSubmenu
                                ? 'text-sidebar-primary-foreground'
                                : 'text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground',
                            )}
                          >
                            {item.name}
                          </span>
                          {hasSubmenu && (
                            <span className="flex-shrink-0 ml-2">
                              {isSubmenuExpanded ? (
                                <ChevronDown className="w-4 h-4 text-sidebar-accent-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-sidebar-accent-foreground" />
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      {isActive && !isExpanded && !hasSubmenu && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-sidebar-primary opacity-20 animate-pulse" />
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-l-full" />
                        </>
                      )}

                      {isActive && isExpanded && !hasSubmenu && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-primary-foreground rounded-full animate-pulse flex-shrink-0" />
                      )}
                    </button>

                    {!isExpanded && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {item.description}
                        </div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
                      </div>
                    )}
                  </div>

                  {hasSubmenu && isExpanded && isSubmenuExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.submenu?.map((subItem) => {
                        const SubIcon = subItem.icon
                        const isSubActive = location.pathname === subItem.path

                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleNavigation(subItem.path)}
                            className={cn(
                              'w-full px-4 py-2 rounded-lg flex items-center transition-all duration-300',
                              isSubActive
                                ? 'bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg'
                                : 'bg-sidebar-accent/50 hover:bg-sidebar-primary/60',
                            )}
                          >
                            <SubIcon
                              className={cn(
                                'w-4 h-4 mr-3 flex-shrink-0',
                                isSubActive
                                  ? 'text-sidebar-primary-foreground'
                                  : 'text-sidebar-accent-foreground',
                              )}
                            />
                            <span
                              className={cn(
                                'text-sm font-medium truncate',
                                isSubActive
                                  ? 'text-sidebar-primary-foreground'
                                  : 'text-sidebar-accent-foreground',
                              )}
                            >
                              {subItem.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        <div className="p-4 flex-shrink-0">
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="relative group">
                <div
                  className="w-12 h-12 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer flex-shrink-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <span className="text-sidebar-primary-foreground font-semibold text-lg">
                    {user?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>

                {!isExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
                    <div className="font-medium text-sm">{user?.name}</div>
                    {user?.apartment && (
                      <div className="text-xs opacity-75 mt-1">
                        Apto {user.apartment} - Bloco {user.block}
                      </div>
                    )}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
                  </div>
                )}
              </div>
            </div>

            {isExpanded && (
              <>
                <div className="text-center overflow-hidden">
                  <div className="text-sidebar-foreground font-medium text-sm whitespace-nowrap truncate">
                    {user?.name}
                  </div>
                  {user?.apartment && (
                    <div className="text-sidebar-foreground/70 text-xs whitespace-nowrap truncate">
                      Apto {user.apartment} - Bloco {user.block}
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
