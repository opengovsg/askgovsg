import convict, { Schema } from 'convict'

export type FullStoryConfig = {
  fullStoryOrgId: string
}

const fullStorySchema: Schema<FullStoryConfig> = {
  fullStoryOrgId: {
    doc: 'Organisation ID for FullStory analytics',
    format: String,
    default: '',
    env: 'FULLSTORY_ORG_ID',
  },
}

export const fullStoryConfig = convict(fullStorySchema)
  .validate({ allowed: 'strict' })
  .getProperties()
