import { SkeletonText } from '@chakra-ui/react'
import { GetAnswersForPostDto } from '../../../api'
import { sortByCreatedAt } from '../../../util/date'
import AnswerItem from './AnswerItem/AnswerItem.component'
import './AnswerSection.styles.scss'

const AnswerSection = ({
  answers,
}: {
  answers?: GetAnswersForPostDto
}): JSX.Element => {
  return !answers ? (
    <SkeletonText />
  ) : (
    <div className="answer-section">
      {answers && answers.length > 0 ? (
        answers?.sort(sortByCreatedAt).map((answer) => (
          <div key={answer.id} className="answers">
            <AnswerItem answer={answer} />
          </div>
        ))
      ) : (
        <div className="answer-header">
          <h2>No official answers yet</h2>
        </div>
      )}
    </div>
  )
}

export default AnswerSection
