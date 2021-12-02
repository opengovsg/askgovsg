import { Agency, User } from '../base'

export type LoadUserDto =
  | (User & {
      agency: Agency
    })
  | null
