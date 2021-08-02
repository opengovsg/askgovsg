import React from 'react'
import LinkButton from '../LinkButton/LinkButton.component'

const PostQuestionButton = () => {
  return (
    <LinkButton
      text={'Post Question'}
      link={'/add/question'}
      type={'s-btn__primary'}
      boxIconName={'plus'}
    />
  )
}

export default PostQuestionButton
