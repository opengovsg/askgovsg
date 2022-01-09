import passport from 'passport'
import { Strategy, Issuer, TokenSet, UserinfoResponse } from 'openid-client'
import { PublicUser } from '../../models'
import { ModelCtor } from 'sequelize/dist'
import { AuthUserDto, UserAuthType } from '~shared/types/api'
import * as jose from 'jose'
import fs from 'fs'
import path from 'path'

const { origin: issuer } = new URL(process.env.SGID_ENDPOINT ?? '')

const privKeyPem = fs
  .readFileSync(
    path.resolve(
      __dirname,
      process.env.SGID_PRIV_KEY || '../../../certs/static/private_key.pem',
    ),
  )
  .toString()

const { Client } = new Issuer({
  issuer,
  authorization_endpoint: `${process.env.SGID_ENDPOINT}/authorize`,
  token_endpoint: `${process.env.SGID_ENDPOINT}/token`,
  userinfo_endpoint: `${process.env.SGID_ENDPOINT}/userinfo`,
  jwks_uri: `${issuer}/.well-known/jwks.json`,
})

const sgidClient = new Client({
  client_id: process.env.SGID_CLIENT_ID ?? '',
  client_secret: process.env.SGID_CLIENT_SECRET,
  redirect_uris: [process.env.SGID_REDIRECT_URI ?? ''],
  scope: 'openid name',
})

export const sgidStrategy = (PublicUser: ModelCtor<PublicUser>): void => {
  passport.use(
    'sgid',
    new Strategy(
      {
        client: sgidClient,
        params: {},
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
      async (
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
          const decryptedPayloadKey = await jose
            .generalDecrypt(userinfo.key, privateKey)
            .then(({ plaintext }) => decoder.decode(plaintext))
            .then(JSON.parse)
            .then(jose.importJWK)

          // Decrypt encrypted myinfo details
          const name = await jose
            .flattenedDecrypt(userinfo.data['myinfo.name'], decryptedPayloadKey)
            .then(({ plaintext }) => decoder.decode(plaintext))

          // Note: findOrCreate returns an array
          const users = await PublicUser.findOrCreate({
            where: { sgid: tokenset.claims().sub },
            defaults: {
              active: true,
              displayname: name,
            },
          })

          const user: AuthUserDto = {
            id: users[0].id,
            type: UserAuthType.Public,
          }

          return done(null, user)
        } catch (error) {
          return done(error)
        }
      },
    ),
  )
}
