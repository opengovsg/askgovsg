import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { TagType } from '../../types/tag-type'
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
          <h2>
            {/* Title display area */}
            <Link to={`/questions/${id}`}>{title}</Link>
          </h2>
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
