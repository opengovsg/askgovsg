declare module 'supertest-session' {
  import supertest, { SuperAgentTest } from 'supertest'
  import { Express } from 'express'

  export interface Session extends supertest.SuperTest<supertest.Test> {
    agent: SuperAgentTest
    app: Express
    url: string
    options: Record<string, unknown>
    reset: () => void

    cookies: ReturnType<SuperAgentTest['jar']['getCookies']>
  }

  export default function (app: Express): Session
}
