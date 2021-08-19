import { FileService } from '../file.service'

describe('FileService', () => {
  const host = 'http://host'
  const bucket = 's3.bucket'
  const s3 = { putObject: jest.fn() }
  const idGenerator = () => 'abc123'

  const fileService = new FileService({
    host,
    bucket,
    s3,
    idGenerator,
  })

  describe('upload', () => {
    beforeEach(() => {
      s3.putObject.mockReset()
      s3.putObject.mockResolvedValue({})
    })

    it('calls s3 and returns the url to the uploaded file', async () => {
      // Arrange
      const name = 'file.txt'
      const buffer = Buffer.from('some-file-content')
      const mimeType = 'text/plain'
      const s3Params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: bucket,
        ContentType: mimeType,
        ContentLength: buffer.length,
        Key: `file-${idGenerator()}.txt`,
      }

      // Act
      const result = await fileService.upload({
        name,
        buffer,
        mimeType,
        size: buffer.length,
      })

      // Assert
      expect(result).toStrictEqual({ link: `${host}/${s3Params.Key}` })
      expect(s3.putObject).toHaveBeenCalledWith(s3Params)
    })
  })
})
