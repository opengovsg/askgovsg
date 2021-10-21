import { PermissionType } from '~shared/types/base'

export const isUserPublicOfficer = (user) =>
  !!user?.username?.endsWith('.gov.sg')
