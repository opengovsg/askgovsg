import { Agency, Permission, Tag, User } from '../base'

export type LoadUserDto =
  | (User & {
      tags: (Tag & {
        permission: Permission
      })[]
      agency: Agency
    })
  | null
