import { RequestHandler } from 'express'

export type ResponseHandlerResult = {
  success: boolean
  code: number
  message: string
  data: any
}

export type HelperResult = [
  ResponseHandlerResult | null,
  ResponseHandlerResult | null,
]

export type HelperResultCallback = (
  error: ResponseHandlerResult | null,
  data: ResponseHandlerResult | null,
) => void

export type ControllerHandler<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals = Record<string, unknown>,
> = RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
