import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'
import { getApiErrorMessage } from '../../api'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import { Agency } from '../../services/AgencyService'
import { Enquiry, Mail, postMail } from '../../services/MailService'
import { EnquiryModal } from '../EnquiryModal/EnquiryModal.component'
import { RichTextPreview } from '../RichText/RichTextEditor.component'
import { useStyledToast } from '../StyledToast/StyledToast'

const CitizenRequest = ({ agency }: { agency?: Agency }): JSX.Element => {
  const toast = useStyledToast()
  const {
    onOpen: onEnquiryModalOpen,
    onClose: onEnquiryModalClose,
    isOpen: isEnquiryModalOpen,
  } = useDisclosure()
  const googleAnalytics = useGoogleAnalytics()
  const agencyName = agency?.shortname || 'AskGov'

  const sendOpenEnquiryEventToAnalytics = () => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.OPEN_ENQUIRY,
      agencyName,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.OPEN_ENQUIRY, {
      enquiry_str: agencyName,
    })
  }

  const onClick = async () => {
    onEnquiryModalOpen()
    sendOpenEnquiryEventToAnalytics()
  }

  const onPostConfirm = async (
    enquiry: Enquiry,
    captchaResponse: string,
  ): Promise<void> => {
    const mail: Mail = {
      agencyId: agency?.id ? [agency?.id] : [],
      enquiry: enquiry,
      captchaResponse: captchaResponse,
    }
    try {
      await postMail(mail)
      toast({
        status: 'success',
        description: 'Enquiry email sent',
      })
    } catch (error) {
      toast({
        status: 'error',
        description: getApiErrorMessage(error),
      })
    }
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
        onClick={onClick}
      >
        {agency?.noEnquiriesMessage ? 'More information' : 'Submit an enquiry'}
      </Button>
      <EnquiryModal
        isOpen={!Boolean(agency?.noEnquiriesMessage) && isEnquiryModalOpen}
        onClose={onEnquiryModalClose}
        onConfirm={onPostConfirm}
        agency={agency}
      />
      <Modal
        isOpen={Boolean(agency?.noEnquiriesMessage) && isEnquiryModalOpen}
        onClose={onEnquiryModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>More information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RichTextPreview
              value={
                agency?.noEnquiriesMessage ||
                `${agency?.longname} does not accept enquiries via AskGov`
              }
            />
          </ModalBody>

          <ModalFooter>
            <Button onClick={onEnquiryModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default CitizenRequest
