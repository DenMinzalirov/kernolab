import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { pages } from 'constant'
import { SettingItemCardWrap } from 'features/settings-new/setting-item-card-wrap'
import { $selectedCardUuid } from 'model/cefi-banking'

import styles from './styles.module.scss'

export function Password3DS() {
  const selectedCardUuid = useUnit($selectedCardUuid)

  const navigate = useNavigate()

  return (
    <>
      <SettingItemCardWrap title={'3DS Password'} description={'View your card 3DS Password'}>
        <div
          onClick={() => {
            if (!selectedCardUuid) return

            navigate(pages.CARD_SECURITY.path)
          }}
          className={styles.settingEditAppText}
        >
          View
        </div>
      </SettingItemCardWrap>
    </>
  )
}
