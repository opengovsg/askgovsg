import { Client } from '@opensearch-project/opensearch'
import { QueryDslMultiMatchQuery } from '@opensearch-project/opensearch/api/types'
import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { ResultAsync } from 'neverthrow'
import { createLogger } from '../../bootstrap/logging'

const logger = createLogger(module)

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
      fields: ['title', 'description', 'answers'],
      type: 'most_fields',
      fuzziness: 'AUTO',
      analyzer: 'stop',
    }
    return ResultAsync.fromPromise(
      this.client.search({
        index,
        body: {
          query: { multi_match: multiMatchQuery },
          ...(agencyId && { post_filter: { term: { agencyId: agencyId } } }),
          highlight: {
            fields: { title: {}, description: {}, answers: {} },
            pre_tags: '<b>',
            post_tags: '</b>',
            fragment_size: 200,
          },
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
