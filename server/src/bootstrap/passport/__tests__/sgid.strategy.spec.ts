import { StrategyVerifyCallbackUserInfo } from 'openid-client'
import { ModelCtor, Sequelize } from 'sequelize/dist'
import { AuthUserDto, UserAuthType } from '~shared/types/api'
import { _sgidStrategy } from '../sgid.strategy'
import { createTestDatabase, getModel, ModelName } from '../../../util/jest-db'
import { PublicUser as PublicUserModel } from '../../../models'
import { JWEInvalid } from 'jose/dist/types/util/errors'

describe('sgidStrategy', () => {
  // const publicKey =
  //   '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu3YvExh1qjJBpkjALKfC\nuB67KqjzCc/EwUrBOkdoEYNLur80A2Y3R4v2q1AW8f8e3bMiPLLSlvxS0a0YyaiT\n2+4/ENjwy+dUa1o9XdiWLmHWWMWi7je1IK4zsDxoIt9nSOxaZmhu4aZeP+GhrMiV\nLnV0xKDl/4n2QZbD1GkdkG4ZuyqHJsmGcGtXLU1U6r6p6ZDrCTkBXjX96EDobHfX\nVFfi/RJ7VOD2aP2p4G7I104tNBYmB9+mkHr4AuOT9PhmOqq4a9Fo1E6VLnlo4FW/\n2ZK10gUU0f5wacnNillER0NGNwFWoTj2ASF9LiR6/39b4satRLAy8RxMclva8iK6\nyQIDAQAB\n-----END PUBLIC KEY-----'
  const privateKeyPem =
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7di8TGHWqMkGm\nSMAsp8K4HrsqqPMJz8TBSsE6R2gRg0u6vzQDZjdHi/arUBbx/x7dsyI8stKW/FLR\nrRjJqJPb7j8Q2PDL51RrWj1d2JYuYdZYxaLuN7UgrjOwPGgi32dI7FpmaG7hpl4/\n4aGsyJUudXTEoOX/ifZBlsPUaR2Qbhm7KocmyYZwa1ctTVTqvqnpkOsJOQFeNf3o\nQOhsd9dUV+L9EntU4PZo/angbsjXTi00FiYH36aQevgC45P0+GY6qrhr0WjUTpUu\neWjgVb/ZkrXSBRTR/nBpyc2KWURHQ0Y3AVahOPYBIX0uJHr/f1vixq1EsDLxHExy\nW9ryIrrJAgMBAAECggEAY8jsE+kQMRFhWqcdDGgcQS+yh2m5PP7Ih+9H3cLGxZOz\nCuvePvT49e+t1NDj9drMTkydK9wwNsiHOS8/o5BFbGtsTIZ93rv7ds1pHvw8LOJN\nW6GQMeebVZME1onBENcEPo/5KsvqQdjyEGUFT1jR+BHznvrakuSYHZ+oC/gMEaVw\ndUsM1849EbLDJ5lOPDDqYwsJwIGEryxRLFP+4HhGR9wnrTVee5CCsH0ep8OqypvY\nxgg9Ytyt1WripwzhXsVzJxahTbO4XImOgv6Uvo3EYfBXm1gbfugGbSiyYHBBx0Pa\n7DtYrpRzjeS33m6Y4SJjKERjCbHXChwUrFcMGS5ogQKBgQDeChbIHYRu4HTQYoV9\npJ70LcHCiE0zaJzuMHes4OFkNAuFXASDGp1HJXd0tol+oeuYO/q1gENvyfBAqDH/\nAVAtWaFvQUNzv/Zs++mbrSSwxuZJCaJAbh9GKzCyCbapxBtdzhgCLLY9GeWRiG1c\npuYUUvJmkcWQE9sSn2tnE8mv2QKBgQDYIjWgagTLPlT3J65t5BEs9fwjAq8bdIIV\nE9o0blIwlKF3FzeUo4Egjc/vfIYOL43AOttuVbVoruvvT13a3+VpCXjxqSYnveuw\nFB0xQC1F0c3ay4Oprjh2qk2GfOy0gikaRgmTUP3nVK1LC57GWJMker/UQ2kWCJCs\nRyMzpgd8cQKBgQCE5q8KKrjJEOp6jG3wbWeDKhwuzxy+Z6B+5V3MiXH/YzN+KDy/\nKF/5ZNCieFvGAy8cGNKQbuxubgWy/bmnM+cErgB1si+oib77LrF+L92lPfg6wVxv\nijqH6nQkLLI73RiwRhqSuqZ93hFN0cX7zh4rDhbvE9OX0HqxI+DKesqeyQKBgEln\nhPMQTsSATPcMAQ/Nb4/nk1SIqtQWQ7/I2EkKVtus/xGlTvkqdsaJo19g2V6kA+6P\njsrwTQZaskK6n9OgSxfbYbohipXgyNUqX6fEdhvKX7G5gOP2CbMzr9THRNUhh7gm\npUXlMfaJKbndHnWay46OKex7YItdKVV5a5k1AEHhAoGBAIVSqdn2f4mVgdQxDls6\nDPp0XJW2D9nI9w9mm+wZc9TtI7X+7+1LZ609vDHAEfj8flTMl0t/ovaaZWmEHCpg\nFKM9rIqep3tZy6qqgo63peDk+RPV3UVgnUwq0+mBwhnHPWQf2nfYnZZHwsldfHWP\ny0U6Qc7UNI3EjJEJPTI4Zifg\n-----END PRIVATE KEY-----'
  const mockTokenset = {
    access_token: '35',
    refresh_token: '35/f9d44ca3e3b178837ada28c47a347ba20cc8fb4',
    expires_at: Date.now() + 24 * 60 * 60,
    scope: 'openid',
    token_type: 'Bearer',
    id_token:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IlA1NGNEbXBNZkx0Nl9vUjhxcHFxcUlfZUtOVWlJa1pfemRZOEhWRjRRLUkifQ.eyJydF9oYXNoIjoiOU5qR0tnTi16VFB5dXBtczlEeEZ5QSIsImF0X2hhc2giOiJueFFDV3ZBR1d6RGtmaVByczdTUjB3IiwiaWF0IjoxNjQxODY4NjA1LCJleHAiOjE2NDE5NTUwMDUsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTE1NiIsImFtciI6WyJwd2QiXSwiYXVkIjoiYXNrZ292Iiwic3ViIjoidT0zNSJ9.LTxemYjAw9AdKs6l4e1eLaS5N8T5mUrOUg47UxnDIMl_m6wLJF66kpsxtyo_GGJDPVUNd5sdURa7qljzFbeeNoi5A2Ff0xnUXQqWFl4H3Q2iR_l9823Bl21uLaxN3lNxFGLkQhArxZ7lx-61xYGPi9Sgi_Hok4QW3AaQ0z8drN3RlCHvZKU1O3wemwBn7_QT5rHLZElF9V9qVaXBv4khwMfIDTxWXG2yP4ECLMhcpu0zd6eC1mBy_z7X3hI9CNGN5q3s0IXjy4ogJH9wU0CcpQZuZZLVABNpkewR2i8Sm3hEoNtx4CAEAm4ImNVTmut9YIfriCz9zfSkkeQWxbqF8Q',
    expired: jest.fn(),
    claims: jest.fn(),
  }
  const mockUserInfo = {
    sub: 'u=35',
    key: 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiUlNBLU9BRVAiLCJraWQiOiJiemEwZFhmNkZqbGExRlFyVkttQVR1WmI5LTRNOTBMeER1ZjN1akxZYnFnIn0.jhmXgMWLU0kCj6SCAR8zxxzE_A0PVQeCJNrKlMXhN7m6A7atrrlLsND3Lt8EE7myBcQaUpggQuR8TdLjMVLAVCPV0rzYMHgASvmWN8M1CibIZlGKhcvVbcuHwqT5tC1JdSgzMowKch_K3M14rxxRVpqI7BQbnca5D997E69pFb1LLRAK2Zdqqaks99S3kTbNmrNqPrLsI0JCZLAAVljuOLl-zfsYg-a0L8nHzmfxp89jSKOFHnCaDO0h0MsPK3ZZIx-10B8SsgwUe3fFviT1LKIyim4UhZOrt_21yQuQOuiag7WsZxhxn5npWg18YB6wPZQPAMeY3dQouM8mdhqEgg.qIGi1cywsVgm3PDLIJxemQ.sF0s1htw0zpoCL0Ep6C9ouanbtLpchEEdk6rRd1TFmJNkI2mDYrNmTMuY60bEbeTQk6HUU1ppSZDK6u_ZCSpkRNw6_kNbpV_X0GcXr2wXGs-TLUAWC3AUijV2LrYI7I8efB8-8VSRSTZ6p3toFdekSYsCdsaXRN5CbuR46HRnFCUySm2ddsIsq28XSLw0azx.hyECWj6GMYI3Pn4OvW-BRQ',
    data: {
      'myinfo.name':
        'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIiwia2lkIjoiZ09HUmdaeDdGd0IwaFMxSjJNM3dlaVc2VkNfWGxNV3JPZko3S0JncDR0byJ9..2QqBokMegQ-2daM2.7U6qH4ATIf82sX9wzxw.kpSwK0MT-qGO4YQwCwSL2A',
    },
  }

  let db: Sequelize
  let verifySgidCallback: StrategyVerifyCallbackUserInfo<AuthUserDto>
  let PublicUser: ModelCtor<PublicUserModel>

  const mockDone = jest.fn()

  beforeAll(async () => {
    // Create DB stuff
    db = await createTestDatabase()
    PublicUser = getModel<PublicUserModel>(db, ModelName.PublicUser)
    await PublicUser.create({
      sgid: 'u=35',
      displayname: 'LIM YONG XIANG',
      active: true,
    })
    verifySgidCallback = _sgidStrategy.sgidCallback(PublicUser, privateKeyPem)
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('finds user if user already exists', async () => {
    //Arrange
    const mockPublicUser = await PublicUser.findOne()
    const mockAuthUserDto = {
      id: mockPublicUser?.id,
      type: UserAuthType.Public,
    }
    mockTokenset.claims.mockReturnValue({
      sub: 'u=35',
    })

    //Act
    await verifySgidCallback(mockTokenset, mockUserInfo, mockDone)

    //Assert
    expect(mockDone).toBeCalledWith(null, mockAuthUserDto)
  })

  it('creates user if first time user', async () => {
    //Arrange
    mockTokenset.claims.mockReturnValue({
      sub: 'u=36',
    })

    //Act
    await verifySgidCallback(mockTokenset, mockUserInfo, mockDone)

    //Assert
    const mockPublicUser = await PublicUser.findOne({
      where: { sgid: 'u=36' },
    })
    const mockAuthUserDto = {
      id: mockPublicUser?.id,
      type: UserAuthType.Public,
    }
    expect(mockDone).toBeCalledWith(null, mockAuthUserDto)
  })

  it('throws error if payload key is invalid', async () => {
    //Arrange
    const mockInvalidUserInfo = mockUserInfo
    mockInvalidUserInfo.key = 'invalid_key'

    //Act
    await verifySgidCallback(mockTokenset, mockInvalidUserInfo, mockDone)

    //Assert
    expect(mockDone).toBeCalledWith(new JWEInvalid('Invalid Compact JWE'))
  })

  it('throws error if wrong private key', async () => {
    //Arrange
    const invalidPrivateKeyPem =
      '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC/GXROmdTcNrwK\n33HSXiUoDESBvdekfmuuF4jeu/pxp+QCG4Lt4LcfACi8YBwmq2ZTkVzhmdd9sTpI\nSJzR+YqzliJtWtqpjTYKwPiJMGt50Ng+xfyuu9zKQdVZh+4htwrSexNLDF8Vy+Gd\nOAnVmHlryJLeOrmmm7ZeTwSiRe6s2S1EYH0yIaNWfvVCf9Ca737z04yU0HudaKPI\nFES7XMfVzCaXuOHNzEY0oGY4bvzqmoRNdIikkYp4TGZdWJfHsbXgcCBt67IMwgny\nB8L8kmvVc5vGnTM/aVnB5KPWwACN3+ij5evl01ACZFxFotxHGyRgpuD1U0cnkaS3\ngWVZ1Kn3AgMBAAECggEBALxM16cPu4gWQuovzJcuf0xb8jEpoFAM5gvQUuSus5PE\njE5rT3MYJzjbzkf4KCUOZTDZHn2KOqU2uig5rJTWYA6fVGMO0EGbzHGCPiPoWy7Y\nVAxeyKJgqKl/fzvOTh5Yn8hQz+z2TsdKc5CYhFA9Av/qzpU9pmt+KY/6KqW/ZPRZ\nADNb8/DCh6hieBYIB2UlVqykj3j1cHVFVsHiBOQ7tLaHxQiWWQck6fYfLVxvZEvc\nbz8i+aEzf2bU5TrSJgKXOQNmgrby3VZEOi0clSVsbHYcWhGXEyZh6+kNh8BUN14O\nFS0zwrf6i0XKAcRelfXwMiSk/ryvT25s6xVqJMXHtzECgYEA+fQZG1U73PV3Ldy2\nQ+BO0GxtLp6xWmNJQuXb8Kg5mqy2yOLzLdtkgFWzvRjian/6lcQr6iRJbv/E/XKh\nkN17YABrDR5z4Q4Mca8Xu1ryjyKWQOpZnEJD4c9HVCg8RDMeK1BS9O/S1IW+veHe\nGkD2mXLC6tUGXeeNg2A5O894pt8CgYEAw7jjGeabrmZJV4g6dEDDbuQGHEJ6QSwU\n++rEkqte28oFxr3jeNmHpSlbWk2rl+TkOUGe8RuOqCc1evCDXpHWCYdlj6PB/pZf\nLBJPGodpF6QiXC5EpDAiZyvLEUjpJpFe4L/9KNssuPacOaT9vCKO1QSX3rLb4rra\n8o6xgwCRV+kCgYEAhHkYrWHZHlyCU648c3D4lIJCw4ib2pnwhCIrFTszfIS5Q3L1\nC4LRmyrQ3hHIPkWh26pi0+9zc/7euqz8cDjSYKkYE5XmOIsnkUEJROUI1U+xbqpF\n4AlGzPD8jt/cQREOlko2DVbl2HkiBKUm/6cai21FXQyWGULVv6FJ9CcbfOUCgYAb\nYrlUHHJYGrPUbZlQPueZkopQVfTpPZPKE/VhWF0zf7cDMfqsJDPYpkrD/e4umLZe\nVJI6xlJVsPbItvKKvvkl6C4LxSwVxVCXyBANdDj+N9ce8tJj7uBBc108k+kbnmea\nJwLzPoepccg2QKHIO0WlBLmDTZ96wA52tgScge3UUQKBgQDS9gQguNjvElMAVkYV\n13ipDMg+zC24r4QgKQIS5myMagKT6Vri0OzdRGMbTjs9stfK2KOyZn8+P3RAgTnk\neJWKIA52fKgYXlsxlRFy9/R09Ebc1mUVqFdfNHjmlGUzoE+acB+X8vgKZDTK77Yp\nh3EcGdCy39kkNllXZtYzBN1cNA==\n-----END PRIVATE KEY-----'

    const verifySgidCallbackWithWrongPrivateKey = _sgidStrategy.sgidCallback(
      PublicUser,
      invalidPrivateKeyPem,
    )

    //Act
    await verifySgidCallbackWithWrongPrivateKey(
      mockTokenset,
      mockUserInfo,
      mockDone,
    )

    //Assert
    expect(mockDone).toBeCalledWith(new JWEInvalid('Invalid Compact JWE'))
  })
})
