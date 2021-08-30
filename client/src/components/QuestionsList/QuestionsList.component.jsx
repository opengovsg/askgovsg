import { Text, Center } from '@chakra-ui/layout'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { listPosts, LIST_POSTS_QUERY_KEY } from '../../services/PostService'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'
import './QuestionsList.styles.scss'
import Pagination from '../Pagination'

const QuestionsList = ({ sort, tags, pageSize }) => {
  // Pagination
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery(
    [LIST_POSTS_QUERY_KEY, { sort, tags, page, pageSize }],
    () => listPosts(sort, tags, page, pageSize),
    { keepPreviousData: true },
  )

  const handlePageChange = (nextPage) => {
    // -> request new data using the page number
    setPage(nextPage)
    window.scrollTo(0, 0)
  }

  return isLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <>
      <PostListComponent posts={data.posts} />
      <Center my={5}>
        <Pagination
          totalCount={data.totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          currentPage={page}
        ></Pagination>
      </Center>
    </>
  )
}

export default QuestionsList
