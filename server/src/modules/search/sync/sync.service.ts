import { ApiResponse, Client } from '@opensearch-project/opensearch'
import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { ResultAsync } from 'neverthrow'
import { SearchEntry } from '~shared/types/api/search'
import { createLogger } from '../../../bootstrap/logging'

const logger = createLogger(module)

export class SyncService {
  private client: Client

  constructor({ client }: { client: Client }) {
    this.client = client
  }

  /**
   * Creates posts in opensearch index
   * @param index index name
   * @param body search entry to index
   * @returns results async with opensearch response
   */
  createPost = (
    index: string,
    body: SearchEntry,
  ): ResultAsync<
    ApiResponse<Record<string, any>, unknown>,
    ResponseError<Record<string, any>, unknown>
  > => {
    return ResultAsync.fromPromise(
      this.client.create({
        index,
        id: `${body.postId}`,
        body,
        refresh: true,
      }),
      (err) => {
        logger.error({
          message: 'Error while adding posts for OpenSearch - client.index',
          meta: {
            function: 'searchPosts',
          },
          error: err,
        })
        return err as ResponseError
      },
    )
  }

  /**
   * Updates posts in opensearch index
   * @param index index name
   * @param partialDoc search entry to index
   * @returns results async with opensearch response
   */
  updatePost = (
    index: string,
    partialDoc: SearchEntry,
  ): ResultAsync<
    ApiResponse<Record<string, any>, unknown>,
    ResponseError<Record<string, any>, unknown>
  > => {
    return ResultAsync.fromPromise(
      this.client.update({
        index,
        id: `${partialDoc.postId}`,
        body: { doc: partialDoc },
        refresh: true,
      }),
      (err) => {
        logger.error({
          message: 'Error while adding posts for OpenSearch - client.index',
          meta: {
            function: 'searchPosts',
          },
          error: err,
        })
        return err as ResponseError
      },
    )
  }
}
