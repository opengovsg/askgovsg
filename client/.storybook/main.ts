const {
  aliasDangerous,
  configPaths,
} = require('react-app-rewire-alias/lib/aliasDangerous')
const path = require('path')

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    '@chakra-ui/storybook-addon',
  ],
  refs: {
    '@chakra-ui/react': {
      disable: true,
    },
  },
  framework: '@storybook/react',
  core: {
    builder: 'webpack5',
  },
  webpackFinal: async (webpackConfig) => {
    // mock external services
    webpackConfig.resolve.alias['../../contexts/googleAnalytics'] =
      require.resolve('../src/__mocks__/googleAnalytics.ts')
    webpackConfig.resolve.alias['@fullstory/browser'] = require.resolve(
      '../src/__mocks__/fullStory.ts',
    )

    // as storybook uses a separate build config,
    // configure storybook's webpack to use shared folder
    aliasDangerous(configPaths('../tsconfig.paths.json'))(webpackConfig)
    const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
      ({ constructor }) =>
        constructor && constructor.name === 'ModuleScopePlugin',
    )
    webpackConfig.resolve.plugins.splice(scopePluginIndex, 1)
    webpackConfig.module.rules[5].oneOf[3].include.push(
      path.resolve(__dirname, '../../shared/src'),
    )
    return webpackConfig
  },
}
