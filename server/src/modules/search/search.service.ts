import { Client } from '@opensearch-project/opensearch'
import {
  BulkResponseItemBase,
  QueryDslMultiMatchQuery,
} from '@opensearch-project/opensearch/api/types'
import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { createLogger } from '../../bootstrap/logging'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { errors } = require('@opensearch-project/opensearch')

const logger = createLogger(module)

export type SearchEntry = {
  title: string
  description: string | null
  answer: string
  agencyId: number
  postId: number
  topicId: number | null
}

export class SearchService {
  private client: Client

  constructor({ client }: { client: Client }) {
    this.client = client
  }

  /**
   * Searches posts in opensearch index
   * @param index index name
   * @param query search query entered by user
   * @param agencyId agency id
   * @returns results async with relevant search entries ranked by relevance
   */
  searchPosts = async (index: string, query: string, agencyId?: number) => {
    const multiMatchQuery: QueryDslMultiMatchQuery = {
      query: query,
      fields: ['title', 'description', 'answer'],
      type: 'most_fields',
      fuzziness: 'AUTO',
    }
    return ResultAsync.fromPromise(
      this.client.search({
        index,
        body: {
          query: { multi_match: multiMatchQuery },
          ...(agencyId && { post_filter: { term: { agencyId: agencyId } } }),
        },
      }),
      (err) => {
        logger.error({
          message:
            'Error while searching data for OpenSearch - client.indices.search',
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
