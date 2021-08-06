import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@chakra-ui/react'

import './LinkButton.styles.scss'

const LinkButton = ({ text, link, handleClick, leftIcon }) => {
  return (
    <Link onClick={handleClick} to={link}>
      <Button
        w={{ base: '100%', sm: 'auto' }}
        color="white"
        bgColor="primary.500"
        borderRadius="3px"
        textStyle="subhead-1"
        _hover={undefined}
        _active={undefined}
        _focus={undefined}
        leftIcon={leftIcon}
      >
        {text}
      </Button>
    </Link>
  )
}

export default LinkButton
