import { useMemo } from "react"

export type Role = "user" | "guest"

export type PermissionSet = {
  canCreateTasks: boolean
  canEditAllTasks: boolean
  canDeleteAllTasks: boolean
  canDeleteOwnTasks: boolean
  canAssignTasks: boolean
  canAccessCalendar: boolean
  canAccessReports: boolean
}

/**
 * Permission mappings for known roles.
 * - user: standard user (full access to tasks)
 * - guest: limited access (can only manage own tasks)
 */
const PERMISSIONS: Record<Role, PermissionSet> = {
  user: {
    canCreateTasks: true,
    canEditAllTasks: true,
    canDeleteAllTasks: true,
  canDeleteOwnTasks: true,
    canAssignTasks: true,
    canAccessCalendar: true,
    canAccessReports: false,
  },
  guest: {
    canCreateTasks: true,
    canEditAllTasks: false,
  canDeleteAllTasks: false,
  canDeleteOwnTasks: true,
    canAssignTasks: false,
    canAccessCalendar: true,
    canAccessReports: false,
  },
}

/**
 * Hook to get permissions based on user role
 * Falls back to guest permissions for unknown roles
 */
export function usePermissions(role?: string | null): PermissionSet {
  const key = (role === "user" || role === "guest" ? role : "guest") as Role
  return useMemo(() => PERMISSIONS[key], [key])
}

export default usePermissions
