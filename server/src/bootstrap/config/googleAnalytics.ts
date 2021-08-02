import convict, { Schema } from 'convict'

export type GoogleAnalyticsConfig = {
  googleAnalyticsId: string
}

const googleAnalyticsSchema: Schema<GoogleAnalyticsConfig> = {
  googleAnalyticsId: {
    doc: 'Organisation ID for Google Analytics',
    format: String,
    default: '',
    env: 'GA_TRACKING_ID',
  },
}

export const googleAnalyticsConfig = convict(googleAnalyticsSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
