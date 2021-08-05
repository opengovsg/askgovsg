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
} from '@chakra-ui/react'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Agency } from '../../services/AgencyService'
import { BiErrorCircle } from 'react-icons/bi'
import { Enquiry } from '../CitizenRequest/CitizenRequest.component'

interface EnquiryModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  onConfirm: (enquiry: Enquiry) => Promise<void>
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

  const onSubmit: SubmitHandler<Enquiry> = async (enquiry) => {
    setIsLoading(true)
    await onConfirm(enquiry)
    setIsLoading(false)
    reset()
    onClose()
  }

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
                ${agency.longname}. Please note that we would take at 
                least 3 working days to process your enquiry. Thank you.`}
              </Text>
              <Box h={4} />
              <Text textStyle="subhead-1" color="secondary.700">
                Question Title
              </Text>
              <Box h={3} />
              <Input
                focusBorderColor="primary.500"
                errorBorderColor="error.500"
                isInvalid={formErrors.questionTitle}
                {...register('questionTitle', {
                  required: true,
                })}
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
              {/* <Box h={4} />
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
                errorLabel('Please enter a valid email')} */}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={4}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                color="white"
                backgroundColor="primary.500"
                _hover={{
                  background: 'primary.600',
                }}
                isLoading={isLoading}
              >
                Submit Enquiry
              </Button>
            </HStack>
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
