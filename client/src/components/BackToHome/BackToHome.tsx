import { BiArrowBack } from 'react-icons/bi'
import { Link as RouterLink } from 'react-router-dom'
import { Center, Link, Text } from '@chakra-ui/react'

export const BackToHome = ({
  mainPageName,
}: {
  mainPageName: string | null
}): JSX.Element => {
  return (
    <Link as={RouterLink} to={mainPageName ? `/agency/${mainPageName}` : '/'}>
      <Center color="secondary.800">
        <BiArrowBack style={{ marginRight: '14px' }} size="13.41px" />
        <Text textStyle="body-1">
          Back to {mainPageName?.toUpperCase() ?? ''} questions
        </Text>
      </Center>
    </Link>
  )
}
