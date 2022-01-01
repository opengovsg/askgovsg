import { PostStatus } from '~shared/types/base'

export const MockAgencyShortNameData = [
  { shortname: 'abc' },
  { shortname: 'def' },
  { shortname: 'ghi' },
]

export const MockTopicData = [
  {
    id: 1,
    name: 'financial support',
    description: 'Financial Support topic description',
    createdAt: '2021-11-09T07:12:40.000Z',
    updatedAt: '2021-11-09T07:12:40.000Z',
    agencyId: 11,
    parentId: null,
  },
  {
    id: 2,
    name: 'apprenticeships',
    description: 'Apprenticeships topic description',
    createdAt: '2021-11-09T07:12:40.000Z',
    updatedAt: '2021-11-09T07:12:40.000Z',
    agencyId: 11,
    parentId: null,
    children: [],
  },
  {
    id: 3,
    name: 'employers',
    description: 'Employers topic description',
    createdAt: '2021-11-09T07:12:40.000Z',
    updatedAt: '2021-11-09T07:12:40.000Z',
    agencyId: 11,
    parentId: null,
    children: [],
  },
  {
    id: 4,
    name: 'awards',
    description: 'Awards topic description',
    createdAt: '2021-11-09T07:12:40.000Z',
    updatedAt: '2021-11-09T07:12:40.000Z',
    agencyId: 11,
    parentId: null,
    children: [],
  },
]

export const MockUserData = {
  id: 32,
  username: 'abc@open.gov.sg',
  displayname: 'John Doe',
  views: 0,
  createdAt: '2021-12-28T16:22:00.000Z',
  updatedAt: '2021-12-28T16:22:00.000Z',
  agencyId: 11,
  agency: {
    id: 11,
    shortname: 'tmg',
    longname: 'Test Ministry of Grants',
    email: 'enquiries@tmg.gov.sg',
    logo: 'https://logos.ask.gov.sg/askgov-logo.svg',
    noEnquiriesMessage: 'Test message',
    website: null,
    displayOrder: null,
    createdAt: '2021-09-27T01:59:04.000Z',
    updatedAt: '2021-09-27T01:59:04.000Z',
  },
}

export const MockAgencyData = {
  id: 11,
  createdAt: new Date(),
  updatedAt: new Date(),
  shortname: 'ABC',
  longname: "Amy's Bacon Company",
  email: 'ABC@abc.com',
  logo: 'ABC.png',
  noEnquiriesMessage: null,
  website: null,
  displayOrder: [],
}

export const MockSearchData = [
  {
    title: 'What is the minimum stipend that is given to the apprentice?',
    description: '',
    answers: [
      'The minimum stipend given to WAS-sponsored apprentices is means-tested annually and is $3000 as of 2021. 75% of this will be provided by WAS, with the remainder topped up by the employer.',
    ],
    agencyId: 4,
    postId: 24,
    topicId: 2,
  },
  {
    title: 'What financial support schemes are available at WAS?',
    description: '',
    answers: [
      'WAS offers a Jobseeker Allowance Scheme and a Small Business Worker Income Support Package to help with the optimal allocation of work in Singapore.',
    ],
    agencyId: 4,
    postId: 14,
    topicId: 1,
  },
]

export const MockAnswerData = [
  {
    body: 'This is answer no. 1',
    postId: 1,
    agencyLogo: 'ABC',
    userId: 420,
    username: 'John Doe',
    id: 1,
    createdAt: '2021-12-06T07:09:19.000Z',
    updatedAt: '2021-12-06T07:09:19.000Z',
  },
  {
    body: 'This is answer no. 2',
    postId: 1,
    agencyLogo: 'ABC',
    userId: 420,
    username: 'John Doe',
    id: 1,
    createdAt: '2021-12-06T07:09:19.000Z',
    updatedAt: '2021-12-06T07:09:19.000Z',
  },
  {
    body: 'This is answer no. 3',
    postId: 1,
    agencyLogo: 'ABC',
    userId: 420,
    username: 'John Doe',
    id: 1,
    createdAt: '2021-12-06T07:09:19.000Z',
    updatedAt: '2021-12-06T07:09:19.000Z',
  },
]

