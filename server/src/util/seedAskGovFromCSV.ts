import sequelize, {
  Post,
  Answer,
  Tag,
  PostTag,
  Permission,
  Agency,
  User,
} from '../bootstrap/sequelize'
import { PostStatus } from '../../../shared/types/base'

import neatCsv from 'neat-csv'
import { promises as fs } from 'fs'

// This is a script that will automate seeding AskGov DB from a CSV. It is aligned with what a user can do on a
// website, so it will not exceed 150 characters for title, or create tags if they do not exist yet.

// Prerequisites:
// User has permissions to add agencyTag and tags for all rows.

// Procedure:
// The CSV should have three columns titled 'tag', 'question', 'answer'. Other columns will
// be ignored. From each row, it will create a question and answer and link them to each other.
// Then it will link the agency and the tags to the post. It only adds one agency and topic tag.
// Additional ones will have to be created manually.
// It will not alter agencies, tags, users or permission. Those have to be created first
// It will alter tables posts, posttags, answers.

// To run:
// Install ts-node if not done so, change directory to /util and run
// ts-node seedAskGovFromCSV.ts

// **********************************
// CHANGE THESE SETTINGS:
// User ID is id of user that creates the form
// Agency ID is the ID of agency tag
const user = { id: 4 }
const agencyTag = { id: 5 }
const fileName = 'example_data.csv'
// **********************************

;(async () => {
  const csvString = await fs.readFile(fileName)
  const data = await neatCsv(csvString)

  await sequelize.transaction(async (t) => {
    // PRE-UPDATE CHECKS
    const agencyCount = await Agency.count()
    const tagCount = await Tag.count()
    const userCount = await User.count()
    const permissionCount = await Permission.count()

    // Check that user has permissions to add agencyTag
    const userAgencyPermission = await Permission.findAll({
      where: {
        tagId: agencyTag.id,
        userId: user.id,
      },
    })

    if (userAgencyPermission.length !== 1) {
      // User does not have permission to add agency tag. Throw error to rollback
      throw new Error()
    }

    // Check that user has permissions to add every row's tags
    const checkPermissionTags = async (tagname: string) => {
      // Find tag
      const topicTag = await Tag.findAll({
        where: {
          tagname: tagname,
        },
      })

      if (topicTag.length !== 1) {
        // Tag does not exist. Throw error to rollback
        throw new Error()
      }

      // Check that user has permissions to add particular tag
      const userTagPermission = await Permission.findAll({
        where: {
          tagId: topicTag[0].id,
          userId: user.id,
        },
      })

      if (userTagPermission.length !== 1) {
        // User does not have permission to add tag. Throw error to rollback
        throw new Error()
      }
    }

    for (const row of data) {
      await checkPermissionTags(row.tag)
    }

    // UPDATE
    const processOneRow = async (
      question: string,
      answerInput: string,
      tagname: string,
    ) => {
      // console.log('Creating: ', tagname, question, answer)

      // Create post
      // If title length exceeds 147 char, cut at 147 and add it to description
      let title = question
      let description = ''
      if (title.length > 147) {
        title = question.slice(0, 147) + '...'
        description = question
      }
      const post = await Post.create(
        {
          title: title,
          description: description,
          status: PostStatus.Public,
          userId: user.id,
        },
        { transaction: t },
      )

      // Create answer
      const answer = await Answer.create(
        {
          body: answerInput,
          userId: user.id,
          postId: post.id,
        },
        { transaction: t },
      )

      // Link agency with post
      const agencyPostTag = await PostTag.create(
        {
          postId: post.id,
          tagId: agencyTag.id,
        },
        { transaction: t },
      )

      // Find tag
      const topicTag = await Tag.findAll({
        where: {
          tagname: tagname,
        },
      })

      // Link tag to post
      const topicPostTag = await PostTag.create(
        {
          postId: post.id,
          tagId: topicTag[0].id,
        },
        { transaction: t },
      )
    }

    // Run it for every row
    for (const row of data) {
      await processOneRow(row.question, row.answer, row.tag)
    }

    // POST-UPDATE CHECKS
    if (agencyCount !== (await Agency.count())) throw new Error()
    if (tagCount !== (await Tag.count())) throw new Error()
    if (userCount !== (await User.count())) throw new Error()
    if (permissionCount !== (await Permission.count())) throw new Error()
  })
})()
