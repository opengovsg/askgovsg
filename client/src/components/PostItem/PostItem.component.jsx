import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { TagType } from '~shared/types/base'
import EditButton from '../EditButton/EditButton.component'
import { RichTextFrontPreview } from '../RichText/RichTextEditor.component'
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
      </div>
      {isAgencyMember && (
        <div className="post-side-with-edit">
          <EditButton postId={id} />
        </div>
      )}
    </div>
  )
}

export default PostItem
