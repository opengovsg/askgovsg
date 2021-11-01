import { Answer, PostStatus, Post } from '~shared/types/base'
import { ModelDef } from '../../types/sequelize'
import { PostCreation } from '../../models/posts.model'

export class AnswersService {
  private Post: ModelDef<Post, PostCreation>
  private Answer: ModelDef<Answer>

  constructor({
    Post,
    Answer,
  }: {
    Post: ModelDef<Post, PostCreation>
    Answer: ModelDef<Answer>
  }) {
    this.Post = Post
    this.Answer = Answer
  }

  /**
   * Returns all answers to a post
   * @param postId id of the post
   * @returns an array of answers
   */
  listAnswers = async (postId: number): Promise<Answer[]> => {
    const answers = await this.Answer.findAll({
      where: { postId },
    })
    return answers
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
  }: Pick<Answer, 'body' | 'postId' | 'userId'>): Promise<number> => {
    const answer = await this.Answer.create({
      postId: postId,
      body: body,
      userId: userId,
    })
    await this.Post.update(
      { status: PostStatus.Public },
      { where: { id: postId } },
    )
    return answer.id
  }

  /**
   * Update an answer
   * @param id of answer to update
   * @param body answer text to change to
   * @returns number of rows changed in answer database
   */
  updateAnswer = async (updatedAnswer: {
    id: number
    body: string
  }): Promise<number> => {
    const res = await this.Answer.update(
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
    await this.Answer.destroy({ where: { id } })
  }
}
