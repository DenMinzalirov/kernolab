import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import snsWebSdk from '@sumsub/websdk'

import { pages } from 'constant'
import backArrow from 'assets/icons/back-arrow.svg'

import { getToken, parseJwt, saveRefreshToken, saveToken } from '../../../utils'
import { handleError } from '../../../utils/error-handler'
import { getRefreshToken } from '../../../utils/local-storage'
import { AuthServiceV4 } from '../../../wip/services'
import loaderIcon from '../../features/trading-investments/system-uicons_loader.svg'
import { AuthLayoutXanova } from '../auth-layout'
import styles from '../styles.module.scss'

export function KYCXanova() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState<boolean>(false)
  const [hideBtn, setHideBtn] = useState(false)
  const [isWait, setIsWait] = useState(false)

  const getNewAccessToken = async (): Promise<string> => {
    console.log('getNewAccessToken')
    try {
      const tokenResponse = await AuthServiceV4.getSumSubToken()
      return tokenResponse.token
    } catch (error) {
      console.log('ERROR-getNewAccessToken', error)
      handleError(error)
    }
    return ''
  }

  const launchWebSdk = (accessToken: string): void => {
    const snsWebSdkInstance = snsWebSdk
      .init(accessToken, () => getNewAccessToken())
      .withConf({
        lang: 'en',
      })
      .withOptions({ addViewportTag: false, adaptIframeHeight: true })
      .on('idCheck.onApplicantStatusChanged', payload => {
        console.log('payload', payload)
        // @ts-ignore
        if (payload?.reviewStatus === 'completed' && payload?.reviewResult?.reviewAnswer !== 'RED') {
          // const rToken = getRefreshToken() || ''
          // if (rToken) {
          //   AuthServiceV4.newTokensPair(rToken).then(response => {
          //     saveRefreshToken(response.refreshToken)
          //     saveToken(response.accessToken)
          //     navigate(pages.MEMBERSHIP.path)
          //   })
          // }
          setIsWait(true)
        }
      })
      .build()

    snsWebSdkInstance.launch('#sumsub-websdk-container')
  }

  const onSubmit = async (): Promise<void> => {
    setLoading(true)

    try {
      const result = await AuthServiceV4.getSumSubToken()
      setHideBtn(true)
      launchWebSdk(result.token)
    } catch (error) {
      console.log('ERROR-KYCScreen', error)
      handleError(error)
    }

    setLoading(false)
  }

  useEffect(() => {
    const token = getToken()
    if (!token) navigate(pages.SignIn.path)
    const parsedToken = parseJwt(token)
    const scope = parsedToken?.scope
    // user?.status === 'KYCConfirmed'
    if (scope?.includes('KYC')) navigate(pages.PORTFOLIO.path)
    setHideBtn(false)
    onSubmit()
  }, [location.pathname])

  useEffect(() => {
    const checkTokenStatus = async () => {
      const rToken = getRefreshToken() || ''
      if (rToken) {
        try {
          const response = await AuthServiceV4.newTokensPair(rToken)
          const parsedToken = parseJwt(response.accessToken)
          const { scope } = parsedToken || {}
          if (scope && scope.includes('KYC')) {
            saveRefreshToken(response.refreshToken)
            saveToken(response.accessToken)

            navigate(pages.MEMBERSHIP.path)
          }
        } catch (error) {
          console.error('ERROR-checkTokenStatus', error)
        }
      }
    }

    if (isWait) {
      const intervalId = setInterval(() => {
        checkTokenStatus()
      }, 10000)

      // Очистка при размонтировании
      return () => {
        clearInterval(intervalId)
      }
    }
  }, [isWait])

  const handleBack = () => {
    navigate(pages.SignIn.path)
  }

  return (
    <AuthLayoutXanova>
      <div className={styles.kycContainer} style={isWait ? { height: 'auto' } : undefined}>
        {isWait ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              width: '100%',
              height: '100%',
              minHeight: '100%',
              flex: 1,
            }}
          >
            <img src={loaderIcon} alt='Loading' className={styles.spinnerIcon} />
            <h1 className={clsx(styles.title, 'text-center')} style={{ whiteSpace: 'pre-line' }}>
              Thanks for completing{'\n'}your verification!
            </h1>
            <div className={clsx(styles.description, styles.description2)} style={{ whiteSpace: 'pre-line' }}>
              We&#39;re now reviewing your details.{'\n'}You&#39;ll be notified as soon as you&#39;re approved and ready
              to start using the app.
            </div>
          </div>
        ) : (
          <>
            <button onClick={handleBack} className='btn-with-icon-xanova back'>
              <img alt={'Back'} src={backArrow} />
              Back
            </button>

            <div className={styles.kycContent}>
              <h1 className={clsx(styles.title, 'text-center')}>KYC</h1>
              <p className={styles.description}>Please complete your KYC to continue</p>
            </div>
            <div className={styles.sumsub} id='sumsub-websdk-container' />
          </>
        )}
      </div>
    </AuthLayoutXanova>
  )
}
