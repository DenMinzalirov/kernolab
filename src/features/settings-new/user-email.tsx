import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { pages } from 'constant'

import { $userInfo, getUserInfoFx } from '../../model/user-info'
import { getToken } from '../../utils'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export function UserEmail() {
  const userInfo = useUnit($userInfo)

  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo.email) {
      const userToken = getToken()
      userToken && getUserInfoFx()
    }
  }, [])

  const customComponentDescription = (
    <div>
      Your account is registered with the following email:
      <br />
      <span className={styles.userDataDescription}>{userInfo?.email || 'example@gmail.com'}</span>
    </div>
  )

  return (
    <SettingItemCardWrap title={'User Email'} description={customComponentDescription}>
      <div onClick={() => navigate(pages.SETTINGS_USER_EMAIL.path)} className={styles.settingEditAppText}>
        Edit
      </div>
    </SettingItemCardWrap>
  )
}
