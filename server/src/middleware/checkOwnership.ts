import helperFunction from '../helpers/helperFunction'
import {
  Answer as AnswerModel,
  Post as PostModel,
  Tag as TagModel,
  User as UserModel,
} from '../bootstrap/sequelize'
import { Request, Response, NextFunction } from 'express'
import { Answer, Post, Tag } from '../models'
import { TagType } from '../types/tag-type'

type AnswerWithRelations = Answer & {
  userId: string
  post: Post & {
    tags: Tag[]
  }
}

const checkOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const results = (await AnswerModel.findOne({
    where: { id: req.params.id },
    attributes: ['userId'],
    include: [
      {
        model: PostModel,
        include: [{ model: TagModel, where: { tagType: TagType.AGENCY } }],
      },
    ],
  })) as AnswerWithRelations

  if (!results) {
    return res
      .status(400)
      .json(
        helperFunction.responseHandler(
          false,
          404,
          'No answer found with this ID',
          null,
        ),
      )
  }
  if (!req.user) {
    return res.status(401).json({ message: 'User not signed in' })
  }

  const user = (await UserModel.findByPk(req.user.id, {
    include: [{ model: TagModel, where: { tagType: TagType.AGENCY } }],
  })) as { tags: Tag[] } | null

  if (!user) {
    return res
      .status(403)
      .json(
        helperFunction.responseHandler(
          false,
          403,
          `User ${req.user.id} does not exist`,
          null,
        ),
      )
  }

  const userAgencyTagIds = user.tags.map((userTag) => userTag.id)
  const postAgencyTagIds = results.post.tags.map((postTag) => postTag.id)
  const interesectingTagIds = userAgencyTagIds.filter((id) =>
    postAgencyTagIds.includes(id),
  )

  if (interesectingTagIds.length === 0) {
    return res
      .status(403)
      .json(
        helperFunction.responseHandler(
          false,
          403,
          `User ${
            req.user.id
          } is not authorized to manage agencies ${results.post.tags
            .map((postTag) => postTag.tagname)
            .join(',')}`,
          null,
        ),
      )
  }

  next()
}

export default checkOwnership
