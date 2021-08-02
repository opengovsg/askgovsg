import { Post } from '../models'

export type PostEditType = {
  id: string
  tagname: Array<string>
  description: string
  title: string
}

export type UpdatePostRequestDto = Pick<Post, 'title' | 'description'> & {
  tagname: string[]
}
