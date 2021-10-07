import { RichTextPreview } from '../../../../components/RichText/RichTextEditor.component'
import './AnswerItem.styles.scss'

const AnswerItem = ({
  answer: { body },
}: {
  answer: { body: string }
}): JSX.Element => {
  return (
    <div className="answer-item">
      <div className="answer-body">
        <p>ANSWER</p>
        <RichTextPreview value={body} />
      </div>
    </div>
  )
}

export default AnswerItem
