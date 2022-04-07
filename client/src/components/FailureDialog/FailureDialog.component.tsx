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
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { FC, useRef } from 'react'

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
                <AlertDescription>{failureMessage}</AlertDescription>
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
