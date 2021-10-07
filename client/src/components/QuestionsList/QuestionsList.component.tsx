import { Center } from '@chakra-ui/layout'
import { Button, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { listPosts, LIST_POSTS_QUERY_KEY } from '../../services/PostService'
import { mergeTags } from '../../util/tagsmerger'
import Pagination from '../Pagination'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'

interface QuestionsListProps {
  sort: string
  agency: string
  tags: string
  pageSize: number
}

const QuestionsList = ({
  sort,
  agency,
  tags,
  pageSize,
}: QuestionsListProps): JSX.Element => {
  // Pagination
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(tags.length > 0)

  useEffect(() => {
    setExpanded(tags.length > 0)
  }, [tags])

  const agencyAndTags = mergeTags(agency, tags)

  const { data, isLoading } = useQuery(
    [LIST_POSTS_QUERY_KEY, { sort, agencyAndTags, page, pageSize }],
    () => listPosts(sort, tags, page, pageSize),
    { keepPreviousData: true },
  )

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
        posts={data?.posts.slice(0, expanded ? pageSize : 10)}
        defaultText={undefined}
        alertIfMoreThanDays={undefined}
        showViews={undefined}
      />
      <Center my={5}>
        {expanded ? (
          <Pagination
            totalCount={data?.totalItems ?? 0}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            currentPage={page}
          />
        ) : (
          <Button
            variant="outline"
            color="primary.500"
            borderColor="primary.500"
            onClick={() => setExpanded(true)}
          >
            <Text textStyle="subhead-1">View all questions</Text>
          </Button>
        )}
      </Center>
    </>
  )
}

export default QuestionsList
