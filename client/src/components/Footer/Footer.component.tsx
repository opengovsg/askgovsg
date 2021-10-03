import { FaLinkedinIn, FaFacebookF } from 'react-icons/fa'
import OGPLogo from '../../assets/ogp-logo.svg'
import { OGP } from '../Icons'
import { useAuth } from '../../contexts/AuthContext'
import { Link as RouterLink } from 'react-router-dom'
import {
  Divider,
  HStack,
  Image,
  Link,
  Text,
  Stack,
  VStack,
  Container,
} from '@chakra-ui/react'

import { format } from 'date-fns-tz'
// Credits: CheckFirst

const Footer = (): JSX.Element => {
  const { user } = useAuth()
  return (
    <Container maxW="1504px" m="auto" w="100vw" px={{ base: 8, md: 12 }}>
      <Stack
        pt={{ base: '56px', md: '48px' }}
        pb="40px"
        direction={{ base: 'column', md: 'row' }}
        justifyContent={{ md: 'space-between' }}
        alignItems={{ md: 'flex-end' }}
        color="secondary.500"
        spacing="24px"
        textStyle="body-2"
      >
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: '4px', md: '16px' }}
        >
          <Text textStyle="h4">AskGov</Text>
          <Text color="secondary.400">
            Answers from the Singapore Government
          </Text>
        </Stack>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: '16px', md: '22px' }}
        >
          <RouterLink to={user ? '/agency-privacy' : '/privacy'}>
            <Text
              _hover={{
                color: 'primary.500',
              }}
            >
              Privacy
            </Text>
          </RouterLink>
          <RouterLink to={user ? '/agency-terms' : '/terms'}>
            <Text
              _hover={{
                color: 'primary.500',
              }}
            >
              Terms of Use
            </Text>
          </RouterLink>
          <Link href="https://www.tech.gov.sg/report_vulnerability" isExternal>
            <Text
              _hover={{
                color: 'primary.500',
              }}
            >
              Report Vulnerability
            </Text>
          </Link>
        </Stack>
      </Stack>
      <Divider />
      <Stack
        py="48px"
        direction={{ base: 'column', md: 'row' }}
        justifyContent={{ md: 'space-between' }}
        alignItems={{ md: 'flex-end' }}
        color="secondary.400"
        spacing={{ base: '32px', md: '0px' }}
      >
        <VStack
          justifyContent="flex-start"
          alignItems={{ base: 'flex-start', md: 'center' }}
        >
          <Text textStyle="caption-1" width="100%">
            Built by
          </Text>
          <Link href="https://open.gov.sg" isExternal>
            <Image
              htmlWidth="160px"
              htmlHeight="47px"
              src={OGPLogo}
              alt="Open Government Products Logo"
              loading="lazy"
            />
          </Link>
        </VStack>

        <VStack align="stretch">
          <HStack color="black" justifyContent={{ md: 'flex-end' }}>
            <Link
              href="https://www.linkedin.com/company/open-government-products/"
              isExternal
              _hover={{
                color: 'primary.500',
              }}
            >
              <FaLinkedinIn size="28" style={{ marginRight: '5px' }} />
            </Link>
            <Link
              href="https://www.facebook.com/opengovsg"
              isExternal
              _hover={{
                color: 'primary.500',
              }}
            >
              <FaFacebookF size="24" style={{ marginRight: '5px' }} />
            </Link>
            <Link
              href="https://open.gov.sg"
              isExternal
              _hover={{
                color: 'primary.500',
              }}
            >
              <OGP />
            </Link>
          </HStack>
          <Link href="https://open.gov.sg" isExternal>
            <Text
              textStyle="caption-2"
              _hover={{
                color: 'primary.500',
              }}
            >
              © {format(Date.now(), 'yyyy')} Open Government Products,
              Government Technology Agency of Singapore
            </Text>
          </Link>
        </VStack>
      </Stack>
    </Container>
  )
}

export default Footer
