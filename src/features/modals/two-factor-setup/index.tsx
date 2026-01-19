import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { $twoFaStatus } from 'model/two-fa'

import { pages } from '../../../constant'
import { useCurrentBreakpointPairs } from '../../../hooks/use-current-breakpoint-pairs'
import styles from './styles.module.scss'

export function TwoFaSetup() {
  const twoFa = useUnit($twoFaStatus)

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const navigate = useNavigate()

  const handleOffOnSetup = async () => {
    navigate(pages.SETTINGS_TWO_FACTOR.path)

    Modal.close()
  }

  return (
    <div className={styles.container} style={!twoFa && !isMobilePairs ? { padding: '62px 60px' } : {}}>
      <div className={styles.titleWrap}>
        <div className={styles.title}>{twoFa ? 'Turn Off 2FA?' : 'Two Factor Authentication'}</div>
        <div className={styles.description}>
          {twoFa
            ? 'With 2FA deactivated, your account will only be protected by your password. This may increase the risk of\u00A0unauthorized access. '
            : 'To setup Two Factor Authentication please follow the instructions.'}
        </div>
      </div>

      <div>
        <button type='button' className={`btn-new primary ${twoFa ? 'red' : ''}`} onClick={handleOffOnSetup}>
          {twoFa ? 'Turn Off Anyway' : 'Start Setup'}
        </button>

        {twoFa ? (
          <button type='button' className='btn-new transparent' onClick={() => Modal.close()} style={{ marginTop: 12 }}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  )
}
