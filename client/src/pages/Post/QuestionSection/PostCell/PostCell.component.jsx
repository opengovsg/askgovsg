import { RichTextPreview } from '../../../../components/RichText/RichTextEditor.component'
import './PostCell.styles.scss'

const PostCell = ({ post }) => {
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
