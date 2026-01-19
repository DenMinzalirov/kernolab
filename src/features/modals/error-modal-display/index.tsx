import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { ErrorModal } from 'components/error-modal'
import { pages } from 'constant'
import { goSupportXanova, HELP_LINKS, isBiz, isXanova } from 'config'

import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'
import stylesXanova from './styles-xanova.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type Props = {
  errorText: string
  errorTitle?: string
  errorButtonText?: string
  onClose?: () => void
}

export function ErrorModalDisplay({ errorText, errorTitle, errorButtonText, onClose }: Props) {
  const styles = isBiz ? stylesBiz : isXanova ? stylesXanova : stylesFideum
  const navigate = useNavigate()
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const handleGoSupport = () => {
    if (onClose) {
      onClose()
    } else {
      isBiz ? navigate(pages.SUPPORT.path) : window.open(HELP_LINKS.FAQ)
      Modal.close()
      !isBiz && ErrorModal.close()
    }
  }

  const handleGoSupportXanova = () => {
    if (onClose) {
      onClose()
      return
    }
    Modal.close()
    goSupportXanova()
  }

  if (isXanova) {
    return (
      <div className={styles.container}>
        <div className={styles.heading}>
          <div className={styles.title}>{errorTitle ? errorTitle : 'Oops.. Something went wrong.'}</div>
          <div className={styles.description}>
            {errorText || 'Please try again, or contact our support team if the issue persists.'}
          </div>
        </div>
        <div className={styles.actions}>
          <button type='button' className='btn-xanova red big' onClick={handleGoSupportXanova}>
            {errorButtonText ? errorButtonText : 'Contact Support'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>{errorTitle ? errorTitle : 'Oops.. Something went wrong.'}</div>
        <div className={styles.description}>
          {errorText || 'Please try again, or contact our support team if the issue persists.'}
        </div>
      </div>
      <button
        onClick={handleGoSupport}
        className={isBiz ? 'btn-biz red' : `btn-new red ${isMobilePairs ? 'big' : ''}`}
        style={{ marginTop: 0 }}
      >
        {errorButtonText ? errorButtonText : 'Contact Support'}
      </button>
    </div>
  )
}
