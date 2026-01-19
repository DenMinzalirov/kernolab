import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { MainLoader, Modal } from 'components'
import { pages } from 'constant'
import { CardTracking } from 'features/modals/card-tracking'
import { CardViewDetails } from 'features/modals/card-view-details'
import { FancyPhysicalCard } from 'features/modals/fancy-physical-card'
import { TopUpCard } from 'features/modals/top-up-card'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { CardService, ECardType } from 'wip/services'
import { Currencies } from 'wip/stores'
import { $cardsBalance, $cardsData, $selectedCardUuid, getCardsDataFx, selectedCardUuidEv } from 'model/cefi-banking'

import { $tierLevel } from '../../model/cefi-stacking'
import { getToken, parseJwt } from '../../utils'
import { CardItem } from './card-item'
import { PhysicalOrderCard } from './physical-order-card'
import styles from './styles.module.scss'
import cardBody from './SVG/card-body.svg'
import lockIcon from './SVG/Lock.svg'
import settingIcon from './SVG/Setting.svg'
import showIcon from './SVG/Show.svg'
import unLockIcon from './SVG/UnLock.svg'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

const CARD_TABS = {
  VIRTUAL: 'Virtual',
  PHYSICAL: 'Physical',
}

export function ManageCard() {
  // const selectedCardUuid = useUnit($selectedCardUuid)
  const cardsData = useUnit($cardsData)
  // const selectedCard = cardsData.find(card => card.cardUuid === selectedCardUuid)
  const virtualCard = cardsData.find(card => card.type === ECardType.VIRTUAL)
  const physicalCard = cardsData.find(card => card.type === ECardType.CHIP_AND_PIN)
  // const tierLevel = useUnit($tierLevel)
  const cardsBalance = useUnit($cardsBalance)
  console.log('cardsBalance1', cardsBalance)
  // const accessToken = getToken()
  // const parsedToken = parseJwt(accessToken || '')
  const { isMobilePairs } = useCurrentBreakpointPairs()

  // const scope = parsedToken?.scope || []
  //
  // const navigate = useNavigate()

  // const [isLoading, setIsLoading] = useState(false)
  const [cardType, setCardType] = useState(CARD_TABS.VIRTUAL)
  // const [flipped, setFlipped] = useState(false)

  // const hasPhysicalCard = cardsData.find(card => card.type === 'CHIP_AND_PIN')
  // console.log('hasPhysicalCard', hasPhysicalCard)

  // const cardUuid = selectedCard?.cardUuid || ''
  // const isCardBlocked = selectedCard?.status === 'BLOCKED'

  const goToTopUpCard = () => {
    Modal.open(<TopUpCard />, {
      variant: 'center',
      title: pages.EARN.name,
      // isFullScreen: true
    })
  }

  // const handleBlockCard = async (): Promise<void> => {
  //   if (cardUuid) {
  //     const blockService = isCardBlocked ? CardService.unBlockCard : CardService.blockCard
  //     setIsLoading(true)
  //     try {
  //       await blockService(cardUuid)
  //       await getCardsDataFx()
  //     } catch (e) {
  //       console.log('ERROR-handleBlockCard', e)
  //     }
  //     setIsLoading(false)
  //   }
  // }

  // const handleActivateCard = async (): Promise<void> => {
  //   setIsLoading(true)
  //   try {
  //     if (cardUuid) {
  //       await CardService.activateCard(cardUuid)
  //       await getCardsDataFx()
  //     }
  //   } catch (e) {
  //     console.log('ERROR-handleActivateCard', e)
  //   }
  //   setIsLoading(false)
  // }

  // const handleTracking = () => {
  //   Modal.open(<CardTracking cardData={selectedCard} />, {
  //     isFullScreen: true,
  //   })
  // }

  const handleChangeCard = (itemName: string): void => {
    setCardType(itemName)
    // setFlipped(!flipped)
    // setTimeout(() => {
    //   setFlipped(false)
    // }, 500)

    // if (!hasPhysicalCard) {
    //   // selectedCardUuidEv(null)
    //   return
    // }

    const switchedCard = cardsData.find(
      card => card.type === (itemName === CARD_TABS.VIRTUAL ? 'VIRTUAL' : 'CHIP_AND_PIN')
    )
    switchedCard && selectedCardUuidEv(switchedCard.cardUuid)
  }

  // const isShowActivateCard = (): boolean => {
  //   return selectedCard?.status === 'DISPATCHED'
  // }

  // const isBlockIconBtn = (): boolean => {
  //   if (selectedCard?.blockType === 'BLOCKED_BY_CARDHOLDER') return false
  //   return selectedCard?.status !== 'ACTIVE'
  // }

  // const goToEarn = () => {
  //   navigate(pages.EARN.path)
  // }
  //
  // const getPhysicalCard = () => {
  //   Modal.open(<FancyPhysicalCard />, { title: pages.PORTFOLIO.name, isFullScreen: true })
  // }

  // const isCanOrderPhysical = () => {
  //   if (scope.includes('PAYROLL')) return true
  //   if (tierLevel >= 2) return true
  //   return false
  // }

  // const canAddPhysicalCard = cardType === CARD_TABS.VIRTUAL || (cardType === CARD_TABS.PHYSICAL && hasPhysicalCard)
  // console.log('cardType', cardType)
  return (
    <div className={styles.manageCardWrap}>
      {
        // selectedCard ? (
        <>
          <div className={styles.cardBalanceWrap}>
            {!isMobilePairs ? (
              <div className={styles.cardBalanceHeader}>
                <div className={styles.cardBalanceTitle}>Card Balance</div>
              </div>
            ) : null}

            <div className={styles.cardBalance}>
              <div className={styles.cardBalanceAmountWrap}>
                <div className={styles.cardBalanceLabel}>{isMobilePairs ? 'Card Balance' : 'Total:'}</div>
                <div className={styles.cardBalanceAmount}>
                  {Currencies.EUR}
                  {addCommasToDisplayValue(cardsBalance || '', 5)}
                </div>
              </div>

              <button className='btn-new grey big' onClick={goToTopUpCard}>
                Top Up
              </button>
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <div className={styles.cardSwitch}>
                {Object.values(CARD_TABS).map(itemName => {
                  return (
                    <div
                      key={itemName}
                      onClick={() => handleChangeCard(itemName)}
                      className={clsx(styles.navMenuItem, {
                        [styles.navMenuItemActive]: itemName === cardType,
                      })}
                    >
                      {itemName}
                    </div>
                  )
                })}
              </div>
            </div>

            {cardType === CARD_TABS.VIRTUAL && virtualCard ? <CardItem selectedCard={virtualCard} /> : null}

            {cardType === CARD_TABS.PHYSICAL && physicalCard ? <CardItem selectedCard={physicalCard} /> : null}

            {cardType === CARD_TABS.PHYSICAL && !physicalCard ? <PhysicalOrderCard /> : null}

            {/*<div className={styles.cardBody}>*/}
            {/*  <div*/}
            {/*    style={{*/}
            {/*      position: 'relative',*/}
            {/*      transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',*/}
            {/*      transition: '0.6s',*/}
            {/*    }}*/}
            {/*    className={`${styles.cardBodyImageWrap} ${isCardBlocked ? styles.blurred : ''}`}*/}
            {/*  >*/}
            {/*    <img src={cardBody} alt='card' className={styles.cardBodyImage} />*/}

            {/*    {canAddPhysicalCard ? (*/}
            {/*      <div className={styles.cardNumber}>*/}
            {/*        <p className={styles.cardName}>*/}
            {/*          {selectedCard?.embossingName*/}
            {/*            ? selectedCard.embossingName.split(' ')[0] + ' ' + selectedCard.embossingName.split(' ')[1][0]*/}
            {/*            : ''}*/}
            {/*        </p>*/}
            {/*        {selectedCard?.maskedCardNumber || '--'}*/}
            {/*      </div>*/}
            {/*    ) : null}*/}
            {/*  </div>*/}

            {/*  <div className={styles.cardBtnsWrap} style={isCardBlocked ? { justifyContent: 'center' } : {}}>*/}
            {/*    /!*{canAddPhysicalCard ? }*!/*/}
            {/*    <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>*/}
            {/*      <div*/}
            {/*        onClick={() => (!isBlockIconBtn() ? handleBlockCard() : null)}*/}
            {/*        className={styles.iconWrap}*/}
            {/*        style={isCardBlocked ? { backgroundColor: 'var(--Ivory)' } : {}}*/}
            {/*      >*/}
            {/*        {isLoading ? (*/}
            {/*          <MainLoader />*/}
            {/*        ) : (*/}
            {/*          <img src={isCardBlocked ? unLockIcon : lockIcon} alt='' className={styles.btnIconFreeze} />*/}
            {/*        )}*/}
            {/*      </div>*/}
            {/*      <div className={styles.iconTitle}>{isCardBlocked ? 'Unfreeze' : 'Freeze'}</div>*/}
            {/*    </div>*/}

            {/*    {isCardBlocked ? null : (*/}
            {/*      <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>*/}
            {/*        <div*/}
            {/*          onClick={() =>*/}
            {/*            !isBlockIconBtn()*/}
            {/*              ? Modal.open(<CardViewDetails cardUuid={cardUuid} />, {*/}
            {/*                  title: pages.PORTFOLIO.name,*/}
            {/*                  variant: 'center',*/}
            {/*                })*/}
            {/*              : null*/}
            {/*          }*/}
            {/*          className={styles.iconWrap}*/}
            {/*        >*/}
            {/*          <img src={showIcon} alt='' className={styles.btnIconDetails} />*/}
            {/*        </div>*/}
            {/*        <div className={styles.iconTitle}>View Details</div>*/}
            {/*      </div>*/}
            {/*    )}*/}

            {/*    {isCardBlocked ? null : (*/}
            {/*      <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>*/}
            {/*        <div*/}
            {/*          onClick={() => (!isBlockIconBtn() ? navigate(pages.CARD_SETTINGS.path) : null)}*/}
            {/*          className={styles.iconWrap}*/}
            {/*        >*/}
            {/*          <img src={settingIcon} alt='' className={styles.btnIconSettings} />*/}
            {/*        </div>*/}
            {/*        <div className={styles.iconTitle}>Settings</div>*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </div>*/}
            {/*</div>*/}

            {/* <div className={styles.balanceCardWrap}>
                <div style={{ flexGrow: 1 }} />
                <div className={styles.balanceCardTitle}>Card Balance</div>
                <div className={styles.balanceCardAmount}>
                  {Currencies.EUR}
                  {cardsBalance || ''}
                </div>
                <div className={styles.btnGroup}>
                  <button
                    disabled={!hasActiveCard}
                    onClick={() => goToTopUpCard()}
                    className={clsx('btn-new primary big', styles.topUpBtn)}
                    style={{
                      ...(isShowActivateCard()
                        ? { backgroundColor: '#FFF', color: 'var(--Deep-Space)', border: '1px solid var(--Deep-Space)' }
                        : {}),
                      ...(hasActiveCard ? {} : { opacity: 0.2 }),
                    }}
                  >
                    <div className={styles.btnTitle}>Top Up</div>
                  </button>
                  {isShowActivateCard() ? (
                    <button
                      onClick={() => handleActivateCard()}
                      className={clsx('btn-new primary big', styles.topUpBtn)}
                    >
                      {isLoading ? (
                        <span className='spinner-border' />
                      ) : (
                        <div className={styles.btnTitle}>Activate Card</div>
                      )}
                    </button>
                  ) : null}
                </div>
                {['CREATED', 'ORDERED', 'PERSONALIZED', 'DISPATCHED'].includes(selectedCard?.status) ? (
                  <div className={styles.trackingLinkText} onClick={handleTracking}>
                    Track your card
                  </div>
                ) : (
                  <div style={{ flexGrow: 1 }} />
                )}
              </div> */}
          </div>
        </>
        // ) : null
        /* (
        <div className={styles.cardBody} style={{ background: 'inherit' }}>
          <div
            style={{
              position: 'relative',
              filter: isCardBlocked ? 'blur(2px)' : '',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: '0.6s',
              margin: '0 auto',
            }}
          >
            {isMobile ? (
              <CardBodySvgMobile fill={isCardBlocked ? '#3581B8' : '#000'} />
            ) : (
              <CardBodySvg fill={isCardBlocked ? '#3581B8' : '#000'} />
            )}
          </div>
        </div>
      ) */
      }

      {/* {selectedCard ? (
        <div className={styles.iconsWrap} style={isCardBlocked ? { justifyContent: 'center' } : {}}>
          <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>
            <div
              onClick={() => (!isBlockIconBtn() ? handleBlockCard() : null)}
              className={styles.iconWrap}
              style={isCardBlocked ? { backgroundColor: 'var(--Ivory)' } : {}}
            >
              {isLoading ? <MainLoader /> : <img src={isCardBlocked ? unLockIcon : lockIcon} alt='' />}
            </div>
            <div className={styles.iconTitle}>{isCardBlocked ? 'Unfreeze' : 'Freeze'}</div>
          </div>

          {isCardBlocked ? null : (
            <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>
              <div
                onClick={() =>
                  !isBlockIconBtn()
                    ? Modal.open(<CardViewDetails cardUuid={cardUuid} />, {
                        title: pages.PORTFOLIO.name,
                        variant: 'center',
                      })
                    : null
                }
                className={styles.iconWrap}
              >
                <img src={showIcon} alt='' />
              </div>
              <div className={styles.iconTitle}>View Details</div>
            </div>
          )}

          {isCardBlocked ? null : (
            <div style={isBlockIconBtn() ? { opacity: 0.2 } : {}}>
              <div
                onClick={() =>
                  !isBlockIconBtn()
                    ? Modal.open(<CardSettingsModal cardUuid={cardUuid} />, {
                        title: pages.PORTFOLIO.name,
                        isFullScreen: true,
                      })
                    : null
                }
                className={styles.iconWrap}
              >
                <img src={settingIcon} alt='' />
              </div>
              <div className={styles.iconTitle}>Settings</div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={styles.iconsWrap}
          style={{
            alignItems: 'center',
            flexDirection: 'column',
            margin: '0 auto 46px',
          }}
        >
          {!isCanOrderPhysical() ? (
            <>
              <div className={styles.availableTier}>Available from Tier 2</div>
              <div style={{ height: 18 }} />
              <div className={styles.getCardTitle}>Physical Card</div>
              <div style={{ height: 8 }} />
              <div className={styles.getCardDescription}>
                You can start using the virtual card right away, before your physical one arrives.
              </div>
              <div style={{ height: 28 }} />
              <div onClick={goToEarn} className={styles.goUpgradeText}>
                Go to “Earn” to upgrade to Tier 2
              </div>
            </>
          ) : (
            <>
              <div className={styles.getCardTitle}>Get Physical Card</div>
              <div style={{ height: 8 }} />
              <div className={styles.getCardDescription}>
                You can start using the virtual card right away, before your physical one arrives.
              </div>
              <div style={{ height: 31 }} />
              <button onClick={getPhysicalCard} className='btn-new primary big'>
                Get Physical Card
              </button>
            </>
          )}
        </div>
      )} */}
    </div>
  )
}
