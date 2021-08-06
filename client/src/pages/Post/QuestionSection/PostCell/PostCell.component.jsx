import { useQuery } from 'react-query'
import { RichTextPreview } from '../../../../components/RichText/RichTextEditor.component'
import {
  getPostById,
  GET_POST_BY_ID_QUERY_KEY,
} from '../../../../services/PostService'
import './PostCell.styles.scss'

const PostCell = ({ postId }) => {
  // TODO: review if it makes more sense to receive post as a prop from Post parent
  const { data: post, isLoading } = useQuery(
    [GET_POST_BY_ID_QUERY_KEY, postId],
    () => getPostById(postId),
  )

  return (
    <>
      <div className="post-cell">
        {post.description && (
          <div className="post-text">
            <RichTextPreview value={post.description} />
          </div>
        )}
      </div>
    </>
  )
}

export default PostCell
