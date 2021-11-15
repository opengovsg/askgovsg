import { StatusCodes } from 'http-status-codes'
import { SearchEntry, SearchService } from '../search.service'
import { Mocker } from './opensearch-mock'

// // Uncomment to test with live opensearch service
// import { baseConfig, Environment } from '../../../bootstrap/config/base'
// import { searchConfig } from '../../../bootstrap/config/search'
// import { Client, errors, Connection } from '@opensearch-project/opensearch'
// import fs from 'fs'

// Comment when testing with live opensearch service
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, errors } = require('@opensearch-project/opensearch')

describe('Search Service', () => {
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

  const searchService: SearchService = new SearchService({
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
    it('should successfully index database on OpenSearch', async () => {
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
      const body = searchEntriesDataset.flatMap((doc) => [
        { index: { _index: indexName } },
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

    it('should throw BAD REQUEST error if client.indicies.create does not succeed', async () => {
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
      // await searchService.indexAllData(indexName, searchEntriesDataset)
      const response = await searchService.indexAllData(
        indexName,
        searchEntriesDataset,
      )
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        // TODO: Refactor to use object directly - currently unable to do so due to
        // incorrect typing of return type.
        const responseErrorJson = JSON.parse(JSON.stringify(response.error))
        expect(responseErrorJson.meta.statusCode).toEqual(
          StatusCodes.BAD_REQUEST,
        )
        expect(responseErrorJson.meta.body.status).toEqual(
          StatusCodes.BAD_REQUEST,
        )
        expect(responseErrorJson.name).toEqual('ResponseError')
      }
    })

    it('should throw BAD REQUEST error if client.bulk does not succeed', async () => {
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
        // TODO: Proper typing to remove JSON parse and stringify
        const responseErrorJson = JSON.parse(JSON.stringify(response.error))
        expect(responseErrorJson.meta.statusCode).toEqual(
          StatusCodes.BAD_REQUEST,
        )
        expect(responseErrorJson.meta.body.status).toEqual(
          StatusCodes.BAD_REQUEST,
        )
        expect(responseErrorJson.name).toEqual('ResponseError')
      }
    })

    it('should return error documents if some operations for client.bulk fail', async () => {
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
        if (Array.isArray(response.error)) {
          for (const err of response.error) {
            // TODO: Proper typing to remove JSON parse and stringify
            const responseErrorJson = JSON.parse(JSON.stringify(err))
            expect(responseErrorJson.status).toBe(StatusCodes.BAD_REQUEST)
          }
        }
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
