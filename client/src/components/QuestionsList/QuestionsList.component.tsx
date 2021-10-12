import { Center, Flex } from '@chakra-ui/layout'
import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  listAnswerablePosts,
  listPosts,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
  LIST_POSTS_QUERY_KEY,
} from '../../services/PostService'
import { mergeTags } from '../../util/tagsmerger'
import Pagination from '../Pagination'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'

interface QuestionsListProps {
  sort: string
  agency: string
  tags: string
  pageSize: number
  footerControl?: JSX.Element
  listAnswerable?: boolean
}

const QuestionsList = ({
  sort,
  agency,
  tags,
  pageSize,
  footerControl,
  listAnswerable,
}: QuestionsListProps): JSX.Element => {
  // Pagination
  const [page, setPage] = useState(1)
  const agencyAndTags = mergeTags(agency, tags)

  const { queryKey, queryFn } = listAnswerable
    ? {
        queryKey: [
          LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
          { sort, tags: agencyAndTags, page, pageSize },
        ],
        queryFn: () =>
          listAnswerablePosts({
            withAnswers: true,
            sort,
            tags: agencyAndTags,
            page,
            size: pageSize,
          }),
      }
    : {
        queryKey: [
          LIST_POSTS_QUERY_KEY,
          { sort, agencyAndTags, page, pageSize },
        ],
        queryFn: () => listPosts(sort, agencyAndTags, page, pageSize),
      }

  const { data, isLoading } = useQuery(queryKey, queryFn, {
    keepPreviousData: true,
  })

  const handlePageChange = (nextPage: number) => {
    // -> request new data using the page number
    setPage(nextPage)
    window.scrollTo(0, 0)
  }

  return isLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <>
      <PostListComponent
        posts={data?.posts.slice(0, pageSize)}
        defaultText={undefined}
        alertIfMoreThanDays={undefined}
      />
      <Center my={5}>
        {footerControl ?? (
          <Flex mt={{ base: '40px', sm: '48px', xl: '58px' }}>
            <Pagination
              totalCount={data?.totalItems ?? 0}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              currentPage={page}
            ></Pagination>
          </Flex>
        )}
      </Center>
    </>
  )
}

export default QuestionsList
