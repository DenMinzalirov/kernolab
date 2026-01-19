/* eslint-disable max-len */
import { Modal } from 'components'
import { ErrorModal } from 'components/error-modal'
import { pages } from 'constant'
import { ErrorModalDisplay } from 'features/modals/error-modal-display'

const defaultErrorModalTitle = 'Oops.. Something went wrong.'
const defaultErrorModalDescription = 'Please try again, or contact our support team if the issue persists.'

type ErrorMap = {
  [key: string]: {
    errorModalTitle: string
    errorModalDescription: string
    inlineErrorText: string
    modalBtnTitle?: string
    modalBtnAction?: () => void
  }
}

const errorMap: ErrorMap = {
  // Exchange (exchangeAsset, exchangeInfoAsset)
  ASSET_NOT_SUPPORTED: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'Asset not supported',
  },
  AMOUNT_LESS_THAN_MINIMUM: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered amount is less than the minimum allowed.',
  },
  INSUFFICIENT_FUNDS: {
    errorModalTitle: 'Insufficient funds',
    errorModalDescription: 'You do not have enough funds to complete this operation.',
    inlineErrorText: 'You do not have enough funds to complete this operation.',
  },
  // ChangeEmailBiz, ChangeEmailModal, useSignUp
  USER_EMAIL_ALREADY_EXISTS: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'This email already exists',
  },
  // ChangePasswordBiz, ChangePasswordModal
  INVALID_USER_EMAIL_TOTP: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered code is incorrect.',
  },
  INVALID_USER_PHONE_TOTP: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered code is incorrect.',
  },
  INVALID_TOTP_CODE: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered code is incorrect.',
  },
  INVALID_USER_EMAIL_CONFIRM_CODE: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered code is incorrect.',
  },
  INVALID_USER_PHONE_CONFIRM_CODE: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered code is incorrect.',
  },
  INVALID_OTP_CODE: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The entered code is incorrect.',
  },
  // AddOrChangePhoneModal
  USER_PHONE_ALREADY_EXISTS: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'This phone number is already associated with another account.',
  },
  UNSUPPORTED_PHONE_COUNTRY_CODE: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'The phone country code is not supported.',
  },
  // SignIn
  USER_EMAIL_NOT_FOUND: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'Invalid login details. Please check and try again.',
  },
  USER_OR_PASSWORD_NOT_VALID: {
    errorModalTitle: '',
    errorModalDescription: '',
    inlineErrorText: 'Invalid login details. Please check and try again.',
  },
  TOO_MANY_VERIFY_MFA_STATUS_ATTEMPTS: {
    errorModalTitle: 'Error: Too Many Attempts',
    errorModalDescription:
      'You have made multiple unsuccessful attempts to view sensitive data. For your security, access has been temporarily locked.',
    modalBtnTitle: 'Close',
    modalBtnAction: () => ErrorModal.close(),
    inlineErrorText: '',
  },
  TOO_MANY_GET_USER_ATTRIBUTE_ATTEMPTS: {
    errorModalTitle: 'Too Many Attempts',
    errorModalDescription:
      'You have made multiple unsuccessful attempts to view sensitive data. For your security, access has been temporarily locked.',
    modalBtnTitle: 'Close',
    modalBtnAction: () => ErrorModal.close(),
    inlineErrorText: '',
  },
  TOO_MANY_UPDATE_ATTEMPTS: {
    errorModalTitle: 'Too Many Attempts',
    errorModalDescription:
      'You have made multiple unsuccessful attempts to view sensitive data. For your security, access has been temporarily locked.',
    modalBtnTitle: 'Close',
    modalBtnAction: () => {
      ErrorModal.close()
      Modal.close()
    },
    inlineErrorText: '',
  },
  EDD_TRIGGERED: {
    errorModalTitle: 'Transaction Under Verification',
    errorModalDescription:
      'Your most recent transaction is currently being processed and is under verification (EDD). During this process all other transactions are\u00A0temporarily unavailable. Please wait for completion. If you believe this is an error or need further assistance, please contact our support team.',
    inlineErrorText: '',
  },
  FEE_CHANGED: {
    errorModalTitle: 'Transaction Expired',
    errorModalDescription:
      'The transaction couldn\u0027t be completed because the fees have changed. Please start the transaction again to proceed with the updated fees. If\u00A0you need help, contact our support team.',
    inlineErrorText: '',
  },
  COUNTRY_MISMACTHED: {
    errorModalTitle: 'Country Mismatched',
    errorModalDescription: 'The country you selected does not match the document provided.',
    modalBtnTitle: 'Got it',
    modalBtnAction: () => ErrorModal.close(),
    inlineErrorText: '',
  },
  UNSUPPORTED_COUNTRY: {
    errorModalTitle: 'Unsupported Country',
    errorModalDescription: 'This service is not available in your country.',
    modalBtnTitle: 'Close',
    modalBtnAction: () => ErrorModal.close(),
    inlineErrorText: '',
  },
  INVALID_KYC_USER: {
    errorModalTitle: 'Invalid KYC',
    errorModalDescription:
      'Your KYC data does not meet the\u00A0requirements for card ordering. Please try again, or contact our support team if the issue persists.',
    inlineErrorText: '',
  },
  STEP_UP_BLOCKED: {
    errorModalTitle: 'Action Restricted',
    errorModalDescription:
      'It looks\u00A0like\u00A0this action\u00A0is\u00A0currently restricted due\u00A0to\u00A0certain limitations. Please check your account status\u00A0or\u00A0contact our support team\u00A0for\u00A0further assistance.',
    inlineErrorText: '',
  },
  TOO_MANY_RESEND_ATTEMPTS: {
    errorModalTitle: 'Too Many Attempts',
    errorModalDescription:
      "Looks like you've tried re sending too many times. Please wait a moment before trying again.",
    inlineErrorText: '',
    modalBtnTitle: 'Close',
    modalBtnAction: () => ErrorModal.close(),
  },
  TURNSTILE_VALIDATION_FAILED: {
    errorModalTitle: 'Validation failed',
    errorModalDescription: "We couldn't verify your request. Please try again or contact support.",
    inlineErrorText: '',
  },

  //Xanova
  TWO_FA_OFF: {
    errorModalTitle: 'Enable Two-Factor Authentication',
    errorModalDescription:
      'Two-factor authentication is required to continue. Please enable it in your account settings before requesting a payout.',
    inlineErrorText: '',
    modalBtnTitle: 'Go to Settings',
    modalBtnAction: () => {
      ErrorModal.close()
      window.location.assign(pages.ACCOUNT_SETTINGS.path)
    },
  },
  FEE_GREATER_THAN_AMOUNT: {
    errorModalTitle: 'Amount Too Low',
    errorModalDescription:
      'The network fee exceeds the amount you entered. Increase the amount or adjust the transaction details to continue.',
    inlineErrorText: 'The fee is higher than the amount you entered.',
  },
}

export const handleError = (error: any, isInline?: boolean): string | void => {
  const errorText = error.code || error.message

  const errorMapItem = errorMap[errorText]
  //TODO refactoring without if
  if (errorMapItem) {
    const { errorModalTitle, errorModalDescription, inlineErrorText, modalBtnTitle, modalBtnAction } = errorMapItem

    if (inlineErrorText && isInline) return inlineErrorText

    ErrorModal.open(
      <ErrorModalDisplay
        errorTitle={errorModalTitle || defaultErrorModalTitle}
        errorText={errorModalDescription || inlineErrorText || defaultErrorModalDescription}
        errorButtonText={modalBtnTitle}
        onClose={modalBtnAction}
      />
    )
  } else {
    ErrorModal.open(
      <ErrorModalDisplay errorTitle={defaultErrorModalTitle} errorText={errorText || defaultErrorModalDescription} />
    )
  }
}
