import convict, { Schema } from 'convict'
import { S3ClientConfig } from '@aws-sdk/client-s3'
import { url } from 'convict-format-with-validator'

convict.addFormat(url)

type FileConfig = {
  client: S3ClientConfig
  fileBucketName: string
  maxFileSize: number
}

const fileSchema: Schema<FileConfig> = {
  client: {
    region: {
      doc: 'The AWS region',
      format: String,
      default: 'ap-southeast-1',
      env: 'AWS_REGION',
    },
  },
  fileBucketName: {
    doc: 'The S3 bucket name to hold files, and also the hostname for serving them',
    format: String,
    default: null,
    env: 'FILE_BUCKET_NAME',
  },
  maxFileSize: {
    doc: 'The maximum allowed file upload size in bytes',
    format: Number,
    default: 10 * 1024 * 1024,
    env: 'MAX_FILE_SIZE',
  },
}

export const fileConfig = convict(fileSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
