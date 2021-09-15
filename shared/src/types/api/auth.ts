import { Permission, Tag, User } from '../base'

export type LoadUserDto =
  | (User & {
      tags: (Tag & {
        permission: Permission
      })[]
    })
  | null

export type VerifyLoginOtpDto = {
  token: string
  newParticipant: boolean
  displayname: string
}
