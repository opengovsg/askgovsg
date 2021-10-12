import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from '@chakra-ui/react'
import { BiChevronRight } from 'react-icons/bi'
import { Link } from 'react-router-dom'

export const NavBreadcrumb = ({
  navOrder,
}: {
  navOrder: { text: string; link: string }[]
}) => {
  return (
    <Breadcrumb spacing="8px" separator={<BiChevronRight color="gray.500" />}>
      {navOrder.map((value, index) => {
        return (
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to={value.link} key={index}>
              <Text
                as="u"
                color="secondary.500"
                _hover={{ color: 'primary.600' }}
              >
                {value.text}
              </Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}
