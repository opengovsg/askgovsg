import { Center } from '@chakra-ui/layout'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { listPosts, LIST_POSTS_QUERY_KEY } from '../../services/PostService'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'
import './QuestionsList.styles.scss'
import Pagination from '../Pagination'

interface QuestionsListProps {
  sort: string
  tags: string
  pageSize: number
}

const QuestionsList = ({
  sort,
  tags,
  pageSize,
}: QuestionsListProps): JSX.Element => {
  // Pagination
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery(
    [LIST_POSTS_QUERY_KEY, { sort, tags, page, pageSize }],
    () => listPosts(sort, tags, page, pageSize),
    { keepPreviousData: true },
  )

  const handlePageChange = (nextPage: number) => {
    // -> request new data using the page number
    setPage(nextPage)
    window.scrollTo(0, 0)
  }

  return isLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <>
      <PostListComponent
        posts={data?.posts}
        defaultText={undefined}
        alertIfMoreThanDays={undefined}
        showViews={undefined}
      />
      <Center my={5}>
        <Pagination
          totalCount={data?.totalItems ?? 0}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          currentPage={page}
        ></Pagination>
      </Center>
    </>
  )
}

export default QuestionsList
