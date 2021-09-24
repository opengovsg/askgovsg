'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'tags',
      [
        {
          id: 10,
          tagname: 'tmg',
          description: 'Test Ministry of Grants',
          link: 'https://ogp-suite-demo-site-staging.netlify.app/',
          hasPilot: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          tagType: 'AGENCY',
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'agencies',
      [
        {
          id: 5,
          shortname: 'tmg',
          longname: 'Test Ministry of Grants',
          logo: 'https://ogp-suite-demo-site-staging.netlify.app/',
          email: 'enquiries@tmg.gov.sg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: 5,
          username: 'enquiries@tmg.gov.sg',
          displayname: 'Enquiries @ TMG',
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 5,
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'posts',
      [
        {
          id: 31,
          title: 'How do I join the Baby Pet Bonus Scheme?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
        {
          id: 32,
          title:
            'I am an overseas Singaporean pet owner. Is my pet eligible for the Baby Pet bonus and how can I apply?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
        {
          id: 33,
          title:
            'How are twins and triplets counted in terms of pet ownership order?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
        {
          id: 34,
          title:
            'What happens to the calculation of the ownership order when a pet passes away?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'answers',
      [
        {
          postId: 31,
          body: 'You can join the Baby Pet Bonus Scheme by applying at <a href="https://ogp-suite-demo-site-staging.netlify.app/">Baby Pet Bonus Online</a>.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
        {
          postId: 32,
          body: "If either you or your spouse is a Singapore Citizen at the time of your pet's birth, your pet will be eligible for the full amount of Baby Pet Bonus benefits. You will receive the Baby Pet Bonus benefits after joining the scheme.",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
        {
          postId: 33,
          body: 'Twins and triplets (and other multiple births) are counted as separate pet ownerships. For e.g. the first twin is considered as the first pet and the second twin as the second pet.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
        {
          postId: 34,
          body: 'The deceased pet is still counted in the ownership order when there are subsequent pets owned by the couple.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 5,
        },
      ],
      {},
    )

    await queryInterface.bulkInsert(
      'permissions',
      [
        {
          role: 'answerer',
          createdAt: new Date(),
          updatedAt: new Date(),
          tagId: 10,
          userId: 5,
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'posttags',
      [
        { createdAt: new Date(), updatedAt: new Date(), postId: 31, tagId: 10 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 32, tagId: 10 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 33, tagId: 10 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 34, tagId: 10 },
      ],
      {},
    )
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('posttags', null, {})
    await queryInterface.bulkDelete('permissions', null, {})
    await queryInterface.bulkDelete('answers', null, {})
    await queryInterface.bulkDelete('posts', null, {})
    await queryInterface.bulkDelete('users', null, {})
    await queryInterface.bulkDelete('agencies', null, {})
    await queryInterface.bulkDelete('tags', null, {})
  },
}
