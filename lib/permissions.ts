export type AppRole = 'owner' | 'admin' | 'moderator' | 'teacher' | 'member'

export const ALL_ROLES: AppRole[] = ['owner', 'admin', 'moderator', 'teacher', 'member']
export const ADMIN_ASSIGNABLE_ROLES: AppRole[] = ['moderator', 'teacher', 'member']

export function canManageRoles(role: string | null | undefined) {
  return role === 'owner' || role === 'admin'
}

export function canDeleteUsers(role: string | null | undefined) {
  return role === 'owner'
}

export function canPostTeachings(role: string | null | undefined) {
  return role === 'owner' || role === 'teacher'
}

export function canPostAnnouncements(role: string | null | undefined) {
  return role === 'owner' || role === 'teacher' || role === 'moderator'
}

export function canModeratePosts(role: string | null | undefined) {
  return role === 'owner' || role === 'moderator'
}
