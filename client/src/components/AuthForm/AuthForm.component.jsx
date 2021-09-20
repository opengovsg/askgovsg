import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { getApiErrorMessage } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import * as AuthService from '../../services/AuthService'
import Spinner from '../Spinner/Spinner.component'
import { useStyledToast } from '../StyledToast/StyledToast'
import './AuthForm.styles.scss'

const OtpState = {
  Initial: 0,
  Requested: 1,
  Sent: 2,
}

const AuthForm = () => {
  const toast = useStyledToast()
  const { register, handleSubmit, reset } = useForm()
  const [otpState, setOtpState] = useState(OtpState.Initial)
  const auth = useAuth()

  const sendOtp = useMutation(AuthService.sendOtp, {
    onSuccess: () => {
      setOtpState(OtpState.Sent)
      toast({
        status: 'success',
        description: 'OTP sent',
      })
    },
    onError: (error) => {
      toast({
        status: 'error',
        description: getApiErrorMessage(error),
      })
    },
  })

  const onSubmit = (data) => {
    if (otpState === OtpState.Sent) {
      // Assumed at this point that
      // shape is { email, otp }
      auth.verifyOtp.mutate(data, {
        onError: (error) => {
          toast({
            status: 'error',
            description: getApiErrorMessage(error),
          })
        },
      })
      reset()
    } else {
      setOtpState(OtpState.Requested)
      sendOtp.mutate(data.email)
    }
  }

  let OtpComponent = null
  if (otpState === OtpState.Sent) {
    OtpComponent = (
      <>
        <label className="form-label">OTP</label>
        <input
          className="form-input"
          {...register('otp', { required: true })}
        />
      </>
    )
  } else if (otpState === OtpState.Requested) {
    OtpComponent = <Spinner centerHeight="50px" />
  }

  const contactComponent = (
    <>
      <label className="form-label">Email</label>
      <input
        className="form-input"
        placeholder="e.g. jane@mail.com"
        {...register('email', { required: true })}
      />
    </>
  )

  return (
    <div className="form-container">
      <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
        {contactComponent}
        {OtpComponent}
        <input
          id="submit-button"
          name="submit-button"
          type="submit"
          value={otpState === OtpState.Sent ? 'Log In' : 'Send OTP'}
        />
      </form>
    </div>
  )
}

export default AuthForm
