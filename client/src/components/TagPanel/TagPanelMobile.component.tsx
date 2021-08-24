import {
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
} from '@chakra-ui/react'
import { ReactElement } from 'react'
import { BiMenu } from 'react-icons/bi'
import { useQuery } from 'react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Agency,
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import {
  fetchTags,
  FETCH_TAGS_QUERY_KEY,
  getTagsUsedByAgency,
  GET_TAGS_USED_BY_AGENCY_QUERY_KEY,
} from '../../services/tag.service'
import { TagType } from '../../types/tag-type'
import { getRedirectURL } from '../../util/urlparser'

const TagPanelMobile = (): ReactElement => {
  const { agency: agencyShortName } = useParams<{ agency: string }>()
  const { data: agency } = useQuery<Agency>(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    // Only getAgencyByShortName if agency param is present in URL
    // If agency URL param is not present, agencyShortName is undefined
    { enabled: agencyShortName !== undefined },
  )

  const { isLoading, data: tags } = agency
    ? useQuery(GET_TAGS_USED_BY_AGENCY_QUERY_KEY, () =>
        getTagsUsedByAgency(agency.id),
      )
    : useQuery(FETCH_TAGS_QUERY_KEY, () => fetchTags())

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<BiMenu size="24" />}
        color="white"
        variant="outline"
      />
      <Portal>
        <MenuList>
          {isLoading && <Spinner />}
          {tags &&
            tags
              .filter(({ tagType }) => tagType === TagType.Topic)
              .sort((a, b) => (a.tagname > b.tagname ? 1 : -1))
              .map((tag) => {
                const { tagType, tagname } = tag
                return (
                  <MenuItem>
                    <Link
                      pl="28px"
                      py="3px"
                      w="100%"
                      textStyle="body2"
                      borderLeftWidth="1px"
                      _hover={{ bg: 'primary.100' }}
                      _focus={{
                        color: 'primary.500',
                        borderLeftColor: 'primary.500',
                      }}
                      as={RouterLink}
                      key={tag.id}
                      to={getRedirectURL(tagType, tagname, agency)}
                    >
                      {tag.tagname}
                    </Link>
                  </MenuItem>
                )
              })}
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default TagPanelMobile
