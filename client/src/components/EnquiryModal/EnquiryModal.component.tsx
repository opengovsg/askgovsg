import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalProps,
  HStack,
  Input,
  Text,
  VStack,
  Textarea,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Agency } from '../../services/AgencyService'
import { BiErrorCircle } from 'react-icons/bi'
import { Enquiry } from '../../services/MailService'
import ReCAPTCHA from 'react-google-recaptcha'
import SearchBox from '../SearchBox/SearchBox.component'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import * as FullStory from '@fullstory/browser'
interface EnquiryModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  onConfirm: (enquiry: Enquiry, captchaResponse: string) => Promise<void>
  agency: Agency
}

export const EnquiryModal = ({
  isOpen,
  onClose,
  onConfirm,
  agency,
}: EnquiryModalProps): JSX.Element => {
  const { register, handleSubmit, reset, formState } = useForm()
  const { errors: formErrors } = formState
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null)
  const googleAnalytics = useGoogleAnalytics()
  const agencyEmail = agency.email

  const sendSubmitEnquiryEventToAnalytics = (agencyEmail: string) => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.SUBMIT_ENQUIRY,
      agencyEmail,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.SUBMIT_ENQUIRY, {
      enquiry_str: agencyEmail,
    })
  }

  const onSubmit: SubmitHandler<Enquiry> = async (enquiry) => {
    if (captchaResponse) {
      setIsLoading(true)
      await onConfirm(enquiry, captchaResponse)
      setIsLoading(false)
      sendSubmitEnquiryEventToAnalytics(agencyEmail)
      reset()
      onClose()
    }
  }

  const { ref, ...questionTitleProps } = register('questionTitle', {
    required: true,
  })
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalOverlay />
        <ModalContent w="660px">
          <ModalHeader>
            <Text textStyle="h2" color="secondary.700">
              {`${agency.shortname.toUpperCase()} Enquiry Form`}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="left" spacing={0}>
              <Text>
                {`This enquiry form will generate an email to be sent to 
                ${agency.longname}. Please note that we would take within
                3 - 14 working days to process your enquiry. Thank you.`}
              </Text>
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.700">
                Question Title
              </Text>
              <Box h={3} />
              <SearchBox
                focusBorderColor="primary.500"
                errorBorderColor="error.500"
                placeholder=""
                value=""
                showSearchIcon={false}
                searchOnEnter={false}
                isInvalid={formErrors.questionTitle}
                inputRef={ref}
                {...questionTitleProps}
              />
              {formErrors.questionTitle && errorLabel('This field is required')}
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.700">
                Description
              </Text>
              <Box h={3} />
              <Textarea
                focusBorderColor="primary.500"
                errorBorderColor="error.500"
                isInvalid={formErrors.description}
                h="144px"
                {...register('description', {
                  required: true,
                })}
              />
              {formErrors.description && errorLabel('This field is required')}
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.700">
                Sender email
              </Text>
              <Text textStyle="body-2" color="secondary.400">
                Please fill in a valid email so that we can get back to you
              </Text>
              <Box h={3} />
              <Input
                focusBorderColor="primary.500"
                errorBorderColor="error.500"
                isInvalid={formErrors.senderEmail}
                placeholder="example@email.com"
                {...register('senderEmail', {
                  required: true,
                  pattern: /^\S+@\S+$/i,
                })}
              />
              {formErrors.senderEmail &&
                errorLabel('Please enter a valid email')}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex
              w="100%"
              align={{ base: 'left', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
            >
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ''}
                onChange={(token) => setCaptchaResponse(token)}
              />
              <Spacer />
              <Button
                my={4}
                type="submit"
                color="white"
                w={{ base: '100%', md: 'auto' }}
                h={{ base: 14, md: 12 }}
                disabled={!captchaResponse}
                backgroundColor="primary.500"
                _hover={{
                  background: 'primary.600',
                }}
                isLoading={isLoading}
              >
                Submit Enquiry
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

const errorLabel = (message: string): JSX.Element => (
  <>
    <Box h={2} />
    <HStack color={'error.500'}>
      <BiErrorCircle />
      <Text textStyle="body-2">{message}</Text>
    </HStack>
  </>
)
