import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Post } from '~shared/types/base'
import {
  Answer as AnswerModel,
  Post as PostModel,
  User as UserModel,
} from '../bootstrap/sequelize'
import { Answer } from '../models'

type AnswerWithRelations = Answer & {
  userId: number
  post: Post
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
      },
    ],
  })) as AnswerWithRelations
  if (!results) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'No answer found with this ID' })
  }
  if (!req.user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'User not signed in' })
  }

  const user = await UserModel.findByPk(req.user.id)

  if (!user) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: `User ${req.user.id} does not exist`,
    })
  }

  if (user?.agencyId !== results.post.agencyId) {
    const message = `User ${req.user.id} is not authorized to manage this question`
    return res.status(StatusCodes.FORBIDDEN).json({ message: message })
  }

  next()
}

export default checkOwnership
