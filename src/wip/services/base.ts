import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, Method } from 'axios'

import { clearRefreshToken, clearToken, getToken, parseJwt } from 'utils'
import { handleError } from 'utils/error-handler'
import { getRefreshToken, saveRefreshToken, saveToken } from 'utils/local-storage'
import { API_BASE_AUTH_URL, API_BASE_URL } from 'config'

import packageJson from '../../../package.json'
import { Modal } from '../../components'
import { pages } from '../../constant'
import { mainLoaderChangedEv } from '../../model/mainLoader'
import { globalNavigate } from '../../router/global-history'
import Resolvable from 'resolvable-promise'

interface IRequest {
  method?: Method
  url: string
  data?: any
  contentType?: string
  baseURL?: string
  token?: string
  customHeaders?: Record<string, string> | null
}

interface RequestError {
  status: number
  message: string
  data: any
  code: string
  codeMessage: string
}

const noTokensUrl = [
  '/public/auth/v4/email-login',
  '/public/auth/v4/email-sign-up',
  '/public/auth/v4/phone-login',
  '/public/auth/v4/phone-sign-up',
  '/public/auth/v4/reset-password',
  // '/public/v4/assets/info',
  // '/public/v4/assets/coin-gecko-rates-raw',
  '/public/v4/launchpads?page=0&size=2000',
]

const dynamicNoTokenRegex = /^\/public\/v4\/launchpads\/[a-f0-9-]{36}$/

interface IAuthTokens {
  accessToken: Token
  refreshToken: Token
}
type Token = string
type TokenRefreshRequest = (refreshToken: Token) => Promise<IAuthTokens>

let currentlyRequestingPromise: Resolvable<Token | undefined> | Promise<Token | undefined> | undefined = undefined

function setGlobalVariable(
  newValue: Resolvable<Token | undefined> | Promise<Token | undefined> | undefined,
  url?: string
) {
  currentlyRequestingPromise = newValue
  // console.log(`Global variable changed to: `, url, currentlyRequestingPromise)
}

const getTokenStore = () => {
  return getToken() || ''
}

const logoutOnRefreshError = () => {
  clearToken()
  clearRefreshToken()
  Modal.close()
  mainLoaderChangedEv(false)
  globalNavigate(pages.SignIn.path)
}

// Глобальные переменные для счётчика и времени (403 logout)
let forbiddenErrorCount = 0
let forbiddenErrorStartTime: number | null = null

// Интервал для сброса счётчика каждые 60 секунд
setInterval(() => {
  if (forbiddenErrorCount > 0) {
    forbiddenErrorCount = 0
    forbiddenErrorStartTime = null
  }
}, 120000)

export const checkTokenExpiration = (token: string): boolean => {
  const tokenPayload: { exp: number } | null = parseJwt(token)

  if (!tokenPayload) {
    return false
  }

  const currentTimeInSeconds = Math.floor(Date.now() / 1000)
  const timeUntilExpirationInSeconds = tokenPayload.exp - currentTimeInSeconds

  return timeUntilExpirationInSeconds <= 120 // 2 min
}

const getUserAgentInfo = () => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  return {
    os: platform, // Информация об операционной системе
    browser: userAgent, // Информация о браузере
    version: packageJson?.version || '',
  }
}

const errorHandler = (axiosError: AxiosError): RequestError => {
  const error: RequestError = {
    status: 0,
    message: '',
    data: null,
    code: '',
    codeMessage: '',
  }

  if (axiosError.response) {
    error.data = axiosError.response.data || null
    error.status = axiosError.response.status
    const code = error.data?.code || ''

    if (code) {
      error.code = code
    }

    error.message = error.data?.code || ''

    if (error.status === 500) {
      let changedMessage = error.code
      if (error.code === 'UNKNOWN') {
        changedMessage = 'Please try again, or contact our support team if the issue persists. '
      }
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        changedMessage = "We're experiencing technical difficulties. Please try again later or contact support. "
      }

      error.code = changedMessage + '\n\nIssue code:\n' + (axiosError?.response?.headers['x-trace-id'] || '')
    }

    if (error.status === 403) {
      logoutOnRefreshError()
      // forbiddenErrorCount += 1
      //
      // // Устанавливаем время первого срабатывания, если оно ещё не установлено
      // if (forbiddenErrorStartTime === null) {
      //   forbiddenErrorStartTime = Date.now()
      // }
      // // Проверка: если счётчик достиг 12, выполняем logout
      // if (forbiddenErrorCount >= 5) {
      //   logoutOnRefreshError()
      // }
    }

    if (error.status === 401) {
      logoutOnRefreshError()
      // forbiddenErrorCount += 1
      //
      // // Устанавливаем время первого срабатывания, если оно ещё не установлено
      // if (forbiddenErrorStartTime === null) {
      //   forbiddenErrorStartTime = Date.now()
      // }
      // // Проверка: если счётчик достиг 12, выполняем logout
      // if (forbiddenErrorCount >= 5) {
      //   logoutOnRefreshError()
      // }
    }

    if (error.code === 'JWT_NOT_FOUND') {
      logoutOnRefreshError()
    }

    if (error.code === 'TOO_MANY_VERIFY_MFA_STATUS_ATTEMPTS') {
      handleError(error)
    }
  } else {
    error.status = 600
  }
  return error
}

