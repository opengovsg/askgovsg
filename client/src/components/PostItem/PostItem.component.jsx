import { Link, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { TagType } from '~shared/types/base'
import { useAuth } from '../../contexts/AuthContext'
import EditButton from '../EditButton/EditButton.component'
import { RichTextFrontPreview } from '../RichText/RichTextEditor.component'
import TagBadge from '../TagBadge/TagBadge.component'
import ViewCount from '../ViewCount/ViewCount.component'
import './PostItem.styles.scss'

// Note: PostItem is the component for the homepage
const PostItem = ({
  post: { id, title, description, tags, views },
  agency,
}) => {
  const { user } = useAuth()

  const hasCommonAgencyTags = (user, tagsFromPost) => {
    const { tags: userTags } = user
    const userAgencyTagNames = userTags
      .filter(({ tagType }) => tagType === TagType.Agency)
      .map((userTag) => userTag.tagname)
    const postAgencyTagNames = tagsFromPost
      .filter(({ tagType }) => tagType === TagType.Agency)
      .map((postTag) => postTag.tagname)
    const interesectingTagNames = userAgencyTagNames.filter((tagName) =>
      postAgencyTagNames.includes(tagName),
    )
    return interesectingTagNames.length > 0
  }

  const isAgencyMember = user && tags && hasCommonAgencyTags(user, tags)

  return (
    <div className="post-with-stats flex">
      <div className="post-item">
        <div className="post-text">
          {/* Title display area */}
          <Link as={RouterLink} to={`/questions/${id}`}>
            <Text
              color="primary.900"
              _hover={{ color: 'primary.600' }}
              textStyle="h4"
            >
              {title}
            </Text>
          </Link>
          <div className="post-description-container">
            {description && <RichTextFrontPreview value={description} />}
          </div>
        </div>
        <div className="stats-wrapper">
          <div className="post-bottom-info">
            <div className="post-tags">
              {tags &&
                tags.map((tag, i) => {
                  return (
                    <TagBadge
                      tagName={tag.tagname}
                      tagType={tag.tagType}
                      size={'s-tag'}
                      float={'left'}
                      key={i}
                      agency={agency}
                    />
                  )
                })}
            </div>
            {/* TODO: reinstate after parking experiment + add styles */}
            {/* <p className={`post-date`}>{dateToDaysAgoString(createdAt)}</p> */}
          </div>
          <div className="post-side-info">
            {!isAgencyMember && (
              <ViewCount views={views} className="views-info" />
            )}
          </div>
        </div>
      </div>
      {isAgencyMember && (
        <div className="post-side-with-edit">
          <div className="view">
            <ViewCount views={views} className="views-info" />
          </div>
          <EditButton postId={id} />
        </div>
      )}
    </div>
  )
}

export default PostItem
