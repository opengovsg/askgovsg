import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import { StatusCodes } from 'http-status-codes'
import { Mocker } from '../../opensearch-mock'
import { SearchEntry } from '../../search.types'
import { SyncService } from '../sync.service'

// // Uncomment to test with live opensearch service
// import { baseConfig, Environment } from '../../../bootstrap/config/base'
// import { searchConfig } from '../../../bootstrap/config/search'
// import { Client } from '@opensearch-project/opensearch'
// import fs from 'fs'

// Comment when testing with live opensearch service
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client, errors } = require('@opensearch-project/opensearch')

describe('Sync Service', () => {
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

  const searchService: SyncService = new SyncService({
    client,
  })

  const indexName = 'search_entries'

  const searchEntriesDataset: SearchEntry[] = []

  for (let i = 1; i < 3; i++) {
    searchEntriesDataset.push({
      title: `title ${i * 10}`,
      description: `description ${i * 100}`,
      answers: [`answer ${i * 1000}`],
      agencyId: i,
      postId: i,
      topicId: null,
    })
  }

  const postId = 3
  const searchEntry: SearchEntry = {
    title: 'add title',
    description: 'add description',
    answers: ['added answer 0'],
    agencyId: 1,
    postId: postId,
    topicId: 1,
  }

  // If testing with live opensearch service:
  // Setup    -> index opensearch with mock data through backfill.service.spec.ts with live opensearch service
  // Check    -> curl -HEAD 'https://localhost:9200/search_entries' --insecure -u 'admin:admin'
  // Teardown -> curl -XDELETE 'https://localhost:9200/search_entries' --insecure -u 'admin:admin'

  describe('createPost', () => {
    // If testing with live opensearch service:
    // To 'reset' opensearch index: curl -XDELETE 'https://localhost:9200/search_entries/_doc/3' --insecure -u 'admin:admin'

    it('successfully create post in index if post has not been added', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'PUT',
          path: `/:indexName/_create/${postId}`,
        },
        () => {
          return {
            _index: indexName,
            _id: String(postId),
            result: 'created',
          }
        },
      )

      const response = await searchService.createPost(indexName, searchEntry)
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.body._index).toBe(indexName)
        expect(response.value.body._id).toBe(String(postId))
        expect(response.value.body.result).toBe('created')
      }
    })

    it('throws error when create operation fails', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'PUT',
          path: `/:indexName/_create/${postId}`,
        },
        () => {
          return new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          })
        },
      )

      const response = await searchService.createPost(indexName, searchEntry)
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    // Comment when testing with live opensearch service
    afterEach(async () => {
      mock.clearAll()
    })
  })

  describe('updatePost', () => {
    // If testing with live opensearch service:
    // To 'reset' opensearch index: curl -XDELETE 'https://localhost:9200/search_entries/_doc/3' --insecure -u 'admin:admin'

    it('successfully updates post to index if post has been added', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/:indexName/_update/${postId}`,
        },
        () => {
          return {
            _index: indexName,
            _id: String(postId),
            result: 'updated',
          }
        },
      )

      searchEntry.answers!.push('added answer 1')
      const response = await searchService.updatePost(indexName, searchEntry)
      expect(response.isOk()).toBeTruthy()
      if (response.isOk()) {
        expect(response.value.body._index).toBe(indexName)
        expect(response.value.body._id).toBe(String(postId))
        expect(response.value.body.result).toBe('updated')
      }
    })

    it('throws error when update operation fails', async () => {
      // Comment when testing with live opensearch service
      mock.add(
        {
          method: 'POST',
          path: `/:indexName/_update/${postId}`,
        },
        () => {
          return new errors.ResponseError({
            body: { errors: {}, status: StatusCodes.BAD_REQUEST },
            statusCode: StatusCodes.BAD_REQUEST,
          })
        },
      )

      const response = await searchService.updatePost(indexName, searchEntry)
      expect(response.isErr()).toBeTruthy()
      if (response.isErr()) {
        expect(response.error.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(response.error).toBeInstanceOf(ResponseError)
      }
    })

    // Comment when testing with live opensearch service
    afterEach(async () => {
      mock.clearAll()
    })
  })
})
