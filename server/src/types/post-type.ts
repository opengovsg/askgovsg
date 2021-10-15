import { Post } from '~shared/types/base'

export type PostEditType = {
  id: number
  tagname: Array<string>
  description: string
  title: string
}

export type UpdatePostRequestDto = Pick<Post, 'title' | 'description'> & {
  tagname: string[]
}
