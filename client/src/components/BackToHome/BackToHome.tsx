import { Center, Flex, Link, Text } from '@chakra-ui/react'
import { BiArrowBack } from 'react-icons/bi'
import { Link as RouterLink } from 'react-router-dom'

export const BackToHome = ({
  mainPageName,
}: {
  mainPageName: string | null
}) => {
  return (
    <Link as={RouterLink} to={mainPageName ? `/agency/${mainPageName}` : '/'}>
      <Flex direction="row">
        <Center color="secondary.600">
          <BiArrowBack style={{ marginRight: '14px' }} size="13.41px" />
          <Text>Back to {mainPageName?.toUpperCase() ?? ''} questions</Text>
        </Center>
      </Flex>
    </Link>
  )
}
