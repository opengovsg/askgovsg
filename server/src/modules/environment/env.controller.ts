import { Request, Response } from 'express'

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
  getEnvironmentVars = (_req: Request, res: Response): Response => {
    return res.json({
      bannerMessage: this.bannerMessage,
      googleAnalyticsId: this.googleAnalyticsId,
      fullStoryOrgId: this.fullStoryOrgId,
    })
  }
}
