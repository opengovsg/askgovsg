import { Link, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { TagType } from '~shared/types/base'
import { useAuth } from '../../contexts/AuthContext'
import EditButton from '../EditButton/EditButton.component'
import { RichTextFrontPreview } from '../RichText/RichTextEditor.component'
import './PostItem.styles.scss'

// Note: PostItem is the component for the homepage
const PostItem = ({
  post: { id, title, description, tags, agencyId },
  agency,
}) => {
  const { user } = useAuth()

  const isAgencyMember = user && tags && user.agencyId === agencyId

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
