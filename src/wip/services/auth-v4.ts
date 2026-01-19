import { API_BASE_AUTH_URL, kycLevel } from 'config'

import { request } from './base'
import { MFAAddAuthResponse } from './step-controller'

export interface LoginByEmailRequest {
  email: string
  password: string
}
export interface AddPhoneRequest {
  phone: string
}
export interface SignUpByEmailRequest extends LoginByEmailRequest {
  referral: string
}

export interface AuthResponse {
  nextStep: string
  sessionToken: string
  refreshToken: string
  accessToken: string
}

export interface ChangeUserPasswordRequest {
  oldPassword: string
  newPassword: string
}

export type KycUserAccessTokenResponse = {
  token: string
}

export type EmailChangeRequest = {
  newEmail: string
}

export type PhoneChangeRequest = {
  newPhone: string
}

export type StepUpRequest = {
  scope: string
}

export interface StepUpAuthResponse extends AuthResponse {
  oneTimeAccessToken: string
}

export type StepUpBlockExpirationResponse = {
  expiresAt: string
}

export interface UserInfoResponse {
  email: string
  phone: string
  referralCode: string
  appliedReferralCode: string
}

const emailSignUp = (data: SignUpByEmailRequest, customHeaders?: Record<string, any>): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/email-sign-up', baseURL: API_BASE_AUTH_URL, data, customHeaders })

const emailLogin = (data: LoginByEmailRequest, customHeaders?: Record<string, any>): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/email-login', baseURL: API_BASE_AUTH_URL, data, customHeaders })

const newTokensPair = (token: string): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/refresh', baseURL: API_BASE_AUTH_URL, token })

const mfaSetup = (): Promise<AuthResponse> => request({ url: '/public/auth/v4/mfa-setup', baseURL: API_BASE_AUTH_URL })

const deleteMfa = (): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/delete-mfa', baseURL: API_BASE_AUTH_URL })

const addPhone = (data: AddPhoneRequest, token?: string): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/phone', baseURL: API_BASE_AUTH_URL, data, token })

const resendPhoneCode = (): Promise<unknown> =>
  request({ url: '/public/auth/v4/phone-code-resend', baseURL: API_BASE_AUTH_URL })

const resetPassword = (data: { email: string }): Promise<void> =>
  request({ url: '/public/auth/v4/reset-password', baseURL: API_BASE_AUTH_URL, data })

const changePassword = (data: ChangeUserPasswordRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/change-password', baseURL: API_BASE_AUTH_URL, data })

const getSumSubToken = (level = kycLevel()): Promise<KycUserAccessTokenResponse> =>
  request({ url: `/public/v3/kyc/accessToken?level=${level || 'basic-kyc-level'}`, method: 'GET' })

const changeEmail = (data: EmailChangeRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/change-email', baseURL: API_BASE_AUTH_URL, data })

const changePhone = (data: PhoneChangeRequest): Promise<AuthResponse> =>
  request({ url: '/public/auth/v4/change-phone', baseURL: API_BASE_AUTH_URL, data })

const stepUp = (data: StepUpRequest): Promise<AuthResponse | MFAAddAuthResponse | StepUpAuthResponse> =>
  request({ url: '/public/auth/v4/step-up', baseURL: API_BASE_AUTH_URL, data })

const getStepUpBlockExpiration = (): Promise<StepUpBlockExpirationResponse> =>
  request({ url: '/public/auth/v4/step-up-block-expiration', baseURL: API_BASE_AUTH_URL, method: 'GET' })

const logOut = (): Promise<void> => request({ url: '/public/auth/v4/logout', baseURL: API_BASE_AUTH_URL })

const globalLogOut = (): Promise<void> => request({ url: '/public/auth/v4/global-logout', baseURL: API_BASE_AUTH_URL })

const deleteAccount = (): Promise<void> =>
  request({ url: '/public/auth/v4/delete-account', baseURL: API_BASE_AUTH_URL })

const userInfo = (): Promise<UserInfoResponse> =>
  request({ url: '/public/auth/v4/user-info', baseURL: API_BASE_AUTH_URL, method: 'GET' })

export const AuthServiceV4 = {
  emailSignUp,
  emailLogin,
  newTokensPair,
  mfaSetup,
  deleteMfa,
  addPhone,
  resendPhoneCode,
  resetPassword,
  changePassword,
  getSumSubToken,
  changeEmail,
  changePhone,
  stepUp,
  getStepUpBlockExpiration,
  logOut,
  globalLogOut,
  deleteAccount,
  userInfo,
}
