export const indexConfig = {
  settings: {
    // Implement stop word filter using text analyzer
    analysis: {
      analyzer: {
        default: {
          tokenizer: 'whitespace',
          filter: ['stop_words_filter'],
        },
      },
      filter: {
        stop_words_filter: {
          type: 'stop',
          ignore_case: true,
        },
      },
    },
  },
  mappings: {
    properties: {
      agencyId: {
        type: 'integer',
      },
      postId: {
        type: 'integer',
      },
      topicId: {
        type: 'integer',
      },
    },
  },
}
