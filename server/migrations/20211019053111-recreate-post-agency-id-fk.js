'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('posts', {
      type: 'FOREIGN KEY',
      name: 'posts_agencyId_foreign_idx',
      fields: ['agencyId'],
      references: {
        table: 'agencies',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('posts', 'posts_agencyId_foreign_idx')
  },
}
