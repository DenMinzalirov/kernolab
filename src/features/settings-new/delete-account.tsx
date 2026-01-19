import { useNavigate } from 'react-router-dom'

import { pages } from 'constant'

import { HELP_LINKS, isBiz } from '../../config'
import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function DeleteAccount() {
  const navigate = useNavigate()

  const { isDesktopSPairs, isTabletPairs, isMobilePairs } = useCurrentBreakpointPairs()

  const breakpointText = () => {
    if (isMobilePairs) {
      return `We will be sad to see you go, but you always have the\u00A0option to break our hearts....`
    }
    if (isTabletPairs) {
      return `We will be sad to see you go, but you always have the\u00A0option\nto break our hearts....`
    }
    if (isDesktopSPairs) {
      return `We will be sad to see you go, but you always\nhave the\u00A0option to break our hearts....`
    }
    return `We will be sad to see you go, but you always have\nthe\u00A0option to break our hearts....`
  }

  return (
    <SettingItemCardWrap title={'Delete Account'} description={breakpointText()}>
      <div
        onClick={() => {
          if (isBiz) {
            navigate(pages.DELETE_ACCOUNT.path)
          } else {
            window.open(HELP_LINKS.DELETE_CEFI_ACCOUNT)
          }
        }}
        className={styles.settingEditAppText}
        style={{
          ...(isMobilePairs ? { backgroundColor: 'var(--P-System-Red)' } : {}),
          ...(!isMobilePairs ? { color: 'var(--P-System-Red)' } : {}),
        }}
      >
        Delete Account
      </div>
    </SettingItemCardWrap>
  )
}
