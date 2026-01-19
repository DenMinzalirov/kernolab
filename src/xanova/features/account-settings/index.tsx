import Switch from 'react-switch'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { getCssVar } from 'utils/get-css-var'
import { $twoFaStatus } from 'model/two-fa'
import { $userInfo } from 'model/user-info'

import editIcon from '../../icon-xanova/edit-icon.svg'
import { TwoFactorToggleModal } from '../settings-two-factor/two-factor-toggle-modal'
import styles from './styles.module.scss'
import { useCurrentBreakpointXanova } from 'hooks/use-current-breakpoint-xanova'
import { DeleteAccountModalXanova } from 'xanova/modal/delete-account-modal'

export function AccountSettingsXanova() {
  const navigate = useNavigate()
  const userInfo = useUnit($userInfo)
  const twoFa = useUnit($twoFaStatus)

  const { isDesktopXanova, isMobileXanova } = useCurrentBreakpointXanova()

  const handleChangeEmail = () => {
    navigate(pages.SETTINGS_USER_EMAIL.path)
  }
  const handleChangePassword = () => {
    navigate(pages.SETTINGS_USER_PASSWORD.path)
  }
  const handleDeleteAccount = () => {
    Modal.open(<DeleteAccountModalXanova />, { variant: 'center' })
  }

  const handleOffOnSetup = async () => {
    Modal.open(<TwoFactorToggleModal />, { variant: 'center' })
  }

  const greenColor = getCssVar('--Xanova-Gold')

  const renderDesktopSecurity = () => (
    <div className={styles.sectionStackDesktop}>
      <div>
        <div className={styles.fieldRowDesktop}>
          <div className={clsx(styles.fieldInfoDesktop, styles.maxWidthDesktop)}>
            <span className={styles.fieldTitleDesktop}>Email Address</span>
            <span className={styles.fieldDescriptionDesktop}>Used for login and important notifications</span>
          </div>

          <div className={clsx('input-wrap-xanova', styles.inputWrapDesktop)}>
            <input id='email' type='text' value={userInfo?.email || ''} disabled />
          </div>
          <button
            className={clsx('btn-with-icon-xanova grey-small big', styles.marginLeftAutoDesktop)}
            type='button'
            onClick={handleChangeEmail}
          >
            <img alt='edit icon' src={editIcon} />
            Edit
          </button>
        </div>
        <div className={styles.fieldDividerDesktop} />
      </div>

      <div>
        <div className={styles.fieldRowDesktop}>
          <div className={styles.fieldInfoDesktop}>
            <span className={styles.fieldTitleDesktop}>Change Password</span>
            <span className={styles.fieldDescriptionDesktop}>
              Update your account password. A strong password keeps your account secure.
            </span>
          </div>

          <button
            className={clsx('btn-with-icon-xanova grey-small big', styles.marginLeftAutoDesktop)}
            type='button'
            onClick={handleChangePassword}
          >
            <img alt='edit icon' src={editIcon} />
            Edit
          </button>
        </div>
        <div className={styles.fieldDividerDesktop} />
      </div>

      <div>
        <div className={styles.fieldRowDesktop}>
          <div className={styles.fieldInfoDesktop}>
            <span className={styles.fieldTitleDesktop}>2FA</span>
            <span className={styles.fieldDescriptionDesktop}>
              Add an extra layer of protection by requiring a code from your phone when logging in.
            </span>
          </div>

          <div className={styles.marginLeftAutoDesktop}>
            <Switch
              uncheckedIcon={false}
              checkedIcon={false}
              offColor={'#E8E8E8'}
              onColor={greenColor}
              offHandleColor={'#fff'}
              onHandleColor={'#fff'}
              height={23}
              width={42}
              handleDiameter={19}
              checked={twoFa}
              onChange={handleOffOnSetup}
            />
          </div>
        </div>
        <div className={styles.fieldDividerDesktop} />
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className={styles.sectionStackCompact}>
      <div className={clsx(styles.sectionItemCompact, styles.sectionItemInteractive)} onClick={handleChangeEmail}>
        <div className={styles.sectionTextCompact}>
          <span className={styles.sectionTitleCompact}>Email Address</span>
          <span className={styles.sectionValueCompact}>{userInfo?.email || ''}</span>
        </div>

        <span aria-hidden className={styles.arrowIcon} />
      </div>

      <div className={clsx(styles.sectionItemCompact, styles.sectionItemInteractive)} onClick={handleChangePassword}>
        <div className={styles.sectionTextCompact}>
          <span className={styles.sectionTitleCompact}>Change Password</span>
          <span className={styles.sectionValueCompact}>Update your account password</span>
        </div>

        <span aria-hidden className={styles.arrowIcon} />
      </div>

      <div className={styles.sectionItemCompact}>
        <div className={styles.sectionTextCompact}>
          <span className={styles.sectionTitleCompact}>2FA</span>
          <span className={styles.sectionValueCompact}>Add an extra protection</span>
        </div>

        <div className={styles.sectionSwitch}>
          <Switch
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={'#E8E8E8'}
            onColor={greenColor}
            offHandleColor={'#fff'}
            onHandleColor={'#fff'}
            height={23}
            width={42}
            handleDiameter={19}
            checked={twoFa}
            onChange={handleOffOnSetup}
          />
        </div>
      </div>
    </div>
  )

  const renderMobileDelete = () => (
    <button className={styles.mobileDelete} type='button' onClick={handleDeleteAccount}>
      <span>Delete Account</span>
      <span aria-hidden className={clsx(styles.arrowIcon, styles.bgRed)} />
    </button>
  )

  const renderCompactContent = () => {
    if (isMobileXanova) {
      return (
        <>
          {renderSecurity()}
          {renderMobileDelete()}
        </>
      )
    }

    return renderSecurity()
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageHeading}>Account Settings {isDesktopXanova}</h1>

      <section className={styles.content}>
        <nav className={styles.sidebar}>
          <button className={clsx(styles.sidebarButton, styles.activeSidebarButton)} type='button'>
            Security
          </button>
          <button
            className={clsx(styles.sidebarButton, styles.sidebarButtonDelete)}
            type='button'
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </nav>

        <div className={styles.panel}>
          {isDesktopXanova ? (
            <div className={styles.panelContentDesktop}>{renderDesktopSecurity()}</div>
          ) : (
            <div className={styles.panelContentCompact}>{renderCompactContent()}</div>
          )}
        </div>
      </section>
    </div>
  )
}
