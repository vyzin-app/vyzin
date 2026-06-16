import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  getUserPermissions,
  type Permission,
} from '@/app/utils/permissions'
import { paths } from './paths'

interface RequirePermissionProps {
  permission: keyof Permission
  children: React.ReactNode
}

/** Redirects to dashboard when the user lacks the required permission flag. */
export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { functions } = useAuth()
  const permissions = getUserPermissions(functions)

  if (!permissions[permission]) {
    return <Navigate to={paths.dashboard} replace />
  }

  return <>{children}</>
}
