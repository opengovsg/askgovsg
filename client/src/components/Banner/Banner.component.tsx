import { Box } from '@chakra-ui/layout'

type bannerDataType =
  | {
      bannerMessage: string
      googleAnalyticsId: string
      fullStoryOrgId: string
    }
  | undefined

export const Banner = ({
  data,
  isSuccess,
}: {
  data: bannerDataType
  isSuccess: boolean
}): JSX.Element | null => {
  return isSuccess && data?.bannerMessage ? (
    <Box
      h="50px"
      minH="50px"
      color="neutral.100"
      zIndex="2000"
      background="primary.500"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className="banner"
      fontWeight="medium"
    >
      {data.bannerMessage}
    </Box>
  ) : null
}
