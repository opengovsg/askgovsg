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

const AnswerableQuestions = ({ sort, tags, pageSize: size }) => {
  // Pagination
  const [page, setPage] = useState(1)
  const { data, isLoading: isWithAnswersLoading } = useQuery(
    [LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY, { sort, tags, page, size }],
    () => listAnswerablePosts({ withAnswers: true, sort, tags, page, size }),
    { keepPreviousData: true },
  )

  const handlePageChange = (nextPage) => {
    // -> request new data using the page number
    setPage(nextPage)
    window.scrollTo(0, 0)
  }

  return isWithAnswersLoading ? (
    <Spinner centerHeight="200px" />
  ) : (
    <>
      <PostListComponent posts={data.posts} />
      <Center my={5}>
        <Pagination
          totalCount={data.totalItems}
          pageSize={size}
          onPageChange={handlePageChange}
          currentPage={page}
        ></Pagination>
      </Center>
    </>
  )
}

export default AnswerableQuestions
