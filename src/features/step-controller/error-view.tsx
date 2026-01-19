import styles from './styles.module.scss'

type Props = {
  errorMessage: string
}

export const ErrorView = ({ errorMessage }: Props) => {
  return (
    <>
      {errorMessage ? (
        <div className={styles.errorWrap}>
          <div className={styles.errorText}>
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
      ) : null}
    </>
  )
}
