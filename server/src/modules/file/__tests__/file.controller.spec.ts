import { FileController } from '../file.controller'
import express from 'express'
import multer from 'multer'
import supertest from 'supertest'
import { StatusCodes } from 'http-status-codes'

describe('FileController', () => {
  const storage = multer.memoryStorage()
  const upload = multer({ storage })

  const path = '/files'
  const fileParam = 'file'
  const buffer = Buffer.from('some-file-content')
  const uploadParams = {
    name: 'file.txt',
    buffer,
    mimeType: 'text/plain',
    size: buffer.length,
  }

  const fileService = { upload: jest.fn() }

  const controller = new FileController({ fileService })

  beforeEach(() => {
    fileService.upload.mockReset()
  })

  describe('upload', () => {
    it('returns 400 on no file', async () => {
      // Arrange
      const app = express()
      app.post(path, controller.upload)
      const request = supertest(app)

      // Act
      const response = await request.post(path)

      // Assert
      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
    })

    it('returns 400 on bad service upload', async () => {
      // Arrange
      const message = 'message'
      const error = new Error(message)
      fileService.upload.mockRejectedValue(error)

      const app = express()
      app.post(path, upload.single(fileParam), controller.upload)
      const request = supertest(app)

      // Act
      const response = await request
        .post(path)
        .attach(fileParam, uploadParams.buffer, {
          contentType: uploadParams.mimeType,
          filename: uploadParams.name,
        })

      // Assert
      expect(response.status).toEqual(StatusCodes.BAD_REQUEST)
      expect(response.body).toStrictEqual({ message })
      expect(fileService.upload).toHaveBeenCalledWith(uploadParams)
    })

    it('returns 200 on good service upload', async () => {
      // Arrange
      const url = 'http://link.to.the/file'
      fileService.upload.mockResolvedValue({ url })

      const app = express()
      app.post(path, upload.single(fileParam), controller.upload)
      const request = supertest(app)

      // Act
      const response = await request
        .post(path)
        .attach(fileParam, uploadParams.buffer, {
          contentType: uploadParams.mimeType,
          filename: uploadParams.name,
        })

      // Assert
      expect(response.status).toEqual(StatusCodes.OK)
      expect(response.body).toStrictEqual({ url })
    })
  })
})
