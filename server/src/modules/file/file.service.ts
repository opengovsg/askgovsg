import { S3 } from '@aws-sdk/client-s3'
import { createLogger } from '../../bootstrap/logging'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)

const logger = createLogger(module)

type FileMetadata = {
  name: string
  mimeType: string
  buffer: Buffer
  size: number
}

type FileUploadDto = {
  link: string
}

export class FileService {
  private s3: Pick<S3, 'putObject'>
  private bucket: string
  private host: string
  private idGenerator: typeof nanoid

  constructor({
    s3,
    bucket,
    host,
    idGenerator = nanoid,
  }: {
    s3: Pick<S3, 'putObject'>
    bucket: string
    host: string
    idGenerator?: typeof nanoid
  }) {
    this.s3 = s3
    this.bucket = bucket
    this.host = host
    this.idGenerator = idGenerator
  }

  public async upload({
    name: fileName,
    buffer,
    mimeType,
    size,
  }: FileMetadata): Promise<FileUploadDto> {
    const [name, extension] = fileName.split('.')
    const id = this.idGenerator()
    const key = `${name}-${id}` + (extension ? `.${extension}` : '')
    const meta = {
      function: 'upload',
      key,
    }
    logger.info({
      message: `Uploading file as ${key}`,
      meta,
    })
    const response = await this.s3.putObject({
      ACL: 'public-read',
      Body: buffer,
      Bucket: this.bucket,
      ContentType: mimeType,
      ContentLength: size,
      Key: key,
    })
    logger.info({
      message: `Upload of ${key} successful`,
      meta: {
        ...meta,
        response: response.$metadata,
      },
    })
    return { link: `${this.host}/${key}` }
  }
}
