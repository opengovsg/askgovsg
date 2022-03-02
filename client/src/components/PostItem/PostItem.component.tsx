import { Flex, Link, Box, useMultiStyleConfig } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import sanitizeHtml from 'sanitize-html'
import { BasePostDto } from '../../api'
import { HighlightSearchEntry } from '~shared/types/api'
import { useAuth } from '../../contexts/AuthContext'
import EditButton from '../EditButton/EditButton.component'

// Note: PostItem is the component for the homepage
const PostItem = ({
  post: { id, title, tags, agencyId, answer, highlight },
}: {
  post: Pick<BasePostDto, 'id' | 'title' | 'tags' | 'agencyId'> & {
    answer?: string
    highlight?: HighlightSearchEntry
  }
}): JSX.Element => {
  const { user } = useAuth()
  const styles = useMultiStyleConfig('PostItem', {})

  const isAgencyMember = user && tags && user.agencyId === agencyId

  return (
    <Flex sx={styles.container}>
      {/* Title display area */}
      <Link as={RouterLink} to={`/questions/${id}`}>
        {
          <Box sx={styles.linkText}>
            {highlight ? (
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    highlight.title ? highlight.title[0] : title,
                    {
                      allowedTags: ['b'],
                      allowedAttributes: {},
                    },
                  ),
                }}
              />
            ) : (
              title
            )}
          </Box>
        }
        {<Box sx={styles.answer}>{answer}</Box>}
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
