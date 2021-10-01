'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('agencies', 'website', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('agencies', 'website')
  },
}
