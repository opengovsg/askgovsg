/**
 * Error connecting to captcha server
 */
export class CaptchaConnectionError extends Error {
  constructor(message = 'Error while connecting to Captcha server') {
    super(message)
    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    Object.setPrototypeOf(this, CaptchaConnectionError.prototype)
  }
}

/**
 * Wrong captcha response
 */
export class VerifyCaptchaError extends Error {
  constructor(message = 'Incorrect Captcha response') {
    super(message)
    Object.setPrototypeOf(this, VerifyCaptchaError.prototype)
  }
}

/**
 * Missing captcha response
 */
export class MissingCaptchaError extends Error {
  constructor(message = 'Missing Captcha response') {
    super(message)
    Object.setPrototypeOf(this, MissingCaptchaError.prototype)
  }
}
