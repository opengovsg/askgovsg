import React from 'react'
import { Text, Button, Flex } from '@chakra-ui/react'

interface CitizenRequestProps {
  email?: string
  longName?: string
}

const CitizenRequest = ({
  email = 'askgov@open.gov.sg',
  longName = '',
}: CitizenRequestProps): JSX.Element => {
  const cc = email === 'askgov@open.gov.sg' ? '' : 'askgov@open.gov.sg'
  return (
    <Flex
      direction="column"
      h="219px"
      px="24px"
      mt={[null, null, '151px']}
      align="center"
      justify="center"
      backgroundColor="primary.100"
    >
      <Text textStyle="h2" align="center" mb="24px">
        Can’t find what you’re looking for?
      </Text>
      <Button
        backgroundColor="primary.500"
        _hover={{
          background: 'primary.600',
        }}
        borderRadius="4px"
        // colorScheme="blue"
        color="white"
        onClick={(e) => {
          e.preventDefault()
          window.location.href =
            'mailto:' +
            email +
            '?cc=' +
            cc +
            '&subject=' +
            longName +
            ' AskGov&body=Let%20us%20know%20how%20we%20can%20help%20below!'
        }}
      >
        Submit an enquiry
      </Button>
    </Flex>
  )
}

export default CitizenRequest
