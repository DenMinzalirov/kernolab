import React, { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { $cardStatus, $selectedCardUuid } from 'model/cefi-banking'

import OrderCardBg from './order_card_bg.png'
import { StartPage } from './start-page'
import { StepAddress } from './step-address'
import { StepContainer } from './step-container'
import { StepDeposit } from './step-deposit'
import StepKYC from './step-KYC'
import { StepPhone } from './step-phone'
import { StepResidency } from './step-residency'
import { StepTerms } from './step-terms'
import styles from './styles.module.scss'

export const STEPS = {
  NONE: 'NONE',
  KYC: 'KYC',
  RESIDENCY: 'RESIDENCY',
  DEPOSIT: 'DEPOSIT',
  ADDRESS: 'ADDRESS',
  PHONE: 'PHONE',
  TERMS: 'TERMS',
  SUBMITTED: 'SUBMITTED',
  BLOCKED: 'BLOCKED',
  COUNTRY_BLOCKED: 'COUNTRY_BLOCKED',
}

type Props = {
  goToTopUp: () => void
}

export function OrderCardFlow({ goToTopUp }: Props) {
  const cardStatus = useUnit($cardStatus)
  const selectedCardUuid = useUnit($selectedCardUuid)

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isStartPage, setIsStartPage] = useState(true)
  const [requestError, setRequestError] = useState('')

  useEffect(() => {
    if (!cardStatus) {
      setRequestError('Card service is not available')
    } else {
      setRequestError('')
      setIsSubmitted(cardStatus?.currentStep === STEPS.SUBMITTED)
    }

    if (cardStatus?.currentStep !== STEPS.NONE) {
      setIsStartPage(false)
    }
  }, [cardStatus])

  if (cardStatus?.currentStep === 'PROCESSED') {
    return null
  }

  return (
    <div
      className={styles.transferWrap}
      style={{
        ...(isStartPage || isSubmitted
          ? {
              backgroundImage: `url(${OrderCardBg})`,
              backgroundSize: 'cover',
            }
          : {}),
      }}
    >
      <div className={clsx(styles.cardWrap, isSubmitted ? styles.cardWrapSubmitted : {})}>
        {isSubmitted || cardStatus?.currentStep === STEPS.BLOCKED || !selectedCardUuid ? (
          <div className={styles.cardTitleSubmitted} />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={clsx(styles.balanceTitle, styles.cardTitle)}>Card</div>
            </div>
            <div className={styles.divider} />
          </>
        )}

        {/*TODO: STEPS.COUNTRY_BLOCKED сделать блокировку*/}
        {(cardStatus?.currentStep === STEPS.NONE && isStartPage) ||
        cardStatus?.currentStep === STEPS.COUNTRY_BLOCKED ||
        cardStatus?.currentStep === STEPS.SUBMITTED ||
        cardStatus?.currentStep === STEPS.BLOCKED ? (
          <StartPage
            isSubmitted={isSubmitted}
            requestError={requestError}
            setIsStartPage={setIsStartPage}
            isBlocked={cardStatus?.currentStep === STEPS.BLOCKED || cardStatus?.currentStep === STEPS.COUNTRY_BLOCKED}
            isCountryBlock={
              'Regrettably, our service is currently unavailable in your region. Rest assured, we’ll keep you posted once it becomes accessible!'
            }
          />
        ) : null}

        {!isStartPage && !isSubmitted && cardStatus?.currentStep !== STEPS.BLOCKED ? (
          <div style={{ width: '100%' }}>
            <StepContainer />
          </div>
        ) : null}

        {!isStartPage && cardStatus?.nextStep === STEPS.DEPOSIT ? <StepDeposit goToTopUp={goToTopUp} /> : null}

        {!isStartPage && cardStatus?.nextStep === STEPS.RESIDENCY ? <StepResidency /> : null}

        {!isStartPage && cardStatus?.nextStep === STEPS.ADDRESS ? <StepAddress /> : null}

        {!isStartPage && cardStatus?.nextStep === STEPS.PHONE ? <StepPhone /> : null}

        {(!isStartPage && cardStatus?.nextStep === STEPS.TERMS) || cardStatus?.nextStep === STEPS.SUBMITTED ? (
          <StepTerms setIsSubmitted={setIsSubmitted} />
        ) : null}

        {!isStartPage && cardStatus?.nextStep === STEPS.KYC && !isStartPage ? <StepKYC /> : null}
      </div>
    </div>
  )
}
