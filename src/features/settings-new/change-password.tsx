import { useNavigate } from 'react-router-dom'

import { Modal } from 'components'
import { pages } from 'constant'
import { ChangePasswordModal } from 'features/modals'

import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function ChangePassword() {
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const navigate = useNavigate()

  const breakpointText = `You can update your account password anytime.${
    isMobilePairs ? ' ' : '\n'
  }Follow the instructions to set a new, secure password.`

  return (
    <SettingItemCardWrap title={'Change Password'} description={breakpointText}>
      <div
        onClick={
          () => navigate(pages.SETTINGS_USER_PASSWORD.path)
          // Modal.open(<ChangePasswordModal />, {
          //   title: pages.SETTINGS.name,
          //   isFullScreen: true,
          //   variant: 'center',
          // })
        }
        className={styles.settingEditAppText}
      >
        Edit
      </div>
    </SettingItemCardWrap>
  )
}
