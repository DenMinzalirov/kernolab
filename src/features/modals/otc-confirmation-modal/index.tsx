import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { isBiz } from 'config'
import { $otcIsLoading } from 'model/otc'
import successfullyBizIcon from 'assets/icons/successfully-biz.svg'

import styles from './styles.module.scss'

export const OTC_CONFIRMATION_MODAL_OPTIONS: Record<string, Options> = {
  cancelTrade: {
    title: 'Want to cancel this\u00A0trade?',
    subTitle: 'By confirming, this trade will be canceled, and your funds will\u00A0remain\u00A0in\u00A0your account.',
    btnText: 'Cancel Trade',
    isCloseBtn: false,
    isSuccessModal: false,
  },
  tradeCancelled: {
    title: 'OTC Trade Cancelled',
    subTitle: 'This trade is canceled, and your funds remain in\u00A0your account.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
  },
  acceptOffer: {
    title: 'Want to accept this\u00A0offer?',
    subTitle: 'Funds will be deducted immediately after\u00A0confirmation.',
    btnText: 'Accept Offer',
    isCloseBtn: true,
    isSuccessModal: false,
  },
  rejectOffer: {
    title: 'Want to reject this\u00A0offer?',
    subTitle: 'Funds will be released to your wallet immediately upon confirmation, with fees still deducted.',
    btnText: 'Reject Offer',
    isCloseBtn: true,
    isSuccessModal: false,
  },
  offerAccepted: {
    title: 'Success!',
    subTitle: 'The accepted offer funds will reach your wallet soon.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
  },
  offerRejected: {
    title: 'OTC Offer Rejected',
    subTitle: 'The funds released in your wallet with fees deducted.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
  },
}

type Options = {
  title: string
  subTitle: string
  btnText: string
  isSuccessModal: boolean
  isCloseBtn: boolean
}

type Props = {
  options: Options
  action: () => void
}

export const OtcConfirmationModal = ({ options, action }: Props) => {
  const isLoading = useUnit($otcIsLoading)
  const { btnText, isCloseBtn, subTitle, title, isSuccessModal } = options

  const handleClose = () => {
    Modal.close()
  }

  if (isBiz) {
    return (
      <div className={clsx(styles.container, isCloseBtn ? styles.containerFix : '')}>
        {isSuccessModal ? (
          <img src={successfullyBizIcon} alt='' style={{ width: 71, height: 71, margin: '0 auto' }} />
        ) : null}

        <div className={clsx(styles.textWrap)}>
          <div className={clsx(styles.titleBiz, { [styles.successTitlFix]: isSuccessModal })}>{title}</div>
          <div className={clsx(styles.subTitleBiz, { [styles.successSubTitlFix]: isSuccessModal })}>{subTitle}</div>
        </div>

        {!isSuccessModal ? (
          <div className={styles.buttons}>
            <button onClick={action} className='btn-biz blue'>
              {isLoading ? <span className='spinner-border' /> : btnText}
            </button>

            {isCloseBtn ? (
              <button onClick={handleClose} className='btn-biz transparent'>
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={clsx(styles.container, isCloseBtn ? styles.containerFix : '')}>
      <div className={styles.textWrap}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subTitle}>{subTitle}</div>
      </div>

      <div className={styles.buttons}>
        <button onClick={action} className={clsx('btn', 'btn-primary', styles.button)}>
          {isLoading ? <span className='spinner-border' /> : btnText}
        </button>

        {isCloseBtn ? (
          <button onClick={handleClose} className={clsx('btn', 'btn-transparent', styles.button)}>
            Close
          </button>
        ) : null}
      </div>
    </div>
  )
}
