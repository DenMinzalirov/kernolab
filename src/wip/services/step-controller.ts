import { API_BASE_AUTH_URL } from 'config'

import { AuthResponse } from './auth-v4'
import { request } from './base'

export interface MFAAddAuthResponse extends AuthResponse {
  secret: string
}

type EmailAddRequest = {
  email: string
}
type VerifyEmailRequest = {
  code: string
}
type MFAConfirmRequest = {
  totp: string
}
type VerifyPhoneRequest = {
  code: string
}
type MFAVerifyRequest = {
  totp: string
}
type PasswordVerifyRequest = {
  password: string
}

const addEmail = (token: string, data: EmailAddRequest): Promise<MFAAddAuthResponse> =>
  request({ url: '/public/auth/v4/step/add-email', baseURL: API_BASE_AUTH_URL, data, token })

const addMfa = (token: string): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/add-mfa', baseURL: API_BASE_AUTH_URL, token })

const confirmEmail = (token: string, data: VerifyEmailRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/confirm-email', baseURL: API_BASE_AUTH_URL, data, token })

const confirmMfa = (token: string, data: MFAConfirmRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/confirm-mfa', baseURL: API_BASE_AUTH_URL, data, token })

const confirmPhone = (token: string, data: VerifyPhoneRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/confirm-phone', baseURL: API_BASE_AUTH_URL, data, token })

const resendOtp = (token: string): Promise<void> =>
  request({ url: '/public/auth/v4/step/resend-otp', baseURL: API_BASE_AUTH_URL, token })

const resetMfa = (token: string): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/reset-mfa', baseURL: API_BASE_AUTH_URL, token })

const verifyEmail = (token: string, data: VerifyEmailRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/verify-email', baseURL: API_BASE_AUTH_URL, data, token })

const verifyMfa = (token: string, data: MFAVerifyRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/verify-mfa', baseURL: API_BASE_AUTH_URL, data, token })

const verifyNewEmail = (token: string, data: VerifyEmailRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/verify-new-email', baseURL: API_BASE_AUTH_URL, data, token })

const verifyNewPhone = (token: string, data: VerifyPhoneRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/verify-new-phone', baseURL: API_BASE_AUTH_URL, data, token })

const verifyPassword = (token: string, data: PasswordVerifyRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/verify-password', baseURL: API_BASE_AUTH_URL, data, token })

const verifyPhone = (token: string, data: VerifyPhoneRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/verify-phone', baseURL: API_BASE_AUTH_URL, data, token })

const setNewPassword = (token: string): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/step/set-new-password', baseURL: API_BASE_AUTH_URL, token })

export const StepControllerService = {
  addEmail,
  addMfa,

  confirmEmail,
  confirmMfa,
  confirmPhone,

  resendOtp,

  resetMfa,

  verifyEmail,
  verifyMfa,
  verifyNewEmail,
  verifyNewPhone,
  verifyPassword,
  verifyPhone,

  setNewPassword,
}
