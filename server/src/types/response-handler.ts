import { RequestHandler } from 'express'

export type ControllerHandler<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals = Record<string, unknown>,
> = RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
