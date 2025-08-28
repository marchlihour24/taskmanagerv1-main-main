import { useMemo } from "react"

export type Role = "user" | "guest"

export type PermissionSet = {
  canCreateTasks: boolean
  canEditAllTasks: boolean
  canDeleteAllTasks: boolean
  canAssignTasks: boolean
  canAccessCalendar: boolean
  canAccessReports: boolean
}

/**
 * Permission mappings for known roles.
 * - user: standard user (good access but cannot manage users/reports)
 * - guest: limited access
 */
const PERMISSIONS: Record<Role, PermissionSet> = {
  user: {
    canCreateTasks: true,
    canEditAllTasks: true,
    canDeleteAllTasks: true,
    canAssignTasks: true,
    canAccessCalendar: true,
    canAccessReports: false,
  },
  guest: {
    canCreateTasks: true,
    canEditAllTasks: false,
    canDeleteAllTasks: true,
    canAssignTasks: false,
    canAccessCalendar: true,
    canAccessReports: false,
  },
}

/**
 * usePermissions hook
 * Accepts whatever string the auth provider gives ("user" | "guest" | other)
 * and returns a safe PermissionSet. Unknown roles fallback to 'guest'.
 */
export function usePermissions(role?: string | null): PermissionSet {
  const key = (role === "user" || role === "guest" ? role : "guest") as Role
  return useMemo(() => PERMISSIONS[key], [key])
}

export default usePermissions