import { fileConfig } from './config/file'
import { baseConfig, Environment } from './config/base'
import { S3 } from '@aws-sdk/client-s3'

const LOCALSTACK_ENDPOINT = 'http://localhost:4566'

export const s3 = new S3({
  ...fileConfig.client,
  ...(baseConfig.nodeEnv === Environment.Dev
    ? { endpoint: LOCALSTACK_ENDPOINT, forcePathStyle: true }
    : {}),
})

export const bucket = fileConfig.fileBucketName

export const host =
  baseConfig.nodeEnv === Environment.Dev
    ? `${LOCALSTACK_ENDPOINT}/${bucket}`
    : `https://${bucket}`
