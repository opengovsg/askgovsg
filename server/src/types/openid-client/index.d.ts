import { FlattenedJWE, GeneralJWE } from 'jose'

export declare module 'openid-client' {
  interface UnknownObject {
    data: {
      'myinfo.name': FlattenedJWE
    }
    key: GeneralJWE
  }
}
