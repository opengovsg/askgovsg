import { FC, useState } from 'react'

import LionHeadSymbol from '../../assets/lion-head-symbol.svg'
import {
  Text,
  Flex,
  Center,
  Image,
  Button,
  Box,
  Icon,
  Link,
} from '@chakra-ui/react'
import { BiChevronUp, BiChevronDown, BiLinkExternal } from 'react-icons/bi'

const Masthead: FC = () => {
  const [mastheadExpanded, setMastheadExpanded] = useState(false)
  const onClickToggle = () => {
    setMastheadExpanded(!mastheadExpanded)
  }
  const mastheadTopTextStyle = { base: 'Legal', sm: 'caption-2' }
  const mastheadTopMarginY = { base: '6px', xl: '4px' }
  const mastheadHeadingTextStyle = { base: 'caption-1', xl: 'subhead-1' }
  const mastheadHeadingMarginBottom = { base: '8px', sm: '12px' }
  const mastheadBodyTextStyle = { base: 'caption-2', xl: 'body-1' }
  const bigIconBoxSize = { base: '13.33px', sm: '20px' }
  const lockSmallIconSize = { base: '10px', xl: '13.33px' }
  const mastheadBodyRightMargin = {
    base: '0px',
    sm: '5em',
    xl: '9em',
  }
  const mastheadBodyPadY = {
    base: '24px',
    sm: '32px',
    xl: '44px',
  }
  const mastheadBodyMarginBottom = {
    base: '16px',
    sm: '0px',
  }
  return (
    <Box bg="neutral.200" px={{ base: '24px', sm: '29px', xl: '33px' }}>
      <Flex direction="row">
        <Center my={mastheadTopMarginY}>
          <Image
            src={LionHeadSymbol}
            alt="Lion Head Symbol"
            htmlHeight="15.2px"
            htmlWidth="12.8px"
            loading="lazy"
          />
          <Text textStyle={mastheadTopTextStyle} color="neutral.900" mx={1}>
            A Singapore Government Agency Website.
          </Text>
          <Button
            rightIcon={mastheadExpanded ? <BiChevronUp /> : <BiChevronDown />}
            variant="link"
            onClick={onClickToggle}
            iconSpacing="xs"
            size="xs"
            color="systemLinks"
          >
            <Text textStyle={mastheadTopTextStyle} as="u" color="systemLinks">
              How to identify
            </Text>
          </Button>
        </Center>
      </Flex>
      {mastheadExpanded ? (
        <Flex direction={{ base: 'column', sm: 'row' }} py={mastheadBodyPadY}>
          <Flex
            direction="row"
            mr={mastheadBodyRightMargin}
            mb={mastheadBodyMarginBottom}
          >
            {/* Boxicon's bank icon (not included in react-icons yet) */}
            <Icon boxSize={bigIconBoxSize} mt={1} mr={3}>
              <path d="M0 6V10.001H1V16H0V19H16L19 19.001V19H20V16H19V10.001H20V6L10 0L0 6ZM4 16V10.001H6V16H4ZM9 16V10.001H11V16H9ZM16 16H14V10.001H16V16ZM12 6C11.9999 6.26271 11.9481 6.52283 11.8475 6.76552C11.7469 7.00821 11.5995 7.2287 11.4137 7.41442C11.2279 7.60014 11.0073 7.74744 10.7646 7.84791C10.5219 7.94839 10.2617 8.00007 9.999 8C9.73629 7.99993 9.47617 7.94812 9.23348 7.84753C8.99079 7.74693 8.7703 7.59952 8.58458 7.41371C8.39886 7.2279 8.25156 7.00733 8.15109 6.7646C8.05061 6.52186 7.99893 6.26171 7.999 5.999C7.99913 5.46843 8.21003 4.95965 8.58529 4.58458C8.96055 4.20951 9.46943 3.99887 10 3.999C10.5306 3.99913 11.0393 4.21003 11.4144 4.58529C11.7895 4.96055 12.0001 5.46943 12 6Z"></path>
            </Icon>
            <Box>
              <Text
                textStyle={mastheadHeadingTextStyle}
                mb={mastheadHeadingMarginBottom}
              >
                Official website links end with .gov.sg
              </Text>
              <Text textStyle={mastheadBodyTextStyle}>
                Government agencies communicate via .gov.sg websites (e.g.
                go.gov.sg/open).&nbsp;
                <Link href="https://go.gov.sg/trusted-sites">
                  <Button
                    rightIcon={<BiLinkExternal color="systemLinks" />}
                    variant="link"
                    color="systemLinks"
                  >
                    <Text
                      textStyle={mastheadBodyTextStyle}
                      as="u"
                      color="systemLinks"
                    >
                      Trusted websites
                    </Text>
                  </Button>
                </Link>
              </Text>
            </Box>
          </Flex>
          <Flex direction="row" mr={mastheadBodyRightMargin}>
            {/* Boxicon's lock-alt solid icon (not included in react-icons yet) */}
            <Icon boxSize={bigIconBoxSize} mt={1} mr={3}>
              <path d="M16 10C16 8.897 15.103 8 14 8H13V5C13 2.243 10.757 0 8 0C5.243 0 3 2.243 3 5V8H2C0.897 8 0 8.897 0 10V18C0 19.103 0.897 20 2 20H14C15.103 20 16 19.103 16 18V10ZM5 5C5 3.346 6.346 2 8 2C9.654 2 11 3.346 11 5V8H5V5Z"></path>
            </Icon>
            <Box>
              <Text
                textStyle={mastheadHeadingTextStyle}
                mb={mastheadHeadingMarginBottom}
              >
                Secure websites use HTTPS
              </Text>
              <Text textStyle={mastheadBodyTextStyle}>
                Look for a lock (&nbsp;
                {/* Boxicon's lock-alt solid icon (not included in react-icons yet) */}
                <Icon boxSize={lockSmallIconSize}>
                  <path d="M16 10C16 8.897 15.103 8 14 8H13V5C13 2.243 10.757 0 8 0C5.243 0 3 2.243 3 5V8H2C0.897 8 0 8.897 0 10V18C0 19.103 0.897 20 2 20H14C15.103 20 16 19.103 16 18V10ZM5 5C5 3.346 6.346 2 8 2C9.654 2 11 3.346 11 5V8H5V5Z"></path>
                </Icon>
                ) or https:// as an added precaution. Share sensitive
                information only on official, secure websites.
              </Text>
            </Box>
          </Flex>
        </Flex>
      ) : null}
    </Box>
  )
}

export default Masthead
