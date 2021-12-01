import minimatch from 'minimatch'
import { ModelCtor } from 'sequelize/types'
import { Post, PostStatus, Topic } from '~shared/types/base'
import { createLogger } from '../../bootstrap/logging'
import { User } from '../../models'
import { PostCreation } from '../../models/posts.model'
import { ModelDef } from '../../types/sequelize'

const logger = createLogger(module)

export class AuthService {
  private emailValidator
  private User: ModelCtor<User>
  private Post: ModelDef<Post, PostCreation>
  private Topic: ModelDef<Topic>

  constructor({
    emailValidator,
    User,
    Post,
    Topic,
  }: {
    emailValidator: minimatch.IMinimatch
    User: ModelCtor<User>
    Post: ModelDef<Post, PostCreation>
    Topic: ModelDef<Topic>
  }) {
    this.emailValidator = emailValidator
    this.User = User
    this.Post = Post
    this.Topic = Topic
  }

  /**
   * Get the user from username only if user has validated email
   * @param username username of the user to retrieve
   * @returns user with the username
   */
  checkIfWhitelistedOfficer = async (username: string): Promise<User> => {
    if (!username) {
      throw new Error('username must be provided')
    }
    const user = await this.User.findOne({ where: { username } })
    if (this.isOfficerEmail(username)) {
      if (user) {
        return user
      } else {
        throw new Error('User is not a whitelisted officer')
      }
    } else {
      // prevent random users from login
      throw new Error('User is not a whitelisted officer')
    }
  }

  /**
   * Check if a user has permission to answer a post
   * @param userId of user
   * @param postId of post
   * @returns true if user has permission to answer post
   */
  hasPermissionToAnswer = async (
    userId: number,
    postId: number,
  ): Promise<boolean> => {
    const user = await this.User.findByPk(userId)
    const post = await this.Post.findByPk(postId)

    return Boolean(post && user && post.agencyId === user.agencyId)
  }

  /**
   * Check if a user is able to view the post
   * @param post post to be viewed
   * @param userId id of user
   * @returns true if user can view post
   */
  verifyUserCanViewPost = async (
    post: Post,
    userId?: string,
  ): Promise<void> => {
    // If post is public, anyone can view
    if (post.status === PostStatus.Public) return

    // If private or archived, must be logged in
    if (!userId)
      throw new Error('User must be logged in to access private post')
    const user = await this.User.findOne({ where: { id: userId } })

    if (user) {
      // If officer, they may have permission to answer
      if (this.isOfficerEmail(user.username)) {
        if (await this.hasPermissionToAnswer(user.id, post.id)) return
      }

      // If none of the above, they must have created the post
      if (user.id === post.userId) return
      throw new Error('User does not have permission to access post')
    }
  }

  /**
   * Check if user has an validated email
   * @param email email of user
   * @returns true if user has validated email
   */
  isOfficerEmail = (email: string): boolean => this.emailValidator.match(email)

  /**
   * Check if a user is able to update/delete a topic
   * @param userId id of user
   * @param topicId id of topic
   * @returns true if user can create/update/delete topic
   */
  verifyUserCanModifyTopic = async (
    topicId: number,
    userId: number,
  ): Promise<boolean> => {
    const topic = await this.Topic.findOne({ where: { id: topicId } })
    const topicAgency = topic?.agencyId
    const user = await this.User.findOne({ where: { id: userId } })
    const userAgency = user?.agencyId

    return topicAgency === userAgency
  }

  /**
   * Check if a user belongs to an agency
   * @param userId id of user
   * @param agencyId id of agency
   * @returns true if user belongs to specified agency
   */
  verifyUserInAgency = async (
    userId: number,
    agencyId: number,
  ): Promise<boolean> => {
    const user = await this.User.findOne({ where: { id: userId } })
    const userAgency = user?.agencyId

    return userAgency === agencyId
  }
}
