import { Link } from 'react-router-dom'
import { Button } from '@chakra-ui/react'

const LinkButton = ({
  text,
  link,
  handleClick,
  leftIcon,
}: {
  text: string
  link: string
  handleClick?: () => void
  leftIcon?: JSX.Element
}): JSX.Element => {
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
      >
        {text}
      </Button>
    </Link>
  )
}

export default LinkButton
