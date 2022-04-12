import { BiPlus } from 'react-icons/bi'
import { ButtonProps as ChakraButtonProps } from '@chakra-ui/react'

import LinkButton from '../LinkButton/LinkButton.component'

const PostQuestionButton = ({ ...props }: ChakraButtonProps): JSX.Element => {
  return (
    <LinkButton
      text="Post Question"
      link="/add/question"
      color="white"
      bgColor="secondary.700"
      variant="solid"
      leftIcon={<BiPlus size="24" />}
      {...props}
    />
  )
}

export default PostQuestionButton
