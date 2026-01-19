import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { pages } from 'constant'
import { handleError } from 'utils/error-handler'

import { Modal } from '../../components'
import { useCurrentBreakpointPairs } from '../../hooks/use-current-breakpoint-pairs'
import { $twoFaStatus } from '../../model/two-fa'
import { getWhiteListFx } from '../../model/white-list'
import { TwoFaNeedModal } from '../modals/two-factor-need-modal'
import { SettingItemCardWrap } from './setting-item-card-wrap'
import styles from './styles.module.scss'

export const Whitelist = () => {
  const navigate = useNavigate()
  const twoFa = useUnit($twoFaStatus)

  const [isLoading, setIsLoading] = useState(false)

  const handleGetWhiteList = async () => {
    if (!twoFa) {
      Modal.open(<TwoFaNeedModal />, { variant: 'center' })
      return
    }

    setIsLoading(true)
    try {
      await getWhiteListFx()
      navigate(pages.WHITELIST.path)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const breakpointText = `Here, you can add new addresses to\u00A0your whitelist, ${
    isMobilePairs ? ' ' : '\n'
  }update existing ones, or delete them as needed.`

  return (
    <SettingItemCardWrap title={'Whitelist'} description={breakpointText}>
      <div onClick={handleGetWhiteList} className={styles.settingEditAppText}>
        Edit
      </div>
    </SettingItemCardWrap>
  )
}
