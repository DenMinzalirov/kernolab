import { NavLink } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { $cardStatus } from 'model/cefi-banking'

import { HELP_LINKS } from '../../../config'
import styles from './styles.module.scss'

export interface CardOrderInfoModal {
  goNext: () => void
}

export function CardOrderInfoModal({ goNext }: CardOrderInfoModal) {
  const cardStatus = useUnit($cardStatus)

  const isFail = cardStatus.additionalInfo?.kyc === 'FAILED'

  return (
    <div className={styles.container}>
      <div className={styles.title}>{isFail ? 'Ooops!' : 'Fuel Up Your HODL Card'}</div>
      <div style={{ height: 12 }} />
      <div className={styles.description}>
        {isFail
          ? 'There seem to be issues in confirming your identity; kindly reach out to customer support for assistance.\n'
          : "To kickstart your application, let's start by depositing 50 EUR into your card balance. Think of it as\n" +
            " priming the pump – it’s not a fee, but funds you'll be able to spend as soon as you receive the card."}
      </div>

      {!isFail && (
        <>
          <div style={{ height: 12 }} />
          <div className={styles.description}>
            The deposit will be drawn from your available fiat balance, so no extra steps needed.
          </div>
          <div style={{ height: 12 }} />
          <div className={styles.description} style={{ alignSelf: 'start' }}>
            By continuing you agree to the{' '}
            <NavLink to={HELP_LINKS.CARD_TERMS} target='_blank' className={styles.descriptionLink}>
              Payment Card Terms and Conditions.
            </NavLink>
          </div>
          <div style={{ height: 81 }} />
        </>
      )}

      <div className={styles.btnContainer}>
        <button onClick={() => Modal.close()} className={clsx('btn-new', 'grey', 'big')}>
          Cancel
        </button>

        {!isFail && (
          <button onClick={goNext} className={clsx('btn-new', 'primary', 'big')}>
            Continue
          </button>
        )}
      </div>
    </div>
  )
}
