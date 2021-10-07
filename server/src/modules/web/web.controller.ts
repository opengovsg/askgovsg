import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { createLogger } from '../../bootstrap/logging'
import { ControllerHandler } from '../../types/response-handler'
import { AgencyService } from '../agency/agency.service'
import { AnswersService } from '../answers/answers.service'
import { PostService } from '../post/post.service'
import { WebService } from './web.service'
import { MissingAgencyError } from '../agency/agency.errors'
import { err } from 'neverthrow'

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
   * @returns 500 if agency does not exist
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
          req.params.shortname,
          agency.value.longname,
        )
        return res.status(StatusCodes.OK).send(agencyPage)
      } else {
        logger.error({
          message: 'Error while getting agency page',
          meta: {
            function: 'getAgencyPage',
            shortname: req.params.shortname,
          },
        })
        if (String(agency.error.statusCode === StatusCodes.NOT_FOUND))
          return res.status(StatusCodes.NOT_FOUND).redirect('/not-found')
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
   * @param postId post id
   * @returns 200 with static post page
   * @returns 500 if post or answers do not exist
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
        const postPage = await this.webService.getQuestionPage(
          post.title,
          answers[0].body,
        )
        return res.status(StatusCodes.OK).send(postPage)
      } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(this.index)
      }
    } catch (error) {
      logger.error({
        message: 'Error while getting post page',
        meta: {
          function: 'getPostPage',
          shortname: req.params.id,
        },
        error,
      })
      return res.status(StatusCodes.NOT_FOUND).redirect('/not-found')
    }
  }
}
