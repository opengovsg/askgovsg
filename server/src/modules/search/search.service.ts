import { Client } from '@opensearch-project/opensearch'
import {
  BulkResponseItemBase,
  QueryDslMultiMatchQuery,
} from '@opensearch-project/opensearch/api/types'
import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { createLogger } from '../../bootstrap/logging'

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
   * Indexes relevant information from database on opensearch
   * @param indexName index name
   * @param searchEntriesDataset search entries to be indexed
   * @returns response opensearch indexing request
   */
  indexAllData = (
    indexName: string,
    searchEntriesDataset: SearchEntry[],
  ): ResultAsync<
    Record<string, any>,
    ResponseError<Record<string, any>, unknown> | BulkResponseItemBase[]
  > => {
    return ResultAsync.fromPromise(
      this.client.indices.create({
        index: indexName,
      }),
      (err) => {
        logger.error({
          message:
            'Error while indexing data for OpenSearch - client.indices.create',
          meta: {
            function: 'indexAllData',
          },
          error: err,
        })
        return err as ResponseError
      },
    ).andThen((_) => {
      // If testing on live opensearch instance for 'should return error documents some
      // operations for client.bulk fail', change _index value to a camel case string.
      const body = searchEntriesDataset.flatMap((doc) => [
        { index: { _index: indexName } },
        doc,
      ])
      return ResultAsync.fromPromise(
        this.client.bulk({
          refresh: true,
          body,
        }),
        (err) => {
          logger.error({
            message: 'Error while indexing data for OpenSearch - client.bulk',
            meta: {
              function: 'indexAllData',
            },
            error: err,
          })
          return err as ResponseError
        },
      ).andThen(({ body: bulkResponse }) => {
        if (bulkResponse.errors) {
          const erroredDocuments: BulkResponseItemBase[] = []
          // The items array has the same order of the dataset we just indexed.
          // The presence of the `error` key indicates that the operation
          // that we did for the document has failed.
          bulkResponse.items.forEach(
            (action: { [x: string]: BulkResponseItemBase }, i: number) => {
              const operation = Object.keys(action)[0]
              if (action[operation].error) {
                // If the status is 429 it means that you can retry the document,
                // otherwise it's very likely a mapping error, and you should
                // fix the document before to try it again.
                erroredDocuments.push(action[operation])
              }
            },
          )
          logger.error({
            message:
              'Error while indexing data for OpenSearch - client.bulk (some operations)',
            meta: {
              function: 'indexAllData',
            },
            error: erroredDocuments,
          })
          return errAsync(erroredDocuments)
        }
        return okAsync(bulkResponse)
      })
    })
  }

  /**
   * Searches posts in opensearch index
   * @param index index name
   * @param searchQuery search query entered by user
   * @param agencyId agency id
   * @returns results async with relevant search entries ranked by relevance
   */
  searchPosts = async (
    index: string,
    searchQuery: string,
    agencyId?: number,
  ) => {
    const multiMatchQuery: QueryDslMultiMatchQuery = {
      query: searchQuery,
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
