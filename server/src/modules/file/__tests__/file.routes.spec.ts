import { routeFiles } from '../file.routes'
import { FileController } from '../file.controller'
import express from 'express'
import supertest from 'supertest'
import { FileService } from '../file.service'
import { StatusCodes } from 'http-status-codes'

describe('/files', () => {
  // Provide as few mocks as possible so that we
  // can focus on the biz logic for /files while
  // we exercise the entire end-to-end request flow
  const path = '/files'

  const host = 'http://host'
  const bucket = 's3.bucket'
  const s3 = { putObject: jest.fn() }
  const idGenerator = () => 'abc123'

  const authMiddleware = {
    authenticate: jest.fn(),
  }

  const app = express()
  app.use(
    path,
    routeFiles({
      controller: new FileController({
        fileService: new FileService({
          host,
          bucket,
          s3,
          idGenerator,
        }),
      }),
      authMiddleware,
      maxFileSize: Number.MAX_VALUE,
    }),
  )

  beforeEach(() => {
    s3.putObject.mockReset()
    s3.putObject.mockResolvedValue({})
    authMiddleware.authenticate.mockImplementation((_req, _res, next) => next())
  })

  it('returns 200 on upload', async () => {
    // Arrange
    const request = supertest(app)
    const fileName = 'file.txt'
    const buffer = Buffer.from('some-file-content')
    const s3Params = {
      ACL: 'public-read',
      Body: buffer,
      Bucket: bucket,
      ContentType: 'text/plain',
      ContentLength: buffer.length,
      Key: `file-${idGenerator()}.txt`,
    }

    // Act
    const response = await request.post(path).attach('file', s3Params.Body, {
      filename: fileName,
      contentType: s3Params.ContentType,
    })

    // Assert
    expect(response.status).toEqual(StatusCodes.OK)
    expect(response.body).toStrictEqual({ link: `${host}/${s3Params.Key}` })
    expect(s3.putObject).toHaveBeenCalledWith(s3Params)
  })
})
