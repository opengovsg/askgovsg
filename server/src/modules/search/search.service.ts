import { Client } from '@opensearch-project/opensearch'
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

  indexAllData = async (
    indexName: string,
    searchEntriesDataset: SearchEntry[],
  ) => {
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
          const erroredDocuments: {
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: any
            error: any
            operation:
              | {
                  title: string
                  description: string | null
                  answer: string
                  agencyId: number
                  postId: number
                  topicId: number | null
                }
              | { index: { _index: string } }
            document:
              | {
                  title: string
                  description: string | null
                  answer: string
                  agencyId: number
                  postId: number
                  topicId: number | null
                }
              | { index: { _index: string } }
          }[] = []
          // The items array has the same order of the dataset we just indexed.
          // The presence of the `error` key indicates that the operation
          // that we did for the document has failed.
          bulkResponse.items.forEach(
            (
              action: { [x: string]: { status: any; error: any } },
              i: number,
            ) => {
              const operation = Object.keys(action)[0]
              if (action[operation].error) {
                erroredDocuments.push({
                  // If the status is 429 it means that you can retry the document,
                  // otherwise it's very likely a mapping error, and you should
                  // fix the document before to try it again.
                  status: action[operation].status,
                  error: action[operation].error,
                  operation: body[i * 2],
                  document: body[i * 2 + 1],
                })
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
}
