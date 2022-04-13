import { Link } from 'react-router-dom'
import { Button, ButtonProps as ChakraButtonProps } from '@chakra-ui/react'

interface LinkButtonProps extends ChakraButtonProps {
  text: string
  link: string
  handleClick?: () => void
  leftIcon?: JSX.Element
}

const LinkButton = ({
  text,
  link,
  handleClick,
  leftIcon,
  ...props
}: LinkButtonProps): JSX.Element => {
  return (
    <Link onClick={handleClick} to={link}>
      <Button
        w={{ base: '100%', sm: 'auto' }}
        color="secondary.700"
        border="1px"
        borderColor="secondary.700"
        bg="white"
        borderRadius="3px"
        textStyle="subhead-1"
        leftIcon={leftIcon}
        {...props}
      >
        {text}
      </Button>
    </Link>
  )
}

export default LinkButton
