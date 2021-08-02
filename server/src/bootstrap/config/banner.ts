import convict, { Schema } from 'convict'

export type BannerConfig = {
  siteWideMessage: string
}

const bannerSchema: Schema<BannerConfig> = {
  siteWideMessage: {
    doc: 'Banner deployed throughout all routes on site',
    format: String,
    default: '',
    env: 'BANNER_MESSAGE',
  },
}

export const bannerConfig = convict(bannerSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
