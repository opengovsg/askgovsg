import passport from 'passport'
import { Strategy, Issuer, TokenSet, UserinfoResponse } from 'openid-client'
import { PublicUser } from '../../models'
import { ModelCtor } from 'sequelize/dist'
import { AuthUserDto, UserAuthType } from '~shared/types/api'
import * as jose from 'jose'

const { origin: issuer } = new URL(
  process.env.SGID_ENDPOINT ?? 'http://localhost:5156/sgid/v1/oauth',
)

const { Client } = new Issuer({
  issuer,
  authorization_endpoint: `${process.env.SGID_ENDPOINT}/authorize`,
  token_endpoint: `${process.env.SGID_ENDPOINT}/token`,
  userinfo_endpoint: `${process.env.SGID_ENDPOINT}/userinfo`,
  jwks_uri: `${issuer}/.well-known/jwks.json`,
})

const sgidClient = new Client({
  client_id: process.env.SGID_CLIENT_ID ?? 'askgov',
  client_secret: process.env.SGID_CLIENT_SECRET,
  redirect_uris: [process.env.SGID_REDIRECT_URI ?? 'http://localhost:3000'],
  token_endpoint_auth_method: 'client_secret_post',
  id_token_signed_response_alg: 'RS256', // default
  response_types: ['code'], // default
})

const sgidCallback = (
  PublicUser: ModelCtor<PublicUser>,
  privKeyPem: string,
) => {
  return async (
    tokenset: TokenSet,
    userinfo: UserinfoResponse,
    done: (err: unknown, user?: AuthUserDto) => void,
  ) => {
    try {
      // Note: Passing the userinfo param checks the id token's sub against the userinfo's sub

      // Import private key
      const decoder = new TextDecoder()
      const privateKey = await jose.importPKCS8(privKeyPem, 'A256GCMKW')

      // Decrypt encrypted symmetric key
      console.log(userinfo)
      const decryptedPayloadKey = await jose
        .compactDecrypt(userinfo.key, privateKey)
        .then(({ plaintext }) => decoder.decode(plaintext))
        .then(JSON.parse)
        .then(jose.importJWK)

      // Decrypt encrypted myinfo details
      const name = await jose
        .flattenedDecrypt(userinfo.data['myinfo.name'], decryptedPayloadKey)
        .then(({ plaintext }) => decoder.decode(plaintext))

      // Note: findOrCreate returns [user, created]
      const [user] = await PublicUser.findOrCreate({
        where: { sgid: tokenset.claims().sub },
        defaults: {
          active: true,
          displayname: name,
        },
      })

      const authUser: AuthUserDto = {
        id: user.id,
        type: UserAuthType.Public,
      }
      return done(null, authUser)
    } catch (error) {
      return done(error)
    }
  }
}

export const sgidStrategy = (
  PublicUser: ModelCtor<PublicUser>,
  privateKeyPem: string,
): void => {
  passport.use(
    'sgid',
    new Strategy(
      {
        client: sgidClient,
        params: {
          scope: 'openid myinfo.name',
        },
        extras: {
          exchangeBody: {
            client_id: process.env.SGID_CLIENT_ID,
            client_secret: process.env.SGID_CLIENT_SECRET,
            grant_type: 'authorization_code',
          },
        },
        passReqToCallback: false,
        usePKCE: false,
      },
      sgidCallback(PublicUser, privateKeyPem),
    ),
  )
}

export const _sgidStrategy = {
  sgidCallback,
}
