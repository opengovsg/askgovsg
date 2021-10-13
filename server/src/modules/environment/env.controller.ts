import { EnvironmentDto } from '~shared/types/api'
import { ControllerHandler } from '../../types/response-handler'

export class EnvController {
  private bannerMessage: string
  private googleAnalyticsId: string
  private fullStoryOrgId: string

  constructor({
    bannerMessage,
    googleAnalyticsId,
    fullStoryOrgId,
  }: {
    bannerMessage: string
    googleAnalyticsId: string
    fullStoryOrgId: string
  }) {
    this.bannerMessage = bannerMessage
    this.googleAnalyticsId = googleAnalyticsId
    this.fullStoryOrgId = fullStoryOrgId
  }
  getEnvironmentVars: ControllerHandler<never, EnvironmentDto> = (
    _req,
    res,
  ) => {
    return res.json({
      bannerMessage: this.bannerMessage,
      googleAnalyticsId: this.googleAnalyticsId,
      fullStoryOrgId: this.fullStoryOrgId,
    })
  }
}
