import {
  User as UserModel,
  Post as PostModel,
  Agency as AgencyModel,
  Answer as AnswerModel,
} from '../../bootstrap/sequelize'
import { PostStatus } from '../../types/post-status'
import { Answer, Post } from '../../models'
import { FindOptions } from 'sequelize/types'

type AnswerWithRelations = Answer & {
  postId: string
  userId: string
}

type PostWithRelations = Post & {
  getAnswers: (options: FindOptions) => AnswerWithRelations[]
}

type AnswerJSON = Pick<Answer, 'body'> & {
  user: {
    displayname: string
    id: string
    agency: {
      logo: string
    }
  }
}
export class AnswersService {
  createAnswer = async ({
    postId,
    body,
    userId,
  }: Pick<
    AnswerWithRelations,
    'body' | 'postId' | 'userId'
  >): Promise<string> => {
    const answer = await AnswerModel.create({
      postId: postId,
      body: body,
      userId: userId,
    })
    await PostModel.update(
      { status: PostStatus.PUBLIC },
      { where: { id: postId } },
    )
    return answer.id
  }

  update = async (updatedAnswer: {
    id: string
    body: string
  }): Promise<number> => {
    const res = await AnswerModel.update(
      { body: updatedAnswer.body },
      { where: { id: updatedAnswer.id } },
    )
    const changedRows = res[0]
    return changedRows
  }

  remove = async (id: string): Promise<void> => {
    await AnswerModel.destroy({ where: { id: id } })
  }

  getAnswers = async (
    postId: string,
  ): Promise<
    | {
        body: string
        username: string
        userId: string
        agencyLogo: string
      }[]
    | undefined
  > => {
    const post = (await PostModel.findOne({
      where: { id: postId },
    })) as PostWithRelations
    if (post) {
      const answers = await post.getAnswers({
        include: [
          {
            model: UserModel,
            include: [AgencyModel],
          },
        ],
      })

      // Redact user info except display name
      return answers.map((instance) => {
        const answer = instance.toJSON() as AnswerJSON
        const {
          user: {
            id,
            displayname,
            agency: { logo },
          },
          ...answerWithoutUser
        } = answer
        return {
          ...answerWithoutUser,
          username: displayname,
          userId: id,
          agencyLogo: logo,
        }
      })
    }
  }
}
