import { Session } from 'supertest-session'
import * as hash from './hash'

const MOCK_VALID_OTP = '123456'

/**
 * Integration test helper to create an authenticated session where the user
 * corresponding to the given email is logged in.
 *
 * ! This function does not mock mail.service. A mock mail.service should
 *   be injected in the test that creates the session.
 * ! This function mocks generateRandomDigits
 *
 * The mocks are cleared at the end of this function. However, The spies are
 * still mocking the functions, so the onus is on the calling test to restore
 * or implement new mocks when needed.
 *
 * @precondition The agency document relating to the domain of the given email must
 *               have been created prior to calling this function
 * @param email the email of the user to log in.
 * @param request the session to inject authenticated information into
 */
export const createAuthedSession = async (
  email: string,
  request: Session,
): Promise<Session> => {
  // Set that so OTP will always be static.
  const otpSpy = jest.spyOn(hash, 'generateRandomDigits')
  otpSpy.mockReturnValue(MOCK_VALID_OTP)

  const sendOtpResponse = await request.post('/auth/sendotp').send({ email })
  expect(sendOtpResponse.status).toEqual(200)

  // Act
  const verifyOtpResponse = await request
    .post('/auth/verifyotp')
    .send({ email, otp: MOCK_VALID_OTP })

  // Assert
  // Should have session cookie returned.
  expect(verifyOtpResponse.status).toEqual(200)
  const sessionCookie = request.cookies.find(
    (cookie) => cookie.name === 'connect.sid',
  )
  expect(sessionCookie).toBeDefined()

  // Clear this test's mocked spies so calls do not pollute calling test.
  // Note that the spies are still mocking the functions, so the onus is on the
  // calling test to restore or implement new mocks when needed.
  otpSpy.mockClear()
  return request
}

export const logoutSession = async (request: Session): Promise<Session> => {
  const response = await request.post('/auth/logout')

  expect(response.status).toEqual(200)

  const sessionCookie = request.cookies.find(
    (cookie) => cookie.name === 'connect.sid',
  )
  expect(sessionCookie).not.toBeDefined()

  return request
}
