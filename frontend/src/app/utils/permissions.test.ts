import { describe, expect, it } from 'vitest'
import { AppFunction } from '../domain/appFunction'
import { getUserPermissions } from './permissions'

describe('getUserPermissions', () => {
  it('grants reservation management when function is present', () => {
    const permissions = getUserPermissions([AppFunction.RESERVATIONS_MANAGE])
    expect(permissions.canManageReservations).toBe(true)
    expect(permissions.canAccessReservations).toBe(false)
  })

  it('grants visitor workflow for porteiro functions', () => {
    const permissions = getUserPermissions([
      AppFunction.VISITORS_READ,
      AppFunction.VISITORS_WORKFLOW,
    ])
    expect(permissions.canVisitorWorkflow).toBe(true)
    expect(permissions.canManageVisitors).toBe(false)
  })

  it('always allows dashboard access', () => {
    expect(getUserPermissions([]).canAccessDashboard).toBe(true)
  })
})
