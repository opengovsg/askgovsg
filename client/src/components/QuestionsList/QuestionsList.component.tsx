import { Center, Flex } from '@chakra-ui/layout'
import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  listAnswerablePosts,
  listPosts,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
  LIST_POSTS_QUERY_KEY,
} from '../../services/PostService'
import Pagination from '../Pagination'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'
import {
  QuestionsDisplayState,
  questionsDisplayStates,
} from '../Questions/questions'
import { Button, Text } from '@chakra-ui/react'
import { NavigateFunction } from 'react-router-dom'

interface QuestionsListProps {
  sort: string
  agencyId?: number
  tags?: string
  topics?: string
  questionsPerPage: number
  showViewAllQuestionsButton: boolean
  navigate: NavigateFunction
  setQuestionsDisplayState: (state: QuestionsDisplayState) => void
  listAnswerable?: boolean
}

const QuestionsList = ({
  sort,
  agencyId,
  tags,
  topics,
  questionsPerPage,
  showViewAllQuestionsButton,
  navigate,
  setQuestionsDisplayState,
  listAnswerable,
}: QuestionsListProps): JSX.Element => {
  // Pagination
  const [page, setPage] = useState(1)

  const { queryKey, queryFn } = listAnswerable
    ? {
        queryKey: [
          LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
          { sort, tags, topics, page, questionsPerPage },
        ],
        queryFn: () =>
          listAnswerablePosts({
            withAnswers: true,
            sort,
            tags,
            topics,
            page,
            size: questionsPerPage,
          }),
      }
    : {
        queryKey: [
          LIST_POSTS_QUERY_KEY,
          {
            sort,
            agencyId,
            tags,
            topics,
            page,
            questionsPerPage: questionsPerPage,
          },
        ],
        queryFn: () =>
          listPosts(sort, agencyId, tags, topics, page, questionsPerPage),
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
        posts={data?.posts.slice(0, questionsPerPage)}
        defaultText={undefined}
      />
      <Center my={5}>
        {showViewAllQuestionsButton ? (
          <Button
            mt={{ base: '40px', sm: '48px', xl: '58px' }}
            variant="outline"
            color="secondary.700"
            borderColor="secondary.700"
            onClick={() => {
              window.scrollTo(0, 0)
              navigate('?topics=')
              setQuestionsDisplayState(
                questionsDisplayStates.find(
                  (state) => state.value === 'all',
                ) as QuestionsDisplayState,
              )
            }}
          >
            <Text textStyle="subhead-1">View all questions</Text>
          </Button>
        ) : (
          <Flex mt={{ base: '40px', sm: '48px', xl: '58px' }}>
            <Pagination
              totalCount={data?.totalItems ?? 0}
              pageSize={questionsPerPage}
              onPageChange={handlePageChange}
              currentPage={page}
            />
          </Flex>
        )}
      </Center>
    </>
  )
}

export default QuestionsList
