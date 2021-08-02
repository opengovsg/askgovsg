import { BaseModelParams } from './common'

export type BaseUserDto = BaseModelParams & {
  displayname: string
  username: string
  views: number
}
