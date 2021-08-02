import React from 'react'

import PostItem from '../../components/PostItem/PostItem.component'

import { Text } from '@chakra-ui/react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'

const PostList = ({ posts, defaultText, alertIfMoreThanDays, showViews }) => {
  const { agency: agencyShortName } = useParams()
  const { data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  defaultText = defaultText ?? 'There are no posts to display.'
  return (
    <div className="post-list">
      {posts && posts.length > 0 ? (
        <div className="questions">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              alertIfMoreThanDays={alertIfMoreThanDays}
              showViews={showViews}
              agency={agency}
            />
          ))}
        </div>
      ) : (
        <Text color="secondary.500" textStyle="h4" py={4}>
          {defaultText}
        </Text>
      )}
    </div>
  )
}

export default PostList
