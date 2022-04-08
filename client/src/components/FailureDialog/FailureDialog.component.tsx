import React, { FC, useRef } from 'react'
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  AlertIcon,
  Button,
  chakra,
  Text,
  VStack,
} from '@chakra-ui/react'

interface FailureDialogProps
  extends Pick<AlertDialogProps, 'isOpen' | 'onClose'> {
  title: string
  plainMessage: string
  failureMessage: string
}

export const FailureDialog: FC<FailureDialogProps> = ({
  title,
  plainMessage,
  failureMessage,
  isOpen,
  onClose,
}) => {
  const cancelRef = useRef<HTMLDivElement | null>(null)
  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogBody>
            <VStack spacing={4}>
              <Text>{plainMessage}</Text>
              <Alert status="error">
                <AlertIcon />
                <AlertDescription
                  dangerouslySetInnerHTML={{ __html: failureMessage }}
                />
              </Alert>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
