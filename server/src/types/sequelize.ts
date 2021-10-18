import { Model, ModelCtor } from 'sequelize'

export type Creation<M> = Omit<M, 'createdAt' | 'updatedAt' | 'id'>

export type ModelDef<M, C = Creation<M>> = ModelCtor<Model<M, C> & M>
