import React from 'react'
import { useQuery } from 'react-query'
import Spinner from '../../components/Spinner/Spinner.component'
import {
  listAnswerablePosts,
  LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY,
} from '../../services/PostService'
import PostListComponent from '../PostList/PostList.component'
import './AnswerableQuestions.styles.scss'

const AnswerableQuestions = ({ sort, tags }) => {
  const { data: postsWithAnswers, isLoading: isWithAnswersLoading } = useQuery(
    [LIST_ANSWERABLE_POSTS_WITH_ANSWERS_QUERY_KEY, { sort, tags }],
    () => listAnswerablePosts({ withAnswers: true, sort, tags }),
  )

  return isWithAnswersLoading ? (
    <Spinner type="page" width="75px" height="200px" />
  ) : (
    <PostListComponent posts={postsWithAnswers} />
  )
}

export default AnswerableQuestions
