import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { MainLoader, Modal } from '../../components'
import { pages } from '../../constant'
import { $selectedCardUuid, getCardsDataFx } from '../../model/cefi-banking'
import { BasicCardInfo, CardService, ECardType } from '../../wip/services'
import { CardTracking } from '../modals/card-tracking'
import { CardViewDetails } from '../modals/card-view-details'
import { SuccessActivateCard } from '../modals/success-activate-card'
import styles from './styles.module.scss'
import cardBody from './SVG/card-body.svg'
import lockIcon from './SVG/Lock.svg'
import plusIcon from './SVG/Plus.svg'
import settingIcon from './SVG/Setting.svg'
import showIcon from './SVG/Show.svg'
import unLockIcon from './SVG/UnLock.svg'

type Props = {
  selectedCard: BasicCardInfo
}

export function CardItem({ selectedCard }: Props) {
  const selectedCardUuid = useUnit($selectedCardUuid)

  const navigate = useNavigate()

  const isCardBlocked = selectedCard?.status === 'BLOCKED'
  // console.log('isCardBlocked', isCardBlocked)

  const [isLoading, setIsLoading] = useState(false)

  const handleBlockCard = async (): Promise<void> => {
    if (selectedCardUuid) {
      const blockService = isCardBlocked ? CardService.unBlockCard : CardService.blockCard
      setIsLoading(true)
      try {
        await blockService(selectedCardUuid)
        await getCardsDataFx()
      } catch (e) {
        console.log('ERROR-handleBlockCard', e)
      }
      setIsLoading(false)
    }
  }

  const isBlockIconBtn = (): boolean => {
    if (selectedCard?.blockType === 'BLOCKED_BY_CARDHOLDER') return false
    return selectedCard?.status !== 'ACTIVE'
  }

  const handleActivateCard = async (): Promise<void> => {
    setIsLoading(true)
    try {
      Modal.open(<SuccessActivateCard />, { variant: 'center' })
      if (selectedCard.cardUuid) {
        await CardService.activateCard(selectedCard.cardUuid)
        await getCardsDataFx()
      }
    } catch (e) {
      console.log('ERROR-handleActivateCard', e)
    }
    setIsLoading(false)
  }

  const handleTracking = () => {
    Modal.open(<CardTracking cardData={selectedCard} />, {
      variant: 'center',
    })
  }

  return (
    <div className={styles.cardBody}>
      <div
        style={{
          position: 'relative',
        }}
        className={`${styles.cardBodyImageWrap} ${isCardBlocked ? styles.blurred : ''}`}
      >
        <img
          src={cardBody}
          alt='card'
          className={styles.cardBodyImage}
          style={selectedCard.type === ECardType.VIRTUAL ? {} : { opacity: 0.5 }}
        />

        <div className={styles.cardNumber}>
          <p className={styles.cardName}>
            {selectedCard?.embossingName
              ? selectedCard.embossingName.split(' ')[0] + ' ' + selectedCard.embossingName.split(' ')[1][0]
              : ''}
          </p>
          {selectedCard?.maskedCardNumber || '--'}
        </div>
      </div>

      <div className={styles.cardBtnsWrap} style={isCardBlocked ? { justifyContent: 'center' } : {}}>
        {['CREATED', 'ORDERED', 'PERSONALIZED', 'DISPATCHED'].includes(selectedCard?.status) ? (
          <>
            <div />
            <div style={selectedCard?.status !== 'DISPATCHED' ? { opacity: 0.2 } : {}}>
              <div
                onClick={() => {
                  if (selectedCard?.status !== 'DISPATCHED') return
                  handleActivateCard()
                }}
                className={styles.iconWrap}
              >
                <img src={plusIcon} alt='' className={styles.btnIconSettings} />
              </div>
              <div className={styles.iconTitle}>Activate Card</div>
            </div>
            <div>
              <div onClick={handleTracking} className={styles.iconWrap}>
                <img src={showIcon} alt='' className={styles.btnIconSettings} />
              </div>
              <div className={styles.iconTitle}>Track My Card</div>
            </div>
            <div />
          </>
        ) : (
          <>
            <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>
              <div
                onClick={() => (!isBlockIconBtn() ? handleBlockCard() : null)}
                className={styles.iconWrap}
                style={isCardBlocked ? { backgroundColor: 'var(--Ivory)' } : {}}
              >
                {isLoading ? (
                  <MainLoader />
                ) : (
                  <img src={isCardBlocked ? unLockIcon : lockIcon} alt='' className={styles.btnIconFreeze} />
                )}
              </div>
              <div className={styles.iconTitle}>{isCardBlocked ? 'Unfreeze' : 'Freeze'}</div>
            </div>

            {isCardBlocked ? null : (
              <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>
                <div
                  onClick={() =>
                    !isBlockIconBtn() && selectedCardUuid
                      ? Modal.open(<CardViewDetails cardUuid={selectedCardUuid} />, {
                          title: pages.PORTFOLIO.name,
                          variant: 'center',
                        })
                      : null
                  }
                  className={styles.iconWrap}
                >
                  <img src={showIcon} alt='' className={styles.btnIconDetails} />
                </div>
                <div className={styles.iconTitle}>View Details</div>
              </div>
            )}

            {isCardBlocked ? null : (
              <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>
                <div
                  onClick={() => (!isBlockIconBtn() ? navigate(pages.CARD_SETTINGS.path) : null)}
                  className={styles.iconWrap}
                >
                  <img src={settingIcon} alt='' className={styles.btnIconSettings} />
                </div>
                <div className={styles.iconTitle}>Settings</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
