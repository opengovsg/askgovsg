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
  postId: number
  userId: number
}

type PostWithRelations = Post & {
  getAnswers: (options: FindOptions) => AnswerWithRelations[]
}

type AnswerJSON = Pick<Answer, 'body'> & {
  user: {
    displayname: string
    id: number
    agency: {
      logo: string
    }
  }
}
export class AnswersService {
  /**
   * Returns all answers to a post
   * @param postId id of the post
   * @returns an array of answers
   */
  listAnswers = async (
    postId: number,
  ): Promise<
    | {
        body: string
        username: string
        userId: number
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

  /**
   * Create an answer attached to a post
   * @param postId id of post to attach to
   * @param body answer text
   * @param userId id of user that submitted the answer
   * @returns id of new answer if it is successfully created
   */
  createAnswer = async ({
    postId,
    body,
    userId,
  }: Pick<
    AnswerWithRelations,
    'body' | 'postId' | 'userId'
  >): Promise<number> => {
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

  /** Update a answer
   * @param id of answer to update
   * @param body answer text to change to
   * @returns number of rows changed in answer database
   */
  updateAnswer = async (updatedAnswer: {
    id: number
    body: string
  }): Promise<number> => {
    const res = await AnswerModel.update(
      { body: updatedAnswer.body },
      { where: { id: updatedAnswer.id } },
    )
    const changedRows = res[0]
    return changedRows
  }

  /**
   * Delete an answer. Currently not used as a post delete
   * will archive the post and will not touch the answer.
   * @param id of answer to delete
   */
  deleteAnswer = async (id: number): Promise<void> => {
    await AnswerModel.destroy({ where: { id: id } })
  }
}
