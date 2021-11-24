import { User } from '~shared/types/base'

export const isUserPublicOfficer = (user?: User): boolean =>
  !!user?.username?.endsWith('.gov.sg')
