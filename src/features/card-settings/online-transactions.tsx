import { useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { SettingItemCardWrap } from 'features/settings-new/setting-item-card-wrap'
import { CardService } from 'wip/services'
import { $cardsData, $selectedCardUuid, getCardsDataFx } from 'model/cefi-banking'

import styles from './styles.module.scss'

export function OnlineTransactions() {
  const [isLoading, setIsLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const selectedCardUuid = useUnit($selectedCardUuid)
  const cardsData = useUnit($cardsData)
  const selectedCard = cardsData.find(card => card.cardUuid === selectedCardUuid)

  const isEnabled = selectedCard?.security?.internetPurchaseEnabled

  const handleOnClick = async (value: boolean): Promise<void> => {
    if (isLoading || value === isEnabled || !selectedCard) return
    setIsLoading(true)
    try {
      await CardService.updateSecurity({
        cardUuid: selectedCard.cardUuid,
        // @ts-ignore
        securityData: { ...selectedCard.security, internetPurchaseEnabled: value },
      })
      await getCardsDataFx()
    } catch (e: any) {
      console.log('ERROR-handleSecurity', e)
      setRequestError(e.code)
    }
    setIsLoading(false)
  }

  return (
    <SettingItemCardWrap title={'Online Transactions'} description={'Allow/Deny online transactions'}>
      <div className={styles.currencySwitchBlock}>
        <div
          onClick={async () => handleOnClick(true)}
          className={clsx(styles.currencyBtn, isEnabled ? styles.currencyBtnActive : '')}
        >
          {isLoading && !isEnabled ? <span className={`spinner-border black`} /> : 'On'}
        </div>
        <div
          onClick={async () => handleOnClick(false)}
          className={clsx(styles.currencyBtn, !isEnabled ? styles.currencyBtnActive : '')}
        >
          {isLoading && isEnabled ? <span className='spinner-border black' /> : 'Off'}
        </div>
      </div>
    </SettingItemCardWrap>
  )
}
