'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'tags',
      [
        {
          id: 5,
          tagname: 'was',
          description: 'Work Allocation Singapore',
          link: 'https://www.was.gov.sg/',
          hasPilot: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          tagType: 'AGENCY',
        },
        {
          id: 6,
          tagname: 'financial support',
          description: 'Financial Support',
          link: '',
          hasPilot: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tagType: 'TOPIC',
        },
        {
          id: 7,
          tagname: 'apprenticeships',
          description: 'Apprenticeships',
          link: '',
          hasPilot: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tagType: 'TOPIC',
        },
        {
          id: 8,
          tagname: 'employers',
          description: 'Employers',
          link: '',
          hasPilot: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tagType: 'TOPIC',
        },
        {
          id: 9,
          tagname: 'awards',
          description: 'Awards',
          link: '',
          hasPilot: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tagType: 'TOPIC',
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'agencies',
      [
        {
          id: 4,
          shortname: 'was',
          longname: 'Work Allocation Singapore',
          logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
          email: 'enquiries@was.gov.sg',
          website: 'https://www.was.gov.sg',
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
          id: 4,
          username: 'enquiries@was.gov.sg',
          displayname: 'Enquiries @ WAS',
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 4,
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'topics',
      [
        {
          id: 1,
          name: 'financial support',
          description: 'Financial Support topic description',
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 4,
          parentId: null,
        },
        {
          id: 2,
          name: 'apprenticeships',
          description: 'Apprenticeships topic description',
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 4,
          parentId: null,
        },
        {
          id: 3,
          name: 'employers',
          description: 'Employers topic description',
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 4,
          parentId: null,
        },
        {
          id: 4,
          name: 'awards',
          description: 'Awards topic description',
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 4,
          parentId: null,
        },
        {
          id: 5,
          name: 'application',
          description: 'financial support - application topic description',
          createdAt: new Date(),
          updatedAt: new Date(),
          agencyId: 4,
          parentId: 1,
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'posts',
      [
        {
          id: 14,
          title: 'What financial support schemes are available at WAS?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },
        {
          id: 15,
          title: 'How do I apply for a WAS scheme?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },
        {
          id: 16,
          title:
            'How long will my financial support scheme application take to process?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },
        {
          id: 17,
          title: 'How much is given out annually via WAS schemes?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },
        {
          id: 18,
          title:
            'My application for financial support was rejected. Can I apply again?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },

        {
          id: 19,
          title: 'What other non-support financial programmes are run by WAS?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },

        {
          id: 20,
          title:
            'Can I apply for the WAS Jobseeker Allowance and a WAS-sponsored apprenticeship at the same time?',
          description:
            'I am currently unemployed and need as much financial support as possible. Can I apply for both the WAS Jobseeker Allowance and an apprenticeship sponsored by WAS at the same time?',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 1,
        },

        {
          id: 21,
          title:
            'Which industry sectors have WAS-sponsored apprenticeships available?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },
        {
          id: 22,
          title:
            'Why does WAS not provide apprenticeships across all of industry?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },
        {
          id: 23,
          title: 'How long can WAS-sponsored apprenticeships run for?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },
        {
          id: 24,
          title: 'What is the minimum stipend that is given to the apprentice?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },
        {
          id: 25,
          title:
            'How can an appeal be made to WAS to consider apprenticeships in an industry sector?',
          description:
            'I am a representative of my industry sector and would like WAS to consider sponsoring apprenticeships in my sector. How should I make an appeal to WAS to do this?',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },

        {
          id: 26,
          title:
            'How do I offer WAS-sponsored apprenticeships through my company?',
          description:
            'I am an owner of a company, or a human resources officer with a company, and would like to offer WAS-sponsored apprenticeships. How do I do so?',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },
        {
          id: 27,
          title:
            'Can I offer more than the minimum stipend for WAS-sponsored apprenticeships?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 2,
        },
        {
          id: 28,
          title:
            'What kind of support can WAS provide to understaffed companies?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 3,
        },
        {
          id: 29,
          title: 'How do I apply for a subsidy for robotics and automation?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 3,
        },
        {
          id: 30,
          title:
            'Can I apply for the National Creativity Award for work done as a government contractor?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 4,
        },
        {
          id: 31,
          title:
            'What is the status of my financial support scheme application?',
          description: '',
          status: 'PUBLIC',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
          agencyId: 4,
          topicId: 5,
        },
      ],
      {},
    )
    await queryInterface.bulkInsert(
      'answers',
      [
        {
          postId: 14,
          body: 'WAS offers a Jobseeker Allowance Scheme and a Small Business Worker Income Support Package to help with the optimal allocation of work in Singapore.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 15,
          body: 'Applicants may go to our official website to submit their applications via the relevant online forms.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 16,
          body: 'Applications typically take 2-3 weeks to process. In cases with complex circumstances, applications may take up to a month.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 17,
          body: 'WAS gives out about $120,000 annually through its financial support schemes. Most of it is through Jobseeker Allowances, with the rest providing Small Business Worker Income Support',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 18,
          body: 'Applicants are advised to allow for a period of about 3 months before making an application again.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },

        {
          postId: 19,
          body: 'WAS administers the National Creativity Award, which recognises innovations made in the course of government work.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },

        {
          postId: 20,
          body: 'We currently do not allow for applications for financial support and apprenticeship at the same time. This is to prevent overallocation of funds to individuals and to optimise allocation of work done in processing applications. We apologise for the inconvenience caused.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },

        {
          postId: 21,
          body: '<p>WAS sponsors apprenticeships in sectors it identifies as in need of significant manpower. This currently includes:</p>\n<ul><li>Marine Engineering</li>\n<li>Nursing and Allied Professions</li>\n<li>Social Services</li></ul>',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 22,
          body: 'The Singapore Government has tasked WAS with the mandate of optimum allocation of work. To this end, its programmes and initiatives focus on directing people to industry sectors where the need for manpower is keenest.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 23,
          body: 'WAS-sponsored apprenticeships should last no longer than 12 months. Beyond this period, the employer should consider converting the apprentice to a full-time employment.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 24,
          body: 'The minimum stipend given to WAS-sponsored apprentices is means-tested annually and is $3000 as of 2021. 75% of this will be provided by WAS, with the remainder topped up by the employer.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 25,
          body: 'You may email us at <a href="mailto:industry.relations@was.gov.sg">industry.relations@was.gov.sg</a> to make a case for your industry sector to be considered.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },

        {
          postId: 26,
          body: 'Would-be employers may go to our official website to submit their applications via the relevant online forms.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 27,
          body: 'An employer may offer more than the minimum stipend, however, any additional salary costs shall be borne solely by the employer.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 28,
          body: '<p>As part of its mission to optimise allocation of work in Singapore, WAS offers the following programmes to employers:</p>\n<ul><li>Apprenticeships</li>\n<li>Robotics and Automation Subsidies</li></ul>',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 29,
          body: 'Understaffed companies may go to our official website to submit their applications via the relevant online forms.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 30,
          body: 'Applications for the National Creativity Award from non-government entities will be considered on a case-by-case basis.',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
        {
          postId: 31,
          body: 'To check for your application status, please visit the application portal',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 4,
        },
      ],
      {},
    )

    await queryInterface.bulkInsert(
      'posttags',
      [
        { createdAt: new Date(), updatedAt: new Date(), postId: 14, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 14, tagId: 6 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 15, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 15, tagId: 6 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 16, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 16, tagId: 6 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 17, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 17, tagId: 6 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 18, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 18, tagId: 6 },

        { createdAt: new Date(), updatedAt: new Date(), postId: 19, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 19, tagId: 6 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 19, tagId: 9 },

        { createdAt: new Date(), updatedAt: new Date(), postId: 20, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 20, tagId: 6 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 20, tagId: 7 },

        { createdAt: new Date(), updatedAt: new Date(), postId: 21, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 21, tagId: 7 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 22, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 22, tagId: 7 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 23, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 23, tagId: 7 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 24, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 24, tagId: 7 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 25, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 25, tagId: 7 },

        { createdAt: new Date(), updatedAt: new Date(), postId: 26, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 26, tagId: 7 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 26, tagId: 8 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 27, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 27, tagId: 7 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 27, tagId: 8 },

        { createdAt: new Date(), updatedAt: new Date(), postId: 28, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 28, tagId: 8 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 29, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 29, tagId: 8 },

        { createdAt: new Date(), updatedAt: new Date(), postId: 30, tagId: 5 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 30, tagId: 8 },
        { createdAt: new Date(), updatedAt: new Date(), postId: 30, tagId: 9 },
      ],
      {},
    )
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('posttags', null, {})
    await queryInterface.bulkDelete('answers', null, {})
    await queryInterface.bulkDelete('posts', null, {})
    await queryInterface.bulkDelete('topics', null, {})
    await queryInterface.bulkDelete('users', null, {})
    await queryInterface.bulkDelete('agencies', null, {})
    await queryInterface.bulkDelete('tags', null, {})
  },
}
