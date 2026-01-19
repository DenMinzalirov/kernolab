import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { $confirmModalIsLoading } from 'model/confirm-modal-is-loading'
import successfullyBizIcon from 'assets/icons/successfully-biz.svg'

import styles from './styles.module.scss'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

export const CONFIRMATION_MODAL_OPTIONS: Record<string, Options> = {
  //OTC
  cancelTrade: {
    title: 'Want to cancel this\u00A0trade?',
    subTitle: 'By confirming, this trade will be canceled, and your funds will\u00A0remain\u00A0in\u00A0your account.',
    btnText: 'Cancel Trade',
    isCloseBtn: false,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },
  tradeCancelled: {
    title: 'OTC Trade Cancelled',
    subTitle: 'This trade is canceled, and your funds remain in\u00A0your account.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
    btnStyleType: 'blue',
  },
  acceptOffer: {
    title: 'Want to accept this\u00A0offer?',
    subTitle: 'Funds will be deducted immediately after\u00A0confirmation.',
    btnText: 'Accept Offer',
    isCloseBtn: true,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },
  rejectOffer: {
    title: 'Want to reject this\u00A0offer?',
    subTitle: 'Funds will be released to your wallet immediately upon confirmation, with fees still deducted.',
    btnText: 'Reject Offer',
    isCloseBtn: true,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },
  offerAccepted: {
    title: 'Success!',
    subTitle: 'The accepted offer funds will reach your wallet soon.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
    btnStyleType: 'blue',
  },
  offerRejected: {
    title: 'OTC Offer Rejected',
    subTitle: 'The funds released in your wallet with fees deducted.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
    btnStyleType: 'blue',
  },
  //Whitlist
  deleteWhitelist: {
    title: 'Delete Address?',
    subTitle:
      // eslint-disable-next-line max-len
      'Are you sure you want to delete this address?  The data will\u00A0be\u00A0permanently removed. However, you will always be able to add a\u00A0trusted address again in\u00A0the\u00A0future.',
    btnText: 'Delete Anyway',
    isCloseBtn: false,
    isSuccessModal: false,
    btnStyleType: 'red',
  },
  deleteWhitelistSuccess: {
    title: 'Address Deleted Successfully',
    subTitle:
      // eslint-disable-next-line max-len
      'This means that the contact is no longer part of the whitelist, and any special permissions or exemptions they had have been removed.',
    btnText: 'Close',
    isCloseBtn: false,
    isSuccessModal: true,
    btnStyleType: 'blue',
    titleMd: 'Address Deleted',
  },
  //2FA Prompt
  enable2FAPrompt: {
    title: 'Two Factor Authentication',
    subTitle: 'For security reasons, a 2FA setup is required. Please follow the\u00A0instructions. ',
    btnText: 'Enable 2FA',
    isCloseBtn: false,
    isSuccessModal: false,
    btnStyleType: 'red',
  },
  //2FA  OFF Success
  success2FAOff: {
    title: '2FA Turned Off',
    subTitle: 'Your account is now secured with your password only.',
    btnText: 'Return to Settings',
    isCloseBtn: false,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },

  //Fideum OTC
  cancelTradeFideumOTC: {
    title: 'Are you sure?',
    subTitle: 'This action will cancel this trade request.',
    btnText: 'Cancel Trade',
    isCloseBtn: true,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },

  updateTradeLockFideumOTC: {
    title: 'Are you sure?',
    subTitle: 'After this action you will be no more able to update this trade request.',
    btnText: 'Confirm',
    isCloseBtn: true,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },

  updateClientFideumOTC: {
    title: 'Update client?',
    subTitle: 'After this action the client for this trade request will be changed.',
    btnText: 'Update',
    isCloseBtn: true,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },
  updateClientPriceFideumOTC: {
    title: 'Update trade?',
    subTitle: 'After this action this trade request will be changed.',
    btnText: 'Update',
    isCloseBtn: true,
    isSuccessModal: false,
    btnStyleType: 'blue',
  },
}

type Options = {
  title: string
  subTitle: string
  btnText: string
  isSuccessModal: boolean
  isCloseBtn: boolean
  btnStyleType: string //from btn-biz (blue; grey; white; red; transparent)
  titleMd?: string
  subTitleMd?: string
  secondBtnText?: string
}

type Props = {
  options: Options
  action: () => void
  onCancel?: () => void
}

export const ConfirmationModalBiz = ({ options, action, onCancel }: Props) => {
  const isLoading = useUnit($confirmModalIsLoading)

  const { isMobileBiz } = useCurrentBreakpoint()

  const { btnText, isCloseBtn, subTitle, title, isSuccessModal, btnStyleType, secondBtnText, titleMd, subTitleMd } =
    options

  const handleClose = () => {
    onCancel ? onCancel?.() : Modal.close()
  }

  const titleForDisplay = isMobileBiz && titleMd ? titleMd : title
  const subTitleForDisplay = isMobileBiz && subTitleMd ? subTitleMd : subTitle

  return (
    <div
      className={clsx(
        styles.container,
        isCloseBtn && styles.containerFixIsCloseBtn,
        isSuccessModal && styles.containerSuccessFix,
        isMobileBiz && styles.containerMdFix
      )}
    >
      {isSuccessModal ? (
        <img src={successfullyBizIcon} alt='' style={{ width: 71, height: 71, margin: '0 auto' }} />
      ) : null}

      <div className={clsx(styles.textWrap)}>
        <div className={clsx(styles.title, { [styles.successTitlFix]: isSuccessModal })}>{titleForDisplay}</div>
        <div className={clsx(styles.subTitle, { [styles.successSubTitlFix]: isSuccessModal })}>
          {subTitleForDisplay}
        </div>
      </div>

      {!isSuccessModal ? (
        <div className={styles.buttons}>
          <button onClick={action} className={`btn-biz ${btnStyleType}`}>
            {isLoading ? <span className='spinner-border' /> : btnText}
          </button>

          {isCloseBtn ? (
            <button onClick={handleClose} className='btn-biz transparent'>
              {secondBtnText || 'Cancel'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
