import React from 'react'
import AnswerableQuestionsComponent from '../AnswerableQuestions/AnswerableQuestions.component'

import './OfficerDashboard.styles.scss'

const OfficerDashboard = ({ sort, tags, pageSize }) => {
  return (
    <div className="officer-dashboard">
      <AnswerableQuestionsComponent
        sort={sort}
        tags={tags}
        pageSize={pageSize}
      />
    </div>
  )
}

export default OfficerDashboard
