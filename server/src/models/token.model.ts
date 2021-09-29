import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize'

export const TOKEN_MODEL_NAME = 'token'

export interface Token extends Model {
  contact: string
  hashedOtp: string
  attempts: number
}

export const defineToken = (sequelize: Sequelize): ModelCtor<Token> =>
  sequelize.define(TOKEN_MODEL_NAME, {
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hashedOtp: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  })
