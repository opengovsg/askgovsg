import React, { Fragment } from 'react'
import { Link as ReachLink } from 'react-router-dom'
import {
  Spacer,
  Heading,
  Text,
  Button,
  Center,
  Flex,
  Container,
} from '@chakra-ui/react'

import './NotFound.styles.scss'
import { BackToHome } from '../../components/BackToHome/BackToHome'

const NotFound = () => {
  return (
    <Fragment centerContent>
      <BackToHome />
      <Container>
        <Container>
          <Flex direction="column">
            <Heading align="center" size="4xl">
              Not Found
            </Heading>
            <Spacer minH={10} />
            <Text align="center">
              It seems like we couldn't find the page you were looking for.
            </Text>
            <Spacer minH={10} />
            <Center>
              <Button as={ReachLink} to="/">
                Back to home page
              </Button>
            </Center>
          </Flex>
        </Container>
      </Container>
      <Spacer minH={20} />
    </Fragment>
  )
}

export default NotFound
