import React from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { ErrorRedBlock, Modal } from 'components'
import { CardOrderInfoModal } from 'features/modals'
import { CardService } from 'wip/services'
import { HELP_LINKS } from 'config'
import { $cardStatus, getCardStatusFx } from 'model/cefi-banking'

import card from './card-hodl.svg'
import styles from './styles.module.scss'

type Props = {
  isSubmitted: boolean
  requestError: string
  setIsStartPage: React.Dispatch<React.SetStateAction<boolean>>
  isBlocked?: boolean
  isCountryBlock?: string
}

export function StartPage({ isSubmitted, requestError, setIsStartPage, isBlocked, isCountryBlock }: Props) {
  const cardStatus = useUnit($cardStatus)

  return (
    <div className={styles.cardStartPageWrap}>
      <img className={styles.cardImgStartPage} src={card} alt='' />
      <div className={styles.freeHistory}>
        {isBlocked ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, alignItems: 'center' }}>
            <div style={{ maxWidth: 360 }} className={styles.stepLabel}>
              Regrettably, our service is currently unavailable in your region. Rest assured, we’ll keep you posted once
              it becomes accessible! If you believe this is a mistake,
              <br />
              please contact support for further assistance.
            </div>
            <button
              style={{ maxWidth: 350 }}
              onClick={e => {
                window.open(HELP_LINKS.FAQ)
              }}
              className={clsx('btn-new', 'red', 'big', styles.orderBtn)}
            >
              Contact Support
            </button>
          </div>
        ) : isSubmitted ? (
          'Success!'
        ) : (
          'Seamless Crypto Spending Starts Here'
        )}
      </div>

      {isBlocked ? null : (
        <div className={styles.freeHistoryDescription}>
          {isSubmitted
            ? // eslint-disable-next-line max-len
              'Your Pairs Virtual HODL Card order has been submitted. You will receive an email confirmation once yourcard has been issued.'
            : // eslint-disable-next-line max-len
              'Unleash the power of borderless banking with the Pairs HODL card. Spend your crypto easily and securely all around the world.'}
        </div>
      )}

      <div style={{ height: 20 }} />

      {isSubmitted || isBlocked ? null : (
        <button
          onClick={e => {
            e.preventDefault()
            Modal.open(
              <CardOrderInfoModal
                goNext={async () => {
                  if (cardStatus?.additionalInfo?.kyc === 'OK') {
                    try {
                      await CardService.setOrderCardKYC()
                      await getCardStatusFx()
                    } catch (error: any) {
                      console.log('submitOrderStatus-KYC-error', error)
                    }
                  }
                  setIsStartPage(false)
                  Modal.close()
                }}
              />,
              {
                variant: 'center',
              }
            )
          }}
          className={clsx('btn-new', 'primary', 'big', styles.orderBtn)}
          disabled={true}
        >
          <div>Order My Card</div>
        </button>
      )}
      {requestError ? <ErrorRedBlock requestError={requestError} /> : null}
    </div>
  )
}
