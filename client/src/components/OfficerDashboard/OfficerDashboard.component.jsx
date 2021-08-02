import React from 'react'
import AnswerableQuestionsComponent from '../AnswerableQuestions/AnswerableQuestions.component'

import './OfficerDashboard.styles.scss'

const OfficerDashboard = ({ sort, tags }) => {
  return (
    <div className="officer-dashboard">
      <AnswerableQuestionsComponent sort={sort} tags={tags} />
    </div>
  )
}

export default OfficerDashboard
