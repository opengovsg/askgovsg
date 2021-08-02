import React from 'react'
import {
  Box,
  HStack,
  IconButton,
  Icon,
  RenderProps,
  Spacer,
  Text,
  useMultiStyleConfig,
  useToast,
  UseToastOptions,
} from '@chakra-ui/react'
import { BiCheckFilledCircle, BiErrorFilledCircle } from '../Icons'
import { BiX } from 'react-icons/bi'

export const useStyledToast = (): ((
  props: UseToastOptions,
) => string | number | undefined) => {
  const toast = useToast()

  const styles = useMultiStyleConfig('StyledToast', {})

  const toastImplementation = (props: UseToastOptions) => {
    // default toast allows status to be info or undefined, but since we do not
    // have those colours, it is mapped to success
    let status = props.status
    if (status === undefined || status === 'info') {
      status = 'success'
    }
    return toast({
      position: 'top',
      duration: 6000, // 6 seconds
      render: (renderProps: RenderProps) => (
        <Box
          sx={styles.toastBox}
          bg={`${status}.100`}
          borderColor={`${status}.500`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <HStack spacing={2} sx={styles.container}>
            {status === 'error' || status === 'warning' ? (
              <Icon
                as={BiErrorFilledCircle}
                sx={styles.icon}
                color={`${status}.500`}
              />
            ) : (
              <Icon
                as={BiCheckFilledCircle}
                sx={styles.icon}
                color={`${status}.500`}
              />
            )}
            <Text sx={styles.message}>{props.description}</Text>
            <Spacer />
            <IconButton
              icon={<BiX />}
              sx={styles.closeButton}
              aria-label="close"
              aria-hidden
              variant="link"
              onClick={renderProps.onClose}
            />
          </HStack>
        </Box>
      ),
    })
  }
  return toastImplementation
}
