import alertCircleIcon from 'assets/icons/alert-circle-icon.svg'

import styles from './styles.module.scss'

type Props = {
  errorMessage: string
  margin?: string
}

//TODO refactor
export const ErrorViewBiz = ({ errorMessage, margin = '12px 0 0 0' }: Props) => {
  return (
    <>
      {errorMessage ? (
        <div className={styles.errorWrapBiz} style={margin ? { margin: margin } : {}}>
          <img className={styles.errorIconBiz} alt='Error' src={alertCircleIcon} />
          <div className={styles.errorTextBiz}>
            {[
              'INVALID_USER_EMAIL_TOTP',
              'INVALID_USER_PHONE_TOTP',
              'INVALID_TOTP_CODE',
              'INVALID_USER_EMAIL_CONFIRM_CODE',
              'INVALID_USER_PHONE_CONFIRM_CODE',
              'INVALID_OTP_CODE',
            ].includes(errorMessage)
              ? 'The entered code is incorrect'
              : errorMessage}
          </div>
        </div>
      ) : (
        <div style={{ height: 29 }} />
      )}
    </>
  )
}
