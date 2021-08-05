import { Text, Button, Flex, useDisclosure } from '@chakra-ui/react'
import { EnquiryModal } from '../EnquiryModal/EnquiryModal.component'
import { Agency } from '../../services/AgencyService'

// TODO: combine interface Enquiry from both client and server
export interface Enquiry {
  questionTitle: string
  description: string
  senderEmail: string
}

const CitizenRequest = ({ agency }: { agency: Agency }): JSX.Element => {
  const cc = agency.email === 'feedback@ask.gov.sg' ? '' : 'feedback@ask.gov.sg'
  const {
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
    isOpen: isDeleteModalOpen,
  } = useDisclosure()
  const onPostConfirm = async (enquiry: Enquiry): Promise<void> => {
    window.location.href =
      'mailto:' +
      agency.email +
      '?cc=' +
      cc +
      '&subject=AskGov enquiry:%20' +
      enquiry.questionTitle +
      ' AskGov&body=' +
      enquiry.description
  }

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
        color="white"
        onClick={onDeleteModalOpen}
      >
        Submit an enquiry
      </Button>
      <EnquiryModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={onPostConfirm}
        agency={agency}
      />
    </Flex>
  )
}

export default CitizenRequest
