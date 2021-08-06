import { BiPlus } from 'react-icons/bi'
import LinkButton from '../LinkButton/LinkButton.component'

const PostQuestionButton = () => {
  return (
    <LinkButton
      text={'Post Question'}
      link={'/add/question'}
      type={'s-btn__primary'}
      leftIcon={
        <BiPlus size="24" color="white" style={{ marginRight: '10px' }} />
      }
    />
  )
}

export default PostQuestionButton
