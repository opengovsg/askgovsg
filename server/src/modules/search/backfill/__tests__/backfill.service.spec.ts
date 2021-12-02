import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { Mocker } from '../../opensearch-mock'
import { BackfillService, SearchEntry } from '../backfill.service'

// // Uncomment to test with live opensearch service
// import { baseConfig, Environment } from '../../../bootstrap/config/base'
// import { searchConfig } from '../../../bootstrap/config/search'
// import { Client } from '@opensearch-project/opensearch'
// import fs from 'fs'

// Comment when testing with live opensearch service
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, errors } = require('@opensearch-project/opensearch')

describe('BackfillSearchService', () => {
  // // Uncomment to test with live opensearch service
  // const host = searchConfig.host
  // const protocol = 'https'
  // const port = searchConfig.port
  // const auth = `${searchConfig.username}:${encodeURIComponent(
  //   searchConfig.password,
  // )}`
  // let connectionOptions
  // if (baseConfig.nodeEnv === Environment.Dev) {
  //   connectionOptions = { rejectUnauthorized: false } // Turn off certificate verification (rejectUnauthorized: false)
  // } else {
  //   connectionOptions = {
  //     ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt'),
  //   }
  // }
  // const client = new Client({
  //   node: protocol + '://' + auth + '@' + host + ':' + port,
  //   ssl: connectionOptions,
  // })

  // Comment when testing with live opensearch service
  const host = 'localhost'
  const protocol = 'https'
  const port = 9200
  const auth = 'admin:admin'
  const mock = new Mocker()
  const client = new Client({
    node: protocol + '://' + auth + '@' + host + ':' + port,
    Connection: mock.getConnection(),
  })

  const searchService: BackfillService = new BackfillService({
    client,
  })

  const indexName = 'search_entries'

  const searchEntriesDataset: SearchEntry[] = []

  for (let i = 1; i < 3; i++) {
    searchEntriesDataset.push({
      title: `title ${i * 10}`,
      description: `description ${i * 100}`,
      answer: `answer ${i * 1000}`,
      agencyId: i,
      postId: i,
      topicId: null,
    })
  }

  describe('indexAllData', () => {
    it('should successfully index database on OpenSearch when index not found', async () => {
      // Comment when testing with live opensearch service
      // When not mocked, endpoints return StatusCode.NOT_FOUND
      mock.add(
        {
          method: 'PUT',
          path: '/:indexName',
        },
        () => {
          return { status: 'ok' }
        },
      )
      const body = searchEntriesDataset.flatMap((doc) => [
        { index: { _index: indexName, _id: doc.postId } },
        doc,
      ])
      mock.add(
        {
          method: 'POST',
          path: '/_bulk',
          body: body,
        },
        () => {
          const items = []
          for (const _ of searchEntriesDataset) {
            items.push({
              index: {
                _index: indexName,
                status: StatusCodes.CREATED,
              },
            })
          }
          return {
            errors: false,
            items: items,
          }
        },
      )

      const response = await searchService.indexAllData(
        indexName,
        searchEntriesDataset,
      )
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.errors).toBeFalsy()
        for (const item of response.value.items) {
          expect(item.index._index).toBe(indexName)
          expect(item.index.status).toBe(StatusCodes.CREATED)
        }
      }
    })

    it('should successfully index database on OpenSearch when index exists', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'HEAD',
          path: '/:indexName',
        },
        () => {
          return { status: 'ok' }
        },
      )
      mock.add(
        {
          method: 'PUT',
          path: '/:indexName',
        },
        () => {
          return { status: 'ok' }
        },
      )
      const body = searchEntriesDataset.flatMap((doc) => [
        { index: { _index: indexName, _id: doc.postId } },
        doc,
      ])
      mock.add(
        {
          method: 'POST',
          path: '/_bulk',
          body: body,
        },
        () => {
          const items = []
          for (const _ of searchEntriesDataset) {
            items.push({
              index: {
                _index: indexName,
                status: StatusCodes.CREATED,
              },
            })
          }
          return {
            errors: false,
            items: items,
          }
        },
      )

      const response = await searchService.indexAllData(
        indexName,
        searchEntriesDataset,
      )
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.errors).toBeFalsy()
        for (const item of response.value.items) {
          expect(item.index._index).toBe(indexName)
          expect(item.index.status).toBe(StatusCodes.CREATED)
        }
      }
    })

    it('throws INTERNAL SERVER error if client.indices.exists does not succeed', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'HEAD',
          path: '/:indexName',
        },
        () => {
          return new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          })
        },
      )

      const response = await searchService.indexAllData(
        indexName,
        searchEntriesDataset,
      )
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        // BAD REQUEST error could be thrown based on: https://github.com/elastic/elasticsearch-js/issues/1069
        expect(response.error.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    it('throws INTERNAL SERVER error if client.indicies.create does not succeed', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'PUT',
          path: '/:indexName',
        },
        () => {
          return new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          })
        },
      )

      // // Uncomment to test with live opensearch service
      // client.indices.create({
      //   index: indexName,
      // })

      const response = await searchService.indexAllData(
        indexName,
        searchEntriesDataset,
      )
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    it('throws INTERNAL SERVER error if client.bulk does not succeed', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'PUT',
          path: '/:indexName',
        },
        () => {
          return { status: 'ok' }
        },
      )
      mock.add(
        {
          method: 'POST',
          path: '/_bulk',
        },
        () => {
          return new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          })
        },
      )

      const response = await searchService.indexAllData(indexName, [])
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    it('throws INTERNAL SERVER error if some operations for client.bulk fail', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'PUT',
          path: '/:indexName',
        },
        () => {
          return { status: 'ok' }
        },
      )
      mock.add(
        {
          method: 'POST',
          path: '/_bulk',
        },
        () => {
          const items = []
          for (const _ of searchEntriesDataset) {
            items.push({
              index: {
                error: {
                  type: 'error type',
                  reason: 'error reason',
                },
                _index: indexName,
                status: StatusCodes.BAD_REQUEST,
              },
            })
          }
          return {
            errors: true,
            items: items,
          }
        },
      )

      const response = await searchService.indexAllData(
        indexName,
        searchEntriesDataset,
      )
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    // // Uncomment if testing with live opensearch service
    // afterEach(async () => {
    //   await client.indices.delete({
    //     index: indexName,
    //   })
    // })

    // Comment when testing with live opensearch service
    afterEach(async () => {
      mock.clearAll()
    })
  })
})
