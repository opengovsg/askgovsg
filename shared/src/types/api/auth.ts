import { Permission, Tag, User } from '../base'

export type LoadUserDto =
  | (User & {
      tags: (Tag & {
        permission: Permission
      })[]
    })
  | null
