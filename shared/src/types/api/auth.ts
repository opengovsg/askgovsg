import { Agency, User, PublicUser } from '../base'

export enum UserAuthType {
  Public = 'public',
  Agency = 'agency',
}

export type LoadUserDto =
  | (User & {
      agency: Agency
    })
  | null

export type LoadPublicUserDto = PublicUser | null

export interface AuthUserDto {
  id: number
  type: UserAuthType
}
