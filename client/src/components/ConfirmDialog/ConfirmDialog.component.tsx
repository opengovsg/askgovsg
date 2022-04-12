import React, { FC, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogProps,
  Button,
  CloseButton,
  HStack,
} from '@chakra-ui/react'
import sanitizeHtml from 'sanitize-html'

interface ConfirmDialogProps
  extends Pick<AlertDialogProps, 'isOpen' | 'onClose'> {
  title: string
  description: string
  confirmText: string
  onConfirm: () => Promise<void> | void
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmText,
  isOpen,
  onConfirm,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const cancelRef = useRef<HTMLDivElement | null>(null)
  const handleConfirm = async () => {
    setIsLoading(true)
    await onConfirm()
    setIsLoading(false)
    onClose()
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <CloseButton
            position="absolute"
            right="4px"
            top="4px"
            onClick={onClose}
            _focus={{ border: 'none' }}
          />
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogBody
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(description, {
                allowedTags: ['b'],
                allowedAttributes: {},
              }),
            }}
          />
          <AlertDialogFooter>
            <HStack spacing={4}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="error"
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
