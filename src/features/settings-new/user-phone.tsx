import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { pages } from 'constant'

import { $userInfo, getUserInfoFx } from '../../model/user-info'
import { getToken } from '../../utils'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function UserPhone() {
  const userInfo = useUnit($userInfo)

  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo.phone) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const customComponentDescription = (
    <div>
      {userInfo.phone
        ? 'Your account is registered with the following phone number:'
        : 'You can add your phone number.'}
      <br />
      <span className={styles.userDataDescription}>{userInfo?.phone || ''}</span>
    </div>
  )

  return (
    <SettingItemCardWrap title={'Phone Number'} description={customComponentDescription}>
      <div
        onClick={
          () => navigate(pages.SETTINGS_USER_PHONE.path)
          // Modal.open(<AddOrChangePhoneModal />, {
          //   title: pages.SETTINGS.name,
          //   isFullScreen: true,
          // })
        }
        className={styles.settingEditAppText}
      >
        {userInfo?.phone ? 'Edit' : 'Add'}
      </div>
    </SettingItemCardWrap>
  )
}
