import { Flex, Link, Text, Box, useMultiStyleConfig } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import sanitizeHtml from 'sanitize-html'
import { BasePostDto } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import EditButton from '../EditButton/EditButton.component'

function formatPostTitle(title: string, searchQuery: string) {
  const searchQueryTerms: string[] = searchQuery.split(' ')
  let formattedTitle: string = title
  searchQueryTerms.forEach((word) => {
    const regex = new RegExp('(' + word + ')', 'gi')
    formattedTitle = formattedTitle.replace(regex, `<b>$1</b>`)
  })
  return formattedTitle
}

// Note: PostItem is the component for the homepage
const PostItem = ({
  post: { id, title, tags, agencyId, answer, searchQuery },
}: {
  post: Pick<BasePostDto, 'id' | 'title' | 'tags' | 'agencyId'> & {
    answer?: string
    searchQuery?: string
  }
}): JSX.Element => {
  const { user } = useAuth()
  const styles = useMultiStyleConfig('PostItem', {})

  const isAgencyMember = user && tags && user.agencyId === agencyId

  return (
    <Flex sx={styles.container}>
      {/* Title display area */}
      <Link as={RouterLink} to={`/questions/${id}`}>
        {searchQuery ? (
          <Box sx={styles.linkText}>
            <p
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(formatPostTitle(title, searchQuery), {
                  allowedTags: ['b'],
                  allowedAttributes: {},
                }),
              }}
            />
          </Box>
        ) : (
          <Text sx={styles.linkText}>{title}</Text>
        )}
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
