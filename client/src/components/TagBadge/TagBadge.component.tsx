import { Link } from 'react-router-dom'
import { getRedirectURL } from '../../util/urlparser'
import './TagBadge.styles.scss'
import { useGoogleAnalytics } from '../../contexts/googleAnalytics'
import * as FullStory from '@fullstory/browser'
import { TagType } from '~shared/types/base'
import { Agency } from '../../services/AgencyService'

const TagBadge = ({
  tagName,
  tagType,
  agency,
}: {
  tagName: string
  tagType: TagType
  agency: Agency
}): JSX.Element => {
  const TagComponent = <div className="tag-badge">{tagName.toUpperCase()}</div>

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
      to={getRedirectURL(tagType, tagName, agency)}
      onClick={sendClickTagEventToAnalytics}
    >
      {TagComponent}
    </Link>
  )
}

export default TagBadge
