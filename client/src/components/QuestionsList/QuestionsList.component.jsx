import React from 'react'
import { useQuery } from 'react-query'
import { listPosts, LIST_POSTS_QUERY_KEY } from '../../services/PostService'
import PostListComponent from '../PostList/PostList.component'
import Spinner from '../Spinner/Spinner.component'
import './QuestionsList.styles.scss'

const QuestionsList = ({ sort, tags }) => {
  const { data: posts, isLoading } = useQuery(
    [LIST_POSTS_QUERY_KEY, { sort, tags }],
    () => listPosts(sort, tags),
  )

  return isLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <PostListComponent posts={posts} />
  )
}

export default QuestionsList
