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
  HStack,
} from '@chakra-ui/react'

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
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogBody>{description}</AlertDialogBody>
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
