import React, { useEffect } from 'react'
import { useUnit } from 'effector-react'
import snsWebSdk from '@sumsub/websdk'

import { AuthServiceV4, CardService } from 'wip/services'
import { $cardStatus, getCardStatusFx } from 'model/cefi-banking'

import { STEPS } from './order-card-flow'
import styles from './styles.module.scss'

const StepKYC: React.FC = () => {
  const cardStatus = useUnit($cardStatus)

  useEffect(() => {
    if (cardStatus?.additionalInfo?.kyc === 'OK') {
      CardService.setOrderCardKYC()
        .then(() => getCardStatusFx())
        .catch(err => console.log('ERROR-setOrderCardKYC', err))
    }
  }, [cardStatus.nextStep])

  const getNewAccessToken = async (): Promise<string> => {
    try {
      const tokenResponse = await AuthServiceV4.getSumSubToken('new-postcard-basic')
      return tokenResponse.token
    } catch (error: any) {
      console.log('ERROR-getNewAccessToken', error)
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
      .on('idCheck.onApplicantStatusChanged', async payload => {
        // @ts-ignore
        if (payload?.reviewStatus === 'completed' && payload?.reviewResult?.reviewAnswer !== 'RED') {
          try {
            await CardService.setOrderCardKYC()
            await getCardStatusFx()
          } catch (e) {
            console.log('submitOrderStatus-KYC-error', e)
          }
        }
      })
      .build()

    snsWebSdkInstance.launch('#sumsub-websdk-container')
  }

  useEffect(() => {
    getNewAccessToken()
      .then(tokenResponse => {
        launchWebSdk(tokenResponse)
      })
      .catch(error => console.log('ERROR-getNewAccessToken', error))
  }, [])

  return (
    <div className={styles.stepContentContainer}>
      <div className={styles.sumsub} id='sumsub-websdk-container' />
    </div>
  )
}

export default StepKYC
