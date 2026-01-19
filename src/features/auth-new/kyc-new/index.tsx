import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import snsWebSdk from '@sumsub/websdk'

import { BackButton } from 'components'
import I18n from 'components/i18n'
import { pages } from 'constant'
import { getToken, parseJwt } from 'utils'
import { handleError } from 'utils/error-handler'
import { AuthServiceV4 } from 'wip/services'

import backArrow from '../../../assets/icons/back-arrow.svg'
import fideumOnboardingLogo from '../../../assets/icons/fideumOnboardingLogo.svg'
import kernolabLogo from '../../../assets/icons/Kernolab-logo-2021-black.svg'
import { getRefreshToken, saveRefreshToken, saveToken } from '../../../utils/local-storage'
import { AuthLayout } from '../auth-layout'
import AuthTitle from '../auth-title'
import styles from '../styles.module.scss'

export function KYC() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState<boolean>(false)
  const [hideBtn, setHideBtn] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) navigate(pages.SignIn.path)
    const parsedToken = parseJwt(token)
    const scope = parsedToken?.scope
    // user?.status === 'KYCConfirmed'
    if (scope?.includes('KYC')) navigate(pages.PORTFOLIO.path)
    setHideBtn(false)
  }, [location.pathname])

  const handleBack = () => {
    navigate(pages.SignIn.path)
  }

  const getNewAccessToken = async (): Promise<string> => {
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
        // @ts-ignore
        if (payload?.reviewStatus === 'completed' && payload?.reviewResult?.reviewAnswer !== 'RED') {
          const rToken = getRefreshToken() || ''
          if (rToken) {
            AuthServiceV4.newTokensPair(rToken).then(response => {
              navigate(pages.PORTFOLIO.path)
            })
          }
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

  return (
    <AuthLayout>
      <div className={styles.rightModule}>
        <div className={styles.mobilePairsLogo}>
          <img height={100} src={kernolabLogo} alt='' />
        </div>
        {/*<BackButton backFn={() => navigate(pages.SignIn.path)} />*/}

        {!hideBtn && (
          <div className={clsx(styles.formWrap)}>
            <AuthTitle title='kyc.title' description='kyc.description' />

            <button onClick={onSubmit} className='btn-new primary big' disabled={loading}>
              {loading ? <span className='spinner-border' /> : <I18n tKey='kyc.identity' />}
            </button>

            <div style={{ height: 24 }} />

            <button onClick={handleBack} className='btn-new transparent big'>
              <img alt={''} src={backArrow} style={{ marginRight: 12 }} />
              Go Back to Sign In
            </button>
          </div>
        )}

        <div className={styles.sumsub} id='sumsub-websdk-container' />
      </div>
    </AuthLayout>
  )
}
