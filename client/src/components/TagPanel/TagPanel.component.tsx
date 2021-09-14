import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Link,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { ReactElement } from 'react'
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
import { getRedirectURL } from '../../util/urlparser'
import { TagType } from '~shared/types/base'

const TagPanel = (): ReactElement => {
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

  // TODO - create an AccordionItem for agency tags
  return (
    <Accordion defaultIndex={[0]} allowMultiple>
      <AccordionItem border="none">
        <h2>
          <AccordionButton
            py={3}
            borderLeft="1px solid"
            borderColor="secondary.200"
            _expanded={
              !agency
                ? { borderLeftColor: 'primary.500', color: 'primary.500' }
                : undefined
            }
          >
            <Box flex="1" textAlign="left">
              <Text>
                <b>Topics</b>
              </Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel
          p={0}
          borderLeftColor="secondary.200"
          borderLeftWidth="1px"
        >
          {isLoading && <Spinner />}
          {tags && (
            <VStack align="left" spacing={0} marginLeft="-1px">
              {tags
                .filter(({ tagType }) => tagType === TagType.Topic)
                .sort((a, b) => (a.tagname > b.tagname ? 1 : -1))
                .map((tag) => {
                  const { tagType, tagname } = tag
                  return (
                    <Link
                      pl="28px"
                      py="9px"
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
                  )
                })}
            </VStack>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default TagPanel
