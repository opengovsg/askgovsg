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
  Box,
  Button,
  CloseButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import sanitizeHtml from 'sanitize-html'

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
          <Box paddingBottom="8px">
            <CloseButton
              position="absolute"
              right="4px"
              top="4px"
              onClick={onClose}
              _focus={{ border: 'none' }}
            />
          </Box>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogBody>
            <VStack spacing={4}>
              <Text>{plainMessage}</Text>
              <Alert status="error">
                <AlertIcon />
                <AlertDescription
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(failureMessage, {
                      allowedTags: ['b'],
                      allowedAttributes: {},
                    }),
                  }}
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
