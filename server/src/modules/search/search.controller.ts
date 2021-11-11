import { ResultAsync } from 'neverthrow'
import sanitizeHtml from 'sanitize-html'
import { createLogger } from '../../bootstrap/logging'
import { SortType } from '../../types/sort-type'
import { AnswersService } from '../answers/answers.service'
import { DatabaseError } from '../core/core.errors'
import { InvalidTagsError, InvalidTopicsError } from '../post/post.errors'
import { PostService } from '../post/post.service'
import { SearchEntry, SearchService } from './search.service'

const logger = createLogger(module)

export class SearchController {
  private answersService: Pick<AnswersService, 'listAnswers'>
  private postService: Pick<PostService, 'listPosts'>
  private searchService: Pick<SearchService, 'indexAllData'>

  constructor({
    answersService,
    postService,
    searchService,
  }: {
    answersService: Pick<AnswersService, 'listAnswers'>
    postService: Pick<PostService, 'listPosts'>
    searchService: Pick<SearchService, 'indexAllData'>
  }) {
    this.answersService = answersService
    this.postService = postService
    this.searchService = searchService
  }

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
            searchEntriesDataset.push({
              title: post.title,
              description: post.description,
              answer: sanitizeHtml(answers[0].body, {
                allowedTags: [],
                allowedAttributes: {},
              }),
              agencyId: post.agencyId,
              postId: post.id,
              topicId: post.topicId,
            })
          })
          if (listAnswersResult.isErr()) {
            return listAnswersResult //.error
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
