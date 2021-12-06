import sequelize, {
  Post,
  Answer,
  Tag,
  Agency,
  User,
  Topic,
} from '../bootstrap/sequelize'
import { PostStatus } from '~shared/types/base'

import neatCsv from 'neat-csv'
import { promises as fs } from 'fs'

// This is a script that will automate seeding AskGov DB from a CSV. It is aligned with what a user can do on a
// website, so it will not exceed 150 characters for title, or create tags if they do not exist yet.

// Prerequisites:
// User has permissions to add agencyTag and tags for all rows.

// Procedure:
// The CSV should have three columns titled 'topic', 'question', 'answer'. Other columns will
// be ignored. From each row, it will create a question and answer and link them to each other.
// Then it will link the agency and topic to the post.
// It will not alter agencies, tags, or users. Those have to be created first
// It will alter tables posts, answers.

// To run:
// Install ts-node if not done so, change directory to /util and run
// ts-node seedAskGovFromCSV.ts

// **********************************
// CHANGE THESE SETTINGS:
// User ID is id of user that creates the form
// Agency ID is the id of the agency that the user belongs to
const agencyId = 5
const user = { id: 4, agencyId }
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
    const topicCount = await Topic.count()

    // Check that user has permissions to add every row's topics
    const checkPermissionTopics = async (topicname: string) => {
      // Find topic
      const topic = await Topic.findAll({
        where: {
          name: topicname,
        },
      })

      if (topic.length !== 1) {
        // Topic does not exist. Throw error to rollback
        throw new Error()
      }

      if (user.agencyId !== topic[0].agencyId) {
        // User does not have permission to add topic. Throw error to rollback
        throw new Error()
      }
    }

    for (const row of data) {
      await checkPermissionTopics(row.topic)
    }

    // UPDATE
    const processOneRow = async (
      question: string,
      answerInput: string,
      topicName: string,
    ) => {
      // console.log('Creating: ', tagname, question, answer)

      // find topic id
      const topic = await Topic.findOne({
        where: {
          name: topicName,
        },
      })

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
          agencyId,
          topicId: topic?.id || null,
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
    }

    // Run it for every row
    for (const row of data) {
      await processOneRow(row.question, row.answer, row.topic)
    }

    // POST-UPDATE CHECKS
    if (agencyCount !== (await Agency.count())) throw new Error()
    if (tagCount !== (await Tag.count())) throw new Error()
    if (userCount !== (await User.count())) throw new Error()
    if (topicCount !== (await Topic.count())) throw new Error()
  })
})()
