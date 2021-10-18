import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import sanitizeHtml from 'sanitize-html'
import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { SortType } from '../../types/sort-type'
import { AgencyService } from '../agency/agency.service'
import { AnswersService } from '../answers/answers.service'
import { PostService } from '../post/post.service'
import { WebService } from './web.service'

const logger = createLogger(module)

export class WebController {
  private agencyService: Public<AgencyService>
  private answersService: Public<AnswersService>
  private postService: Public<PostService>
  private webService: Public<WebService>
  private index: Buffer

  constructor({
    agencyService,
    answersService,
    postService,
    webService,
    index,
  }: {
    agencyService: Public<AgencyService>
    answersService: Public<AnswersService>
    postService: Public<PostService>
    webService: Public<WebService>
    index: Buffer
  }) {
    this.agencyService = agencyService
    this.answersService = answersService
    this.postService = postService
    this.webService = webService
    this.index = index
  }

  /**
   * Gets static agency page
   * @param shortname agency shortname
   * @returns 200 with static agency page
   * @returns 404 if agency does not exist
   * @returns 500 any other error
   */
  getAgencyPage: ControllerHandler<
    { shortname: string },
    Buffer | string,
    undefined,
    undefined
  > = async (req, res) => {
    try {
      const agency = await this.agencyService.findOneByName({
        shortname: req.params.shortname,
      })
      if (agency.isOk()) {
        const agencyPage = await this.webService.getAgencyPage(
          this.index,
          req.params.shortname,
          agency.value.longname,
        )
        return res.status(StatusCodes.OK).send(agencyPage)
      } else {
        logger.error({
          message: `${
            agency.error.name ?? 'Error'
          } while getting agency page: ${agency.error.message}`,
          meta: {
            function: 'getAgencyPage',
            shortname: req.params.shortname,
          },
          error: agency.error,
        })
        if (agency.error.statusCode === StatusCodes.NOT_FOUND)
          return res.status(StatusCodes.NOT_FOUND).redirect('/not-found')
        else
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(this.index)
      }
    } catch (error) {
      logger.error({
        message: 'Error while getting agency page',
        meta: {
          function: 'getAgencyPage',
          shortname: req.params.shortname,
        },
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(this.index)
    }
  }

  /**
   * Gets static post page
   * @param id post id
   * @returns 200 with static post page
   * @returns 404 if post does not exist
   * @returns 500 if answers to post do not exist
   */
  getQuestionPage: ControllerHandler<
    { id: number },
    Buffer | string,
    undefined,
    undefined
  > = async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).send(this.index)
      }
      const post = await this.postService.getSinglePost(req.params.id, 0, false)
      const answers = await this.answersService.listAnswers(req.params.id)
      if (answers && answers.length > 0) {
        const answerBody = sanitizeHtml(answers[0].body, {
          allowedTags: [],
          allowedAttributes: {},
        })
        const questionPage = await this.webService.getQuestionPage(
          this.index,
          post.title,
          answerBody,
        )
        return res.status(StatusCodes.OK).send(questionPage)
      } else
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(this.index)
    } catch (error) {
      logger.error({
        message: 'Error while getting post page',
        meta: {
          function: 'getQuestionPage',
          shortname: req.params.id,
        },
        error,
      })
      return res.status(StatusCodes.NOT_FOUND).redirect('/not-found')
    }
  }

  /**
   * Gets sitemap urls
   * @returns list of sitemap urls
   */
  getSitemapUrls = async () => {
    try {
      const { posts: allPosts } = await this.postService.listPosts({
        sort: SortType.Top,
        tags: '',
      })
      const allAgencyShortnames =
        await this.agencyService.listAgencyShortnames()
      if (allAgencyShortnames.isOk())
        return await this.webService.getSitemapUrls(
          allPosts,
          allAgencyShortnames.value,
        )
      else return []
    } catch (error) {
      logger.error({
        message: 'Error while getting sitemap urls',
        meta: {
          function: 'getSitemapUrls',
        },
        error,
      })
      return []
    }
  }
}
