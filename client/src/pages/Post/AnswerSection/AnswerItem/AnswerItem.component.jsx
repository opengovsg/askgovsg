import PropTypes from 'prop-types'
import React from 'react'
import { RichTextPreview } from '../../../../components/RichText/RichTextEditor.component'
import './AnswerItem.styles.scss'

const AnswerItem = ({ answer: { body } }) => {
  return (
    <div className="answer-item">
      <div className="answer-body">
        <p>ANSWER</p>
        <RichTextPreview value={body} />
      </div>
    </div>
  )
}

AnswerItem.propTypes = {
  answer: PropTypes.object.isRequired,
}

export default AnswerItem
