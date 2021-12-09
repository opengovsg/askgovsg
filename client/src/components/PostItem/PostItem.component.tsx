import { Flex, Link, Text, useMultiStyleConfig } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BasePostDto } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import EditButton from '../EditButton/EditButton.component'

// Note: PostItem is the component for the homepage
const PostItem = ({
  post: { id, title, tags, agencyId },
}: {
  post: BasePostDto
}): JSX.Element => {
  const { user } = useAuth()
  const styles = useMultiStyleConfig('PostItem', {})

  const isAgencyMember = user && tags && user.agencyId === agencyId

  return (
    <Flex sx={styles.container}>
      {/* Title display area */}
      <Link as={RouterLink} to={`/questions/${id}`}>
        <Text sx={styles.linkText}>{title}</Text>
      </Link>
      {/* <Box sx={styles.description}>
            {description && <RichTextFrontPreview value={description} />}
          </Box> */}
      {isAgencyMember && (
        <Flex sx={styles.editWrapper}>
          <EditButton postId={id} />
        </Flex>
      )}
    </Flex>
  )
}

export default PostItem
