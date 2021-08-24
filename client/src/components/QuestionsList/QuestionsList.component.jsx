import { Center } from '@chakra-ui/layout'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { listPosts, LIST_POSTS_QUERY_KEY } from '../../services/PostService'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'
import './QuestionsList.styles.scss'
import Pagination from '../Pagination'

const QuestionsList = ({ sort, tags, pageSize }) => {
  // Pagination
  const [postsTotal, setPostsTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const {
    data: posts,
    isLoading,
    isSuccess,
  } = useQuery([LIST_POSTS_QUERY_KEY, { sort, tags }], () =>
    listPosts(sort, tags),
  )
  useEffect(() => {
    if (isSuccess) {
      setPostsTotal(posts.length)
    }
  }, [isSuccess, posts])

  const handlePageChange = (nextPage) => {
    // -> request new data using the page number
    setCurrentPage(nextPage)
    window.scrollTo(0, 0)
  }

  return isLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <>
      <PostListComponent
        posts={posts.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        )}
      />
      <Center mt={5}>
        <Pagination
          totalCount={postsTotal}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        ></Pagination>
      </Center>
    </>
  )
}

export default QuestionsList