export const MockPostData = {
  posts: [
    {
      id: 659,
      userId: 13,
      title:
        'What is Singapore’s historical and forecasted electricity demand?',
      description: '',
      createdAt: '2021-12-06T07:10:22.000Z',
      views: 12,
      answerCount: 1,
      topicId: 90,
      agencyId: 11,
      tags: [],
      user: { username: 'abc@open.gov.sg' },
      updatedAt: '2021-12-06T07:10:22.000Z',
      status: PostStatus.Public,
      answers: [
        {
          id: 651,
          body: '<p>You may refer to our annual <a href="https://www.ema.gov.sg/Singapore_Energy_Statistics.aspx" target="_blank">Singapore Energy Statistics</a>  publication (SES) for the historical electricity demand.</p>\n<p>For forecasted electricity demand, visit the <a href="https://www.ema.gov.sg/cmsmedia/PPD/Singapore-Electricity-Market-Outlook-2020.pdf" target="_blank">Singapore Electricity Market Outlook (SEMO)</a>  for the details.</p>\n',
          createdAt: '2021-12-06T07:10:22.000Z',
          updatedAt: '2021-12-06T07:10:22.000Z',
          userId: 13,
          postId: 656,
        },
      ],
      topic: { name: 'Statistics', description: null },
    },
    {
      id: 660,
      userId: 13,
      title: 'How is electricity demand forecasted?',
      description: '',
      createdAt: '2021-12-06T07:11:25.000Z',
      views: 9,
      answerCount: 1,
      topicId: 90,
      agencyId: 11,
      tags: [],
      updatedAt: '2021-12-06T07:10:22.000Z',
      user: { username: 'abc@open.gov.sg' },
      status: PostStatus.Public,
      answers: [
        {
          id: 652,
          body: '<p>Electricity demand forecast accounts for various factors, including changes to population, temperature, projected Gross Domestic Product (GDP), and projected demand from new high-growth sectors as such data centres.</p>\n<p>You may also visit the <a href="https://www.ema.gov.sg/cmsmedia/PPD/Singapore-Electricity-Market-Outlook-2020.pdf" target="_blank">Singapore Electricity Market Outlook (SEMO)</a>  for more details.</p>\n',
          createdAt: '2021-12-06T07:11:25.000Z',
          updatedAt: '2021-12-06T07:11:25.000Z',
          userId: 13,
          postId: 657,
        },
      ],
      topic: { name: 'Statistics', description: null },
    },
    {
      id: 661,
      userId: 13,
      title:
        'Where can I find Singapore energy statistics, e.g. residential electricity consumption data?',
      description: '',
      createdAt: '2021-12-06T07:09:19.000Z',
      views: 8,
      answerCount: 1,
      topicId: 90,
      agencyId: 11,
      tags: [],
      status: PostStatus.Public,
      updatedAt: '2021-12-06T07:10:22.000Z',
      user: { username: 'abc@open.gov.sg' },
      answers: [
        {
          id: 650,
          body: '<p>You may refer to our annual <a href="https://www.ema.gov.sg/Singapore_Energy_Statistics.aspx" target="_blank">Singapore Energy Statistics</a>  publication (SES) which consists of an interactive microsite and downloadable data tables.</p>\n<p>For residential electricity and town gas consumption data, you can refer to <a href="https://www.ema.gov.sg/singapore-energy-statistics/Ch03/index3" target="_blank">Chapter 3</a>  of our SES microsite or refer to the downloadable data tables (Table 3.4 to 3.5 for electricity consumption and Table 3.9 to 3.11 for town gas consumption).</p>\n<p></p>\n<p>You may also visit the <a href="https://www.ema.gov.sg/Statistics.aspx" target="_blank">EMA Statistics webpage</a>  for the list of energy statistics published by EMA.</p>\n',
          createdAt: '2021-12-06T07:09:19.000Z',
          updatedAt: '2021-12-06T07:09:19.000Z',
          userId: 13,
          postId: 655,
        },
      ],
      topic: { name: 'Statistics', description: null },
    },
  ],
  totalItems: 3,
}
