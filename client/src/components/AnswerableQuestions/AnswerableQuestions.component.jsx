import { Center } from '@chakra-ui/layout'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import Spinner from '../../components/Spinner/Spinner.component'
import {
  listAnswerablePosts,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
} from '../../services/PostService'
import Pagination from '../Pagination'
import PostListComponent from '../PostList/PostList.component'
import './AnswerableQuestions.styles.scss'

const AnswerableQuestions = ({ sort, tags, pageSize }) => {
  // Pagination
  const [postsTotal, setPostsTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const {
    data: postsWithAnswers,
    isLoading: isWithAnswersLoading,
    isSuccess,
  } = useQuery(
    [LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY, { sort, tags }],
    () => listAnswerablePosts({ withAnswers: true, sort, tags }),
    { keepPreviousData: true },
  )
  useEffect(() => {
    if (isSuccess) {
      setPostsTotal(postsWithAnswers.length)
    }
  }, [isSuccess, postsWithAnswers])

  const handlePageChange = (nextPage) => {
    // -> request new data using the page number
    setCurrentPage(nextPage)
    window.scrollTo(0, 0)
  }

  return isWithAnswersLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <>
      <PostListComponent
        posts={postsWithAnswers.slice(
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

export default AnswerableQuestions
