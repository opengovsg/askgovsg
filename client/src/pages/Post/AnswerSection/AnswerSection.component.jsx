import { useQuery } from 'react-query'
import Spinner from '../../../components/Spinner/Spinner.component'
import AnswerItem from './AnswerItem/AnswerItem.component'
import './AnswerSection.styles.scss'
import {
  getAnswersForPost,
  GET_ANSWERS_FOR_POST_QUERY_KEY,
} from '../../../services/AnswerService'
import { sortByCreatedAt } from '../../../util/date'

const AnswerSection = ({ post }) => {
  const { isLoading, data: answers } = useQuery(
    [GET_ANSWERS_FOR_POST_QUERY_KEY, post.id],
    () => getAnswersForPost(post.id),
  )

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
        ? answers?.sort(sortByCreatedAt).map((answer) => (
            <div key={answer.id} className="answers">
              <AnswerItem answer={answer} postId={post.id} />
            </div>
          ))
        : null}
    </div>
  )
}

export default AnswerSection
