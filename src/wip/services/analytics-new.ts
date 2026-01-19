import { useUnit } from 'effector-react'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'

import { env } from 'constant'

import { $userInfo } from '../../model/user-info'

const firebaseConfig = {
  apiKey: 'AIzaSyCdu43JwbMemQbIR5la-0ObdSj9ZpdhrOI',
  authDomain: 'blockbank-v2.firebaseapp.com',
  projectId: 'blockbank-v2',
  storageBucket: 'blockbank-v2.appspot.com',
  messagingSenderId: '106559087813',
  appId: '1:106559087813:web:44ca51bf403ad95c2b3cac',
  measurementId: 'G-PQ74RTL12L',
}

export enum EVENT_NAMES {
  // mob app events
  LOGIN_FAIL = 'LOGIN_FAIL',
  SCREEN_CHANGE = 'SCREEN_CHANGE',
  STAKING_FOCUSED = 'STAKING_FOCUSED',
  REVOLVER_BUTTON_PRESSED = 'REVOLVER_BUTTON_PRESSED',
  CEFI_REGISTRATION = 'CEFI_REGISTRATION',
  KYC_INIT = 'KYC_INIT',
  CEFI_WITHDRAWAL = 'CEFI_WITHDRAWAL',
  CEFI_BOUGHT_BBANK = 'CEFI_BOUGHT_BBANK',
  // web events
  WEB_SIGN_IN_FOCUSED = 'WEB_SIGN_IN_FOCUSED',
  WEB_LOGIN_SUCCESS = 'WEB_LOGIN_SUCCESS',
  WEB_SIGN_UP_SUCCESS = 'WEB_SIGN_UP_SUCCESS',
  WEB_EARN_PAGE_OPENED = 'WEB_EARN_PAGE_OPENED',
  WEB_PORTFOLIO_OPENED = 'WEB_PORTFOLIO_OPENED',
  WEB_BANKING_OPENED = 'WEB_BANKING_OPENED',
  WEB_DEPOSIT = 'WEB_DEPOSIT',
  WEB_WITHDRAW_OPENED = 'WEB_WITHDRAW_OPENED',
  WEB_CEFI_WITHDRAWAL = 'WEB_CEFI_WITHDRAWAL',
  WEB_TRADE_OPENED = 'WEB_TRADE_OPENED',
  WEB_EARN_BBANK = 'WEB_EARN_BBANK',
  WEB_EARN_XRP = 'WEB_EARN_XRP',
  WEB_EXCHANGE = 'WEB_EXCHANGE',
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

export const useAnalytics = (): { myLogEvent: (notif: string, params?: Record<string, unknown>) => void } => {
  const userInfo = useUnit($userInfo)

  const myLogEvent = (eventName: string, params?: Record<string, unknown>): void => {
    if (env.NODE_ENV === 'development') return
    logEvent(analytics, eventName, {
      USER: userInfo?.email || 'Not authenticated',
      ...params,
    })
  }

  return {
    myLogEvent,
  }
}
