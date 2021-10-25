import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { combine, ResultAsync } from 'neverthrow'
import sanitizeHtml from 'sanitize-html'
import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { SortType } from '../../types/sort-type'
import { AgencyService } from '../agency/agency.service'
import { AnswersService } from '../answers/answers.service'
import { InvalidTagsError } from '../post/post.errors'
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
    return await this.agencyService
      .findOneByName({
        shortname: req.params.shortname,
      })
      .map((agency) => {
        const agencyPage = this.webService.getAgencyPage(
          this.index,
          req.params.shortname,
          agency.longname,
        )
        return res.status(StatusCodes.OK).send(agencyPage)
      })
      .mapErr((err) => {
        logger.error({
          message: `${err.name} while getting agency page: ${err.message}`,
          meta: {
            function: 'getAgencyPage',
            shortname: req.params.shortname,
          },
          error: err,
        })
        if (err.statusCode === StatusCodes.NOT_FOUND)
          return res.redirect(StatusCodes.MOVED_PERMANENTLY, '/not-found')
        else
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(this.index)
      })
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
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).send(this.index)
    }
    const postResultAsync = await ResultAsync.fromPromise(
      this.postService.getSinglePost(req.params.id, 0, false),
      (err) => {
        logger.error({
          message:
            'Error while getting question page - postService.getSinglePost',
          meta: {
            function: 'getQuestionPage',
            shortname: req.params.id,
          },
          error: err,
        })
        return res.redirect(StatusCodes.MOVED_PERMANENTLY, '/not-found')
      },
    )
    const answersResultAsync = await ResultAsync.fromPromise(
      this.answersService.listAnswers(req.params.id),
      (err) => {
        logger.error({
          message:
            'Error while getting question page - answersService.listAnswers',
          meta: {
            function: 'getQuestionPage',
            shortname: req.params.id,
          },
          error: err,
        })
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(this.index)
      },
    )

    // TODO: add mapErr when post and answer service have been migrated to neverthrow
    return combine([postResultAsync, answersResultAsync] as const).map(
      ([post, answers]) => {
        if (answers && answers.length > 0) {
          const answerBody = sanitizeHtml(answers[0].body, {
            allowedTags: [],
            allowedAttributes: {},
          })
          const questionPage = this.webService.getQuestionPage(
            this.index,
            post.title,
            answerBody,
          )
          return res.status(StatusCodes.OK).send(questionPage)
        } else
          logger.error({
            message: 'Error while getting question page - no answers',
            meta: {
              function: 'getQuestionPage',
              shortname: req.params.id,
            },
          })
        return res.redirect(StatusCodes.MOVED_PERMANENTLY, '/not-found')
      },
    )
  }

  /**
   * Gets sitemap urls
   * @returns list of sitemap urls
   */
  getSitemapUrls = async () => {
    const postListResultAsync = await ResultAsync.fromPromise(
      this.postService.listPosts({
        sort: SortType.Top,
        tags: '',
      }),
      (err) => {
        logger.error({
          message: 'Error while getting sitemap urls',
          meta: {
            function: 'getSitemapUrls',
          },
          error: err,
        })
        return err as InvalidTagsError
      },
    )
    const agenciesResultAsync = await this.agencyService
      .listAgencyShortnames()
      .mapErr((err) => {
        logger.error({
          message: `${err.name} while getting sitemap urls: ${err.message}`,
          meta: {
            function: 'getSitemapUrls',
          },
          error: err,
        })
        return err
      })
    const combineResultAsyncs = combine([
      postListResultAsync,
      agenciesResultAsync,
    ] as const)
      .map(([allPosts, allAgencyShortnames]) => {
        return this.webService.getSitemapUrls(
          allPosts.posts,
          allAgencyShortnames,
        )
      })
      .mapErr((err) => {
        return err
      })
    return combineResultAsyncs.isOk()
      ? combineResultAsyncs.value
      : this.webService.getSitemapUrls([], [])
  }
}
