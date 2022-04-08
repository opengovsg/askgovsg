import { BiPlus } from 'react-icons/bi'

import LinkButton from '../LinkButton/LinkButton.component'

const PostQuestionButton = (): JSX.Element => {
  return (
    <LinkButton
      text={'Post Question'}
      link={'/add/question'}
      leftIcon={
        <BiPlus
          size="24"
          color="var(--chakra-colors-secondary-700)"
          style={{ marginRight: '10px' }}
        />
      }
    />
  )
}

export default PostQuestionButton
