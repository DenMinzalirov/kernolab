import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { transformEmail } from 'utils/transform-email'
import { $userInfo, getUserInfoFx } from 'model/user-info'

import { themeLogo } from '../../config'
import { pages } from '../../constant'
import styles from './styles.module.scss'
import { SettingsModalFideumOTC } from 'fideumOTC/modals-fideumOTC'

export function NavPanelFideumOTC() {
  const userInfo = useUnit($userInfo)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!userInfo.email) {
      getUserInfoFx().then(r => null)
    }
  }, [])

  const navigateTo = (path: string) => {
    navigate(path)
  }

  const handleClickLogo = () => {
    navigateTo(pages.Base.path)
  }

  const handleOpenSettings = () => {
    Modal.open(<SettingsModalFideumOTC />, { variant: 'right-top' })
  }

  return (
    <>
      <div className={styles.mainNavPanelContainer}>
        <section className={styles.mainNavPanel}>
          <img src={themeLogo()} alt='Logo' className={styles.bbLogo} onClick={handleClickLogo} />
          <div className={styles.navPanelWrap}>
            <div
              onClick={() => navigateTo(pages.Base.path)}
              className={pages.Base.path === location.pathname ? styles.navActiveLocation : styles.navHover}
            >
              Trades
            </div>
            <div
              onClick={() => navigateTo(pages.CLIENTS_FIDEUM_OTC.path)}
              className={pages.Base.path !== location.pathname ? styles.navActiveLocation : styles.navHover}
            >
              Clients
            </div>
          </div>
          <div onClick={handleOpenSettings} className={styles.settingsWrap}>
            <div className={styles.settingsBtnIcon}>{transformEmail(userInfo.email).toUpperCase()}</div>
            {/* {showAccountText ? <div className={styles.settingsText}>My Account</div> : null} */}
          </div>
        </section>
      </div>
    </>
  )
}
