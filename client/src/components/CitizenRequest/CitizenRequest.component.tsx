import { Button, Flex, Text, useDisclosure } from '@chakra-ui/react'
import { getApiErrorMessage } from '../../api'
import { Agency } from '../../services/AgencyService'
import { Enquiry, Mail, postMail } from '../../services/MailService'
import { EnquiryModal } from '../EnquiryModal/EnquiryModal.component'
import { useStyledToast } from '../StyledToast/StyledToast'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import * as FullStory from '@fullstory/browser'

const CitizenRequest = ({ agency }: { agency: Agency }): JSX.Element => {
  const toast = useStyledToast()
  const {
    onOpen: onEnquiryModalOpen,
    onClose: onEnquiryModalClose,
    isOpen: isEnquiryModalOpen,
  } = useDisclosure()
  const googleAnalytics = useGoogleAnalytics()

  const sendOpenEnquiryEventToAnalytics = () => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.OPEN_ENQUIRY,
      agency.email,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.OPEN_ENQUIRY, {
      // property name uses `ident_type` pattern
      enquiry_str: agency.email,
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
      agencyId: agency.id ? [agency.id] : [],
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
        Submit an enquiry
      </Button>
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={onEnquiryModalClose}
        onConfirm={onPostConfirm}
        agency={agency}
      />
    </Flex>
  )
}

export default CitizenRequest
