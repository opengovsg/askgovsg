import { SearchHit } from '@opensearch-project/opensearch/api/types'
import { validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { createLogger } from '../../bootstrap/logging'
import { Message } from '../../types/message-type'
import { ControllerHandler } from '../../types/response-handler'
import { SearchService } from './search.service'

const logger = createLogger(module)

/**
 * Handles logic requiring other services, errors and returns responses accordingly.
 * Note: Some methods will not return HTTP responses and instead return ResultAsync
 * for internal server use e.g. indexAllData
 */
export class SearchController {
  private searchService: Pick<SearchService, 'searchPosts'>

  constructor({
    searchService,
  }: {
    searchService: Pick<SearchService, 'searchPosts'>
  }) {
    this.searchService = searchService
  }

  /**
   * Handle responses related to post searches
   * @query agencyId
   * @query search
   * @returns 200 relevant search entries sorted by relevance
   * @returns 500 search request fails
   */
  searchPosts: ControllerHandler<
    undefined,
    Buffer | Message,
    undefined,
    { agencyId: number | undefined; query: string }
  > = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      logger.error({
        message: 'Error while searching posts - request validation',
        meta: {
          function: 'searchPosts',
          agencyId: req.query.agencyId,
          query: req.query.query,
        },
        error: errors,
      })
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: 'Bad Request Error - query does not pass validation checks',
      })
    }
    const index = 'search_entries'
    return (
      await this.searchService.searchPosts(
        index,
        req.query.query,
        req.query.agencyId,
      )
    )
      .map((response) => {
        const searchResults = response.body.hits.hits.map(
          (result: SearchHit) => {
            return { result: result._source, highlight: result.highlight }
          },
        )
        return res.status(StatusCodes.OK).json(searchResults)
      })
      .mapErr((error) => {
        logger.error({
          message: 'Error while searching posts',
          meta: {
            function: 'searchPosts',
            agencyId: req.query.agencyId,
            query: req.query.query,
          },
          error,
        })
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
      })
  }
}
