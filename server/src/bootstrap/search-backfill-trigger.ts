import { AnswersService } from '../modules/answers/answers.service'
import { BackfillController } from '../modules/search/backfill/backfill.controller'
import { BackfillService } from '../modules/search/backfill/backfill.service'
import { PostService } from '../modules/post/post.service'
import { searchClient } from './search'
import { Agency, Answer, Post, PostTag, Tag, Topic, User } from './sequelize'

const triggerIndexAllData = async (searchController: BackfillController) => {
  const response = await searchController.indexAllData('search_entries')
  console.log(response)
  return response
}

// To run in server/src/bootstrap: npx ts-node search-backfill-trigger.ts
// To check that search_entries index have been created locally: curl -HEAD 'https://localhost:9200/search_entries' --insecure -u 'admin:admin'
// To delete search_entries index locally: curl -XDELETE 'https://localhost:9200/search_entries' --insecure -u 'admin:admin'

if (require.main === module) {
  const answersService = new AnswersService({ Post, Answer })
  const postService = new PostService({
    Answer,
    Post,
    PostTag,
    Tag,
    User,
    Topic,
    Agency,
  })
  const searchService = new BackfillService({ client: searchClient })
  const searchController = new BackfillController({
    answersService,
    postService,
    searchService,
  })

  triggerIndexAllData(searchController)
}
