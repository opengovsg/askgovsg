import { Button, Center, Flex, Heading, Spacer, Text } from '@chakra-ui/react'
import { Link as ReachLink } from 'react-router-dom'
import { BackToHome } from '../../components/BackToHome/BackToHome'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const InvalidUserLogin = (): JSX.Element => {
  const pagePX = { base: 8, md: 12 }
  const { user } = useAuth()

  if (user) {
    return <Navigate replace to={`/agency/${user.agency.shortname}`} />
  } else {
    return (
      <>
        <Flex
          mt={{ base: '32px', sm: '60px' }}
          mb={{ base: '32px', sm: '50px' }}
          px={pagePX}
        >
          <BackToHome mainPageName={null} />
        </Flex>
        <Flex direction="column" px={pagePX}>
          <Heading align="center" size="4xl">
            Failed to login.
          </Heading>
          <Spacer minH={10} />
          <Text align="center">
            It seems like we couldn't find your records. Please try again in a
            bit.
          </Text>
          <Spacer minH={10} />
          <Center>
            <Button as={ReachLink} to="/">
              Back to home page
            </Button>
          </Center>
        </Flex>
        <Spacer />
      </>
    )
  }
}

export default InvalidUserLogin
