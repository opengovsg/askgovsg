import PostCell from './PostCell/PostCell.component'

import './QuestionSection.styles.scss'

const QuestionSection = ({ post }) => {
  return (
    <>
      <div className="question">
        <div className="post-layout">
          <PostCell post={post} />
        </div>
      </div>
    </>
  )
}

export default QuestionSection
