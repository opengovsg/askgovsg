import { Link as RouterLink } from 'react-router-dom'
import { getRedirectURL } from '../../util/urlparser'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import * as FullStory from '@fullstory/browser'
import { TagType } from '~shared/types/base'
import { Agency } from '../../services/AgencyService'
import { Button, Link, Text } from '@chakra-ui/react'

const TagBadge = ({
  tagName,
  tagType,
  agency,
}: {
  tagName: string
  tagType: TagType
  agency: Agency
}): JSX.Element => {
  const googleAnalytics = useGoogleAnalytics()

  const sendClickTagEventToAnalytics = () => {
    const timeToTagClick = Date.now() - googleAnalytics.appLoadTime
    googleAnalytics.sendUserEvent(
      googleAnalytics.GA_USER_EVENTS.CLICK_TAG,
      tagName,
      timeToTagClick,
    )
    googleAnalytics.sendTiming(
      'User',
      'Time to first tag click',
      timeToTagClick,
    )
    FullStory.event(googleAnalytics.GA_USER_EVENTS.CLICK_TAG, {
      tag_str: tagName,
      timeToTagClick_int: timeToTagClick,
    })
  }

  return (
    <Link
      as={RouterLink}
      to={getRedirectURL(tagType, tagName, agency)}
      mr="8px"
    >
      <Button
        size="xs"
        py="4px"
        px="6px"
        onClick={sendClickTagEventToAnalytics}
        color="secondary.200"
      >
        <Text textStyle="caption-2" color="secondary.700">
          {tagName.toUpperCase()}
        </Text>
      </Button>
    </Link>
  )
}

export default TagBadge
