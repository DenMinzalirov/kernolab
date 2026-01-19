import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { HeaderTitle, Modal, Spinner } from 'components'
import { MODAL_TYPES, pages } from 'constant'
import { CARD_SETTINGS_TAB } from 'features/card-settings'
import { CardLimits } from 'features/card-settings/card-limits'
import { TxnHistoryCashback } from 'features/transactions-history/txn-history-cashback'
import {
  $cardStatus,
  $selectedCardUuid,
  getCardAccountLimitsFx,
  getCardsBalanceFx,
  getCardsDataFx,
} from 'model/cefi-banking'

import { OrderCardFlow } from '../banking-new/order-card-flow'
import { DepositBankingModal, WithdrawBankingModal } from '../modals'
import { ManageCard } from './ManageCard'
import styles from './styles.module.scss'

export function Card() {
  const cardStatus = useUnit($cardStatus)
  console.log('cardStatus', cardStatus)
  const selectedCardUuid = useUnit($selectedCardUuid)
  console.log('selectedCardUuid', selectedCardUuid)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // MOCK: Для внутреннего тестирования и разработки
    cardStatus.currentStep = 'PROCESSED'
    if (cardStatus.currentStep === 'PROCESSED') {
      Promise.allSettled([getCardsDataFx(), getCardAccountLimitsFx(), getCardsBalanceFx()]).then(() => {
        setIsLoading(false)
      })
    } else {
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [cardStatus])

  const goToModal = (type: string) => {
    if (type === MODAL_TYPES.TOP_UP_BANKING) {
      // Modal.open(<DepositBankingModal />, {
      //   // variant: 'right',
      //   // title: 'Banking',
      //   // isFullScreen: true,
      //   variant: 'center',
      // })
      navigate(pages.DEPOSIT_FIAT.path)
    }

    if (type === MODAL_TYPES.WITHDRAW_BANKING) navigate(pages.DEPOSIT_FIAT.path)
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle='Card' />
      {isLoading ? (
        <div style={{ flexGrow: 1, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
          <Spinner />
        </div>
      ) : selectedCardUuid ? (
        <div className={styles.contentCardWrap}>
          <ManageCard />
          <div className={styles.rightContent}>
            <div className={styles.cashbackWrap}>
              <TxnHistoryCashback />
            </div>
            <div className={styles.limitsContent}>
              <div className={styles.limitCardHeader}>
                <div className={styles.limitCardHeaderTitle}>Card Limits</div>
                <div
                  className={styles.limitCardHeaderButton}
                  onClick={() => navigate(pages.CARD_SETTINGS.path, { state: { tab: CARD_SETTINGS_TAB.LIMITS } })}
                >
                  View all
                </div>
              </div>
              <div className={styles.limitsCardWrap}>
                <CardLimits isPreview />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.contentCardWrap}>
          {/*//TODO: set as new page from banking*/}
          <OrderCardFlow goToTopUp={() => goToModal(MODAL_TYPES.TOP_UP_BANKING)} />
        </div>
      )}
    </div>
  )
}
