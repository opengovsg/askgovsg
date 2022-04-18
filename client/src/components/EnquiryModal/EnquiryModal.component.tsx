import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { SubmitHandler, useForm } from 'react-hook-form'
import { BiErrorCircle } from 'react-icons/bi'
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Spacer,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import * as FullStory from '@fullstory/browser'

import { Enquiry } from '~shared/types/api'

import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import { Agency } from '../../services/AgencyService'
import { SearchBox } from '../SearchBox/SearchBox.component'

interface EnquiryModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  onConfirm: (enquiry: Enquiry, captchaResponse: string) => Promise<void>
  agency?: Agency
}

export const EnquiryModal = ({
  isOpen,
  onClose,
  onConfirm,
  agency,
}: EnquiryModalProps): JSX.Element => {
  const { register, handleSubmit, reset, formState } = useForm<Enquiry>()
  const { errors: formErrors } = formState
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null)
  const googleAnalytics = useGoogleAnalytics()
  const agencyName = agency?.shortname || 'AskGov'

  const sendSubmitEnquiryEventToAnalytics = (agencyName: string) => {
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.SUBMIT_ENQUIRY,
      agencyName,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.SUBMIT_ENQUIRY, {
      enquiry_str: agencyName,
    })
  }

  const onSubmit: SubmitHandler<Enquiry> = async (enquiry) => {
    if (captchaResponse) {
      setIsLoading(true)
      await onConfirm(enquiry, captchaResponse)
      setIsLoading(false)
      sendSubmitEnquiryEventToAnalytics(agencyName)
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
            <Text textStyle="h2" color="secondary.800">
              {`${(agency?.shortname ?? '').toUpperCase()} Enquiry Form`}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="left" spacing={0}>
              <Text>
                {`This enquiry form will generate an email to be sent${
                  agency?.longname ? ` to ${agency?.longname}` : ''
                }. Please note that we would take within
                3 - 14 working days to process your enquiry. Thank you.`}
              </Text>
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.800">
                Question Title
              </Text>
              <Box h={3} />
              <SearchBox
                focusBorderColor="secondary.700"
                errorBorderColor="error.500"
                placeholder=""
                value=""
                showSearchIcon={false}
                searchOnEnter={false}
                isInvalid={Boolean(formErrors.questionTitle)}
                inputRef={ref}
                agencyId={agency?.id}
                {...questionTitleProps}
              />
              {formErrors.questionTitle && errorLabel('This field is required')}
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.800">
                Description
              </Text>
              <Box h={3} />
              <Textarea
                focusBorderColor="secondary.700"
                errorBorderColor="error.500"
                isInvalid={Boolean(formErrors.description)}
                h="144px"
                {...register('description', {
                  required: true,
                })}
              />
              {formErrors.description && errorLabel('This field is required')}
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.800">
                Sender email
              </Text>
              <Text textStyle="body-2" color="secondary.800">
                Please fill in a valid email so that we can get back to you
              </Text>
              <Box h={3} />
              <Input
                focusBorderColor="secondary.700"
                errorBorderColor="error.500"
                isInvalid={Boolean(formErrors.senderEmail)}
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
                backgroundColor="secondary.700"
                _hover={{
                  background: 'secondary.600',
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
