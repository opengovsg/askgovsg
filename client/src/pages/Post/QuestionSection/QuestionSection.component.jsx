import React from 'react'
import PostCell from './PostCell/PostCell.component'

import './QuestionSection.styles.scss'

const QuestionSection = ({ postId }) => {
  return (
    <>
      <div className="question">
        <div className="post-layout">
          <PostCell postId={postId} />
        </div>
      </div>
    </>
  )
}

export default QuestionSection
