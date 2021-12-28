import { Client } from '@opensearch-project/opensearch'
import { BulkResponseItemBase } from '@opensearch-project/opensearch/api/types'
import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { SearchEntry } from '~shared/types/api/search'
import { createLogger } from '../../../bootstrap/logging'
import { indexConfig } from './index-config'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { errors } = require('@opensearch-project/opensearch')

const logger = createLogger(module)

export class BackfillService {
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
  indexAllData = async (
    indexName: string,
    searchEntriesDataset: SearchEntry[],
  ): Promise<ResultAsync<Record<string, any>, ResponseError>> => {
    const indexExistsResponse = await ResultAsync.fromPromise(
      this.client.indices.exists({ index: indexName }),
      (error) => {
        logger.error({
          message:
            'Error while indexing data for OpenSearch - client.indices.exists',
          meta: {
            function: 'indexAllData',
          },
          error,
        })
        return error as ResponseError
      },
    )
    if (indexExistsResponse.isErr()) return errAsync(indexExistsResponse.error)
    if (indexExistsResponse.value.statusCode == StatusCodes.NOT_FOUND) {
      const indiciesCreateResponse = await ResultAsync.fromPromise(
        this.client.indices.create({
          index: indexName,
          body: indexConfig,
        }),
        (error) => {
          logger.error({
            message:
              'Error while indexing data for OpenSearch - client.indices.create',
            meta: {
              function: 'indexAllData',
            },
            error,
          })
          return error as ResponseError
        },
      )
      if (indiciesCreateResponse.isErr())
        return errAsync(indiciesCreateResponse.error)
    }
    // If testing on live opensearch instance for 'should return error documents some
    // operations for client.bulk fail', change _index value to a camel case string.
    const body = searchEntriesDataset.flatMap((doc) => [
      { index: { _index: indexName, _id: doc.postId } },
      doc,
    ])
    return await ResultAsync.fromPromise(
      this.client.bulk({
        refresh: true,
        body,
      }),
      (error) => {
        logger.error({
          message: 'Error while indexing data for OpenSearch - client.bulk',
          meta: {
            function: 'indexAllData',
          },
          error,
        })
        return error as ResponseError
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
        return errAsync(
          new errors.ResponseError({
            body: { errors: erroredDocuments, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          }),
        )
      }
      return okAsync(bulkResponse)
    })
  }
}
