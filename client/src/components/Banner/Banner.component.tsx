import { Box } from '@chakra-ui/layout'
import { useEnvironment } from '../../hooks/useEnvironment'

export const Banner = (): JSX.Element | null => {
  const { data, isSuccess } = useEnvironment()
  return isSuccess && data?.bannerMessage ? (
    <Box
      h="50px"
      minH="50px"
      color="neutral.100"
      zIndex="2000"
      background="neutral.900"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className="banner"
    >
      {data.bannerMessage}
    </Box>
  ) : null
}
