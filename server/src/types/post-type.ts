import { Post } from '~shared/types/base'

export type PostEditType = {
  id: number
  userid: number
  tagname: Array<string> | null
  topicname: string | null
  description: string
  title: string
}

export type UpdatePostRequestDto = Pick<Post, 'title' | 'description'> & {
  tagname: string[]
  topicname: string
}
