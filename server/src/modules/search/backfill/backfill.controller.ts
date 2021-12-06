import { ResultAsync } from 'neverthrow'
import sanitizeHtml from 'sanitize-html'
import { createLogger } from '../../../bootstrap/logging'
import { SortType } from '../../../types/sort-type'
import { AnswersService } from '../../answers/answers.service'
import { DatabaseError } from '../../core/core.errors'
import { InvalidTagsError, InvalidTopicsError } from '../../post/post.errors'
import { PostService } from '../../post/post.service'
import { SearchEntry } from '../search.service'
import { BackfillService } from './backfill.service'

const logger = createLogger(module)

/**
 * Handles logic requiring other services, errors and returns responses accordingly.
 * Note: Some methods will not return HTTP responses and instead return ResultAsync
 * for internal server use e.g. indexAllData
 */
export class BackfillController {
  private answersService: Pick<AnswersService, 'listAnswers'>
  private postService: Pick<PostService, 'listPosts'>
  private searchService: Pick<BackfillService, 'indexAllData'>

  constructor({
    answersService,
    postService,
    searchService,
  }: {
    answersService: Pick<AnswersService, 'listAnswers'>
    postService: Pick<PostService, 'listPosts'>
    searchService: Pick<BackfillService, 'indexAllData'>
  }) {
    this.answersService = answersService
    this.postService = postService
    this.searchService = searchService
  }

  /**
   * Pulls relevant data from database and indexes it in opensearch
   * Note: Will not be hooked up to an endpoint
   * @param indexName
   * @returns result async with error or response
   */
  indexAllData = async (indexName: string) => {
    return await ResultAsync.fromPromise(
      this.postService.listPosts({
        sort: SortType.Top,
        agencyId: Number(undefined),
      }),
      (err) => {
        logger.error({
          message:
            'Error while indexing data for OpenSearch - postService.listPosts',
          meta: {
            function: 'indexAllData',
          },
          error: err,
        })
        return err as InvalidTagsError | InvalidTopicsError
      },
    )
      .map(async (postResponse) => {
        const searchEntriesDataset: SearchEntry[] = []
        for (const post of postResponse.posts) {
          const listAnswersResult = await ResultAsync.fromPromise(
            this.answersService.listAnswers(post.id),
            (err) => {
              logger.error({
                message:
                  'Error while indexing data for OpenSearch - answersService.listAnswers',
                meta: {
                  function: 'indexAllData',
                },
                error: err,
              })
              return err as DatabaseError
            },
          ).map((answers) => {
            const answerBodyList = []
            for (const answer of answers) {
              answerBodyList.push(
                sanitizeHtml(answer.body, {
                  allowedTags: [],
                  allowedAttributes: {},
                }),
              )
            }
            searchEntriesDataset.push({
              title: post.title,
              description: post.description,
              answers: answerBodyList,
              agencyId: post.agencyId,
              postId: post.id,
              topicId: post.topicId,
            })
          })
          if (listAnswersResult.isErr()) {
            return listAnswersResult
          }
        }
        return await this.searchService.indexAllData(
          indexName,
          searchEntriesDataset,
        )
      })
      .andThen((result) => result)
  }
}
