'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('agencies', 'noEnquiriesMessage', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('agencies', 'noEnquiriesMessage')
  },
}
