const {
  aliasDangerous,
  configPaths,
} = require('react-app-rewire-alias/lib/aliasDangerous')

module.exports = function override(config, _env) {
  aliasDangerous(configPaths('tsconfig.paths.json'))(config)
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  })
  return config
}
