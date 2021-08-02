import React, { useState } from 'react'
import { useQuery } from 'react-query'
import Spinner from '../../../components/Spinner/Spinner.component'
import handleSorting from '../../../services/handleSorting'
import AnswerItem from './AnswerItem/AnswerItem.component'
import './AnswerSection.styles.scss'
import {
  getAnswersForPost,
  GET_ANSWERS_FOR_POST_QUERY_KEY,
} from '../../../services/AnswerService'

const AnswerSection = ({ post }) => {
  const { isLoading, data: answers } = useQuery(
    [GET_ANSWERS_FOR_POST_QUERY_KEY, post.id],
    () => getAnswersForPost(post.id),
  )
  const [sortType] = useState('Newest')

  return isLoading ? (
    <Spinner width="25px" height="25px" />
  ) : (
    <div className="answer-section">
      {answers.length > 0 ? null : (
        <div className="answer-header">
          <h2>No official answers yet</h2>
        </div>
      )}
      {answers?.length > 0
        ? answers?.sort(handleSorting(sortType)).map((answer) => (
            <div key={answer.id} className="answers">
              <AnswerItem answer={answer} postId={post.id} />
            </div>
          ))
        : null}
    </div>
  )
}

export default AnswerSection
