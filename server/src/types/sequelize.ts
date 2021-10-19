import { Model, ModelCtor } from 'sequelize'

export type Creation<M> = Omit<M, 'createdAt' | 'updatedAt' | 'id'>

export type ModelInstance<M, C = Creation<M>> = Model<M, C> & M

export type ModelDef<M, C = Creation<M>> = ModelCtor<ModelInstance<M, C>>