const axiosInstancePublicApi = axios.create()
const axiosInstanceAuthApi = axios.create()

function containsStep(config: AuthInternalAxiosRequestConfig) {
  if (/.*\/public\/auth\/v4\/(user-info|step-up-block-expiration)/i.test(config?.url || '')) {
    return false
  }

  if (config.sessionToken) {
    return true
  }

  return /.*\/public\/auth\/v4\/.*/i.test(config?.url || '')
}

const handleRequest = async function (config: AuthInternalAxiosRequestConfig) {
  const isSteps = containsStep(config)
  const axiosInstance = isSteps ? axiosInstanceAuthApi : axiosInstancePublicApi

  try {
    const response = await axiosInstance(config)
    return response.data
  } catch (error: any) {
    throw errorHandler(error)
  }
}

export const request = async <T>({
  method = 'POST',
  url = '',
  data = null,
  contentType = 'application/json',
  baseURL = API_BASE_URL,
  token = '',
  customHeaders = null,
}: IRequest): Promise<T> => {
  const deviceInfo = getUserAgentInfo()

  const options: AuthInternalAxiosRequestConfig = {
    method,
    baseURL,
    url,
    timeout: 20000,
    sessionToken: token,
    // @ts-ignore
    headers: {
      'content-type': contentType,
      'X-DEVICE-OPERATION_SYSTEM': deviceInfo.os,
      'X-DEVICE-BROWSER': deviceInfo.browser,
      'X-VERSION': deviceInfo.version,
    },
  }
  // @ts-ignore
  if (customHeaders) options.headers = { ...options.headers, ...customHeaders }

  if (data && method === 'GET') {
    options.params = data
  } else if (data) {
    options.data = data
  }

  return await handleRequest(options)
}

const refreshTokenPromise = async (requestRefresh: TokenRefreshRequest): Promise<Token> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    logoutOnRefreshError()
    throw new Error(`'No refresh token available'`)
  }

  try {
    // Refresh and store access token using the supplied refresh function
    const newTokens = await requestRefresh(refreshToken)
    saveRefreshToken(newTokens.refreshToken)
    saveToken(newTokens.accessToken)

    return newTokens.accessToken
  } catch (error) {
    // Failed to refresh token
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401 || status === 422) {
        // The refresh token is invalid so remove the stored tokens
        // logoutOnRefreshError()
        throw new Error(`Got ${status} on token refresh; clearing both auth tokens`)
      }
    }

    logoutOnRefreshError()

    // A different error, probably network error
    console.log('error-refreshToken', error)
    if (error instanceof Error) {
      throw new Error(`Failed to refresh auth token: ${error.message}`)
    } else {
      throw new Error('Failed to refresh auth token and failed to parse error')
    }
  }
}

const refreshTokenIfNeeded = async (requestRefresh: TokenRefreshRequest): Promise<Token | undefined> => {
  // use access token (if we have it)
  let accessToken = getTokenStore()

  // check if access token is expired
  if (!accessToken || checkTokenExpiration(accessToken)) {
    // do refresh
    accessToken = await refreshTokenPromise(requestRefresh)
  }
  return accessToken
}

const requestRefresh = (refresh: string): Promise<IAuthTokens> => {
  const deviceInfo = getUserAgentInfo()

  const options: AxiosRequestConfig = {
    timeout: 20000,
    headers: {
      'content-type': 'application/json',
      'X-DEVICE-OPERATION_SYSTEM': deviceInfo.os,
      'X-DEVICE-BROWSER': deviceInfo.browser,
      'X-VERSION': deviceInfo.version,
      Authorization: `Bearer ${refresh}`,
    },
  }
  // Notice that this is the global axios instance, not the axiosInstance!  <-- important
  return axios.post(`${API_BASE_AUTH_URL}/public/auth/v4/refresh`, { refresh }, options).then(response => {
    return response.data
  })
}

axiosInstancePublicApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig<any>) => {
    try {
      if (noTokensUrl.includes(config?.url || '') || dynamicNoTokenRegex.test(config?.url || '')) {
        return config
      }

      if ([API_BASE_URL, API_BASE_AUTH_URL].includes(config?.baseURL || '')) {
        let accessToken = undefined

        if (currentlyRequestingPromise) accessToken = await currentlyRequestingPromise

        if (!accessToken) {
          try {
            // Sets the promise so everyone else will wait - then get the value
            // currentlyRequestingPromise = refreshTokenIfNeeded(requestRefresh)
            setGlobalVariable(refreshTokenIfNeeded(requestRefresh), config?.url)
            accessToken = await currentlyRequestingPromise

            // Reset the promise
            // currentlyRequestingPromise = undefined
            setGlobalVariable(undefined, config?.url)
          } catch (error: unknown) {
            // Reset the promise
            // currentlyRequestingPromise = undefined
            setGlobalVariable(undefined, config?.url)

            if (error instanceof Error) {
              throw new Error(`Unable to refresh access token for request due to token refresh error: ${error.message}`)
            }
          }
        }

        if (accessToken && config.headers) {
          config.headers['Authorization'] = `${'Bearer '}${accessToken}`
        }
      }

      return config
    } catch (error) {
      console.log('ERROR-interceptors', error)
      return Promise.reject(error)
    }
  },
  error => {
    console.log('interceptors-ERROR', error)
    return Promise.reject(error)
  }
)

interface AuthInternalAxiosRequestConfig<D = any> extends InternalAxiosRequestConfig<D> {
  sessionToken?: string
}

axiosInstanceAuthApi.interceptors.request.use(
  async (config: AuthInternalAxiosRequestConfig<any>) => {
    try {
      if (noTokensUrl.includes(config?.url || '') || dynamicNoTokenRegex.test(config?.url || '')) {
        return config
      }

      if ([API_BASE_URL, API_BASE_AUTH_URL].includes(config?.baseURL || '')) {
        // @ts-ignore
        let accessOrSessionToken = config.sessionToken || undefined

        if (accessOrSessionToken) {
          config.headers['Authorization'] = `${'Bearer '}${accessOrSessionToken}`
          // currentlyRequestingPromise = Resolvable()
          setGlobalVariable(Resolvable(), config?.url)
          return config
        }

        if (currentlyRequestingPromise) accessOrSessionToken = await currentlyRequestingPromise

        if (!accessOrSessionToken) {
          try {
            // Sets the promise so everyone else will wait - then get the value
            // currentlyRequestingPromise = refreshTokenIfNeeded(requestRefresh)
            setGlobalVariable(refreshTokenIfNeeded(requestRefresh), config?.url)
            accessOrSessionToken = await currentlyRequestingPromise

            // Reset the promise
            // currentlyRequestingPromise = undefined
            setGlobalVariable(undefined, config?.url)
          } catch (error: unknown) {
            // Reset the promise
            // currentlyRequestingPromise = undefined
            setGlobalVariable(undefined, config?.url)

            if (error instanceof Error) {
              throw new Error(`Unable to refresh access token for request due to token refresh error: ${error.message}`)
            }
          }
        }
        // console.log('axiosInstancePublicApi -33', currentlyRequestingPromise, config)
        // currentlyRequestingPromise = Resolvable()

        if (accessOrSessionToken && config.headers) {
          config.headers['Authorization'] = `${'Bearer '}${accessOrSessionToken}`
        }
      }

      return config
    } catch (error) {
      console.log('ERROR-interceptors', error)
      if (currentlyRequestingPromise instanceof Promise) {
        // @ts-ignore
        currentlyRequestingPromise.resolve(undefined)
      }
      // currentlyRequestingPromise = undefined
      setGlobalVariable(undefined, config?.url)

      return Promise.reject(error)
    }
  },
  error => {
    console.log('interceptors-ERROR', error)
    return Promise.reject(error)
  }
)

axiosInstanceAuthApi.interceptors.response.use(
  async response => {
    try {
      if (response.data.nextStep === null) {
        saveToken(response.data.accessToken)
        saveRefreshToken(response.data.refreshToken)

        if (currentlyRequestingPromise instanceof Promise) {
          // @ts-ignore
          currentlyRequestingPromise.resolve(response.data.accessToken)
        }
        // currentlyRequestingPromise = undefined
        setGlobalVariable(undefined, 'response')
      } else {
        if (currentlyRequestingPromise instanceof Promise && response.config.headers.Authorization instanceof String) {
          // @ts-ignore
          currentlyRequestingPromise.resolve(response?.config?.headers?.Authorization.split(' ')[1])
        }
        setGlobalVariable(undefined, 'response')

        // currentlyRequestingPromise = undefined
      }
    } catch (error) {
      console.log('ERROR-catch-axiosInstanceAuthApi.interceptors.response', error)
      if (currentlyRequestingPromise instanceof Promise && response.config.headers.Authorization instanceof String) {
        // @ts-ignore
        currentlyRequestingPromise.resolve(response.config?.headers?.Authorization?.split(' ')[1])
      }
      // currentlyRequestingPromise = undefined
      setGlobalVariable(undefined, 'response')

      console.log('interceptors-response', error)
    }

    return response
  },
  error => {
    console.log('AUTH-ERROR-interceptors-response-ERROR', error)
    if (currentlyRequestingPromise instanceof Promise) {
      // @ts-ignore
      currentlyRequestingPromise.resolve(undefined)
    }
    // currentlyRequestingPromise = undefined
    setGlobalVariable(undefined, 'response')

    return Promise.reject(error)
  }
)
