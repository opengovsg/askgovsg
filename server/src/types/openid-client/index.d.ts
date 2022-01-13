import { CompactJWE } from 'jose'

export declare module 'openid-client' {
  interface UnknownObject {
    data: {
      'myinfo.name': CompactJWE
    }
    key: CompactJWE
  }
}
