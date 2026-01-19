import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle, Modal } from 'components'
import { pages } from 'constant'
import { TIER_FEE_DISCOUNTS } from 'constant/tier-fee-discounts'
import { LockBbankModal } from 'features/modals'
import { getBalanceString } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { EVENT_NAMES, RollingLeveledStakingPlansResponse, StakingContract, useAnalytics } from 'wip/services'
import { $allStakingContracts, $campaignStakingContracts, $stakingPlans, $tierLevel } from 'model/cefi-stacking'
import { $currency } from 'model/currency'
import infoIconBlack from 'assets/icons/infoIconBlack.svg'
import plusIcon from 'assets/icons/plus.svg'

import { HELP_LINKS } from '../../config'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { MobileAppLanding } from '../mobile-app-landing'
import { EarnRowNew } from './earn-row'
import { EarnSuperchargeRow } from './earn-supercharge-row'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export function Earn() {
  const assets = useUnit($assetsListData)
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const tierLevel = useUnit($tierLevel)
  const stakingPlans = useUnit($stakingPlans)
  const stackingList = useUnit($allStakingContracts)
  const superChargeList = useUnit($campaignStakingContracts)
  const { myLogEvent } = useAnalytics()
  const { currentBreakpointPairs, isMobilePairs, isTabletPairs } = useCurrentBreakpointPairs()

  const navigate = useNavigate()

  const [inputAmount, setInputAmount] = useState('')
  const [inputBbankError, setInputBbankError] = useState(false)
  const [inputError, setInputError] = useState('')
  const [isSupercharge, setIsSupercharge] = useState(false)

  useEffect(() => {
    myLogEvent(EVENT_NAMES.WEB_EARN_PAGE_OPENED)
  }, [])

  const assetIdRollingLeveledPlans =
    stakingPlans.rollingLeveledPlans && stakingPlans.rollingLeveledPlans.length
      ? stakingPlans.rollingLeveledPlans[0].assetId
      : null

  const availableBalance = assets.find(asset => asset.assetId === assetIdRollingLeveledPlans)
  const rollingLeveledStakeAmount = stackingList
    .filter(stake => stake.assetId === assetIdRollingLeveledPlans)
    .reduce((acc, stake) => {
      return acc + +stake.amount
    }, 0)

  const totalLockedValue = stackingList.reduce((acc, stake) => {
    const asset = assets.find(assetItem => assetItem.assetId === stake.assetId)
    const value = asset ? +stake.amount * asset[currencyType].price : 0

    return acc + +value
  }, 0)

  const rollingLeveledPlans = stakingPlans.rollingLeveledPlans
    .slice()
    .sort((a, b) => +a.minimalTargetPlanAmount - +b.minimalTargetPlanAmount)
  const nextPlan = rollingLeveledPlans.find(plan => rollingLeveledStakeAmount < +plan.minimalPlanAmount)
  const nextAmount = nextPlan ? nextPlan.minimalPlanAmount - rollingLeveledStakeAmount : 0

  const stakeRollingLeveled = stackingList.filter(stake => stake.isRollingLeveled)
  const currentStakingApyPercent = stakeRollingLeveled.length ? stakeRollingLeveled[0].stakingApyPercent : 0

  const maxOtherApiPercent = stakingPlans.simplePlans.reduce((max, plan) => {
    return plan.stakingApyPercent > max ? +plan.stakingApyPercent : max
  }, 0)

  // TODO: fo pairs stake ?
  const calcMinimalStakingAmount = (plans: RollingLeveledStakingPlansResponse[], contracts: StakingContract[]) => {
    const myPlan = contracts.find(stake => stake.assetId === assetIdRollingLeveledPlans)
    const myPlanId = myPlan?.planId

    const myPlanMinimalStakingAmount = plans.find(item => item.id === myPlanId)?.minimalStakingAmount

    if (myPlanMinimalStakingAmount) {
      return myPlanMinimalStakingAmount
    } else {
      const minStakingAmount = plans.length ? Math.min(...plans.map(plan => plan.minimalStakingAmount)) : undefined
      return minStakingAmount || 1
    }
  }

  const validateInputAmount = (value: string) => {
    const minimalStakingAmount = calcMinimalStakingAmount(stakingPlans.rollingLeveledPlans, stackingList)

    if (!Number(value)) {
      setInputBbankError(true)
      return false
    } else if (minimalStakingAmount > +value) {
      setInputError(`Minimal staking amount ${minimalStakingAmount}`)
      setInputBbankError(true)
      return false
    } else if (Number(availableBalance?.availableBalance || 0) < +value) {
      setInputError('Not enough balance')
      setInputBbankError(true)
      return false
    } else {
      setInputError('')
      setInputBbankError(false)
      return true
    }
  }

  const handleLockRollingLeveled = (): void => {
    const formattedAmount = inputAmount.replace(',', '.')
    const isValid = validateInputAmount(formattedAmount)

    if (isValid) {
      setInputBbankError(false)

      Modal.open(
        <LockBbankModal
          amount={formattedAmount}
          currentStakingApyPercent={currentStakingApyPercent}
          maxOtherApiPercent={maxOtherApiPercent}
          assetIdRollingLeveledPlans={assetIdRollingLeveledPlans}
        />,
        { title: pages.EARN.name, isFullScreen: true }
      )
    }
  }

  const handleNewEarning = (): void => {
    if (!stakingPlans.simplePlans?.length) {
      window.open(HELP_LINKS.FAQ)
    } else {
      navigate(pages.NEW_EARNING.path)
    }
  }

  const handleNewSupercharge = (): void => {
    navigate(pages.NEW_SUPERCHARGE.path)
  }

  const handleChangeEarn = () => {
    setIsSupercharge(!isSupercharge)
  }

  const columnNames: Record<string, string[]> = {
    'p-desktop': ['Name', 'Locked', 'Value', 'APY', 'Paid Interest', 'Total Duration', 'Days Left', 'Actions'],
    'p-desktop-s': ['Name', 'Locked & Value', '', 'APY & Paid Interest', '', 'Total Duration (Days)', '', 'Actions'],
    'p-tablet': ['Name & Locked', '', '', '', 'Paid Interest', 'Total Duration (Days)', '', 'Actions'],
    'p-mobile': [''],
  }
  const columnNamesSupercharge: Record<string, string[]> = {
    'p-desktop': ['Name', 'Locked', 'Estimated Reward', 'Locked until:', 'Days Left:', 'Actions'],
    'p-desktop-s': ['Name', 'Locked', 'Estimated Reward', '', 'Total Duration (Days)', 'Actions'],
    'p-tablet': ['Name', 'Locked & Estimated Reward', '', '', 'Total Duration (Days)', 'Actions'],
    'p-mobile': [''],
  }

  const btnsOptions =
    isSupercharge && !superChargeList.length
      ? []
      : [
          {
            title: isSupercharge ? 'New Supercharge +' : 'New Earn +',
            action: isSupercharge ? handleNewSupercharge : handleNewEarning,
          },
        ]

  const isMobileOrTablet = isTabletPairs || isMobilePairs
  const hasSuperchargeData = isSupercharge && !!superChargeList.length

  const shouldShowMobileEarnButton = isMobileOrTablet && (!isSupercharge || hasSuperchargeData)

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'Earn'} btnsOptions={btnsOptions} />

      {isMobilePairs ? (
        <div className={styles.earnInfoBlockMobile}>
          <div className={styles.earnInfoBlockMobileItem}>
            <div className={styles.earnInfoBlockMobileItemText}>Total Locked Value</div>
            <div className={styles.earnInfoBlockMobileItemSubText}>
              {currency.symbol}
              {addCommasToDisplayValue(totalLockedValue.toString(), 2)}
            </div>
          </div>
          <div className={styles.earnInfoBlockMobileItem2}>
            <div className={styles.earnInfoBlockMobileItemBtn}>
              <span className={styles.earnInfoBlockMobileItemBtnText}>Tier {tierLevel}</span>
              <img src={infoIconBlack} style={{ width: 13 }} alt={''} />
            </div>
            <div className={styles.earnInfoBlockMobileItemBtn}>
              <span className={styles.earnInfoBlockMobileItemBtnText}>APY {assetIdRollingLeveledPlans}</span>
              <span className={styles.earnInfoBlockMobileItemBtnSubText}>{+currentStakingApyPercent}%</span>
            </div>
            <div className={styles.earnInfoBlockMobileItemBtn}>
              <span className={styles.earnInfoBlockMobileItemBtnText}>APY Other</span>
              <span className={styles.earnInfoBlockMobileItemBtnSubText}>{maxOtherApiPercent}%</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.tableContainer}>
        <div className={styles.tableTitleRow}>
          <div className={styles.manageCardSwitchBlock}>
            <div
              onClick={handleChangeEarn}
              className={clsx(styles.manageCardBtn, !isSupercharge ? styles.manageCardBtnActive : '')}
            >
              Earnings
            </div>
            <div
              // onClick={handleChangeEarn}
              className={clsx(styles.manageCardBtn, isSupercharge ? styles.manageCardBtnActive : '')}
              style={{ cursor: 'not-allowed' }}
            >
              Supercharge
            </div>
          </div>

          {shouldShowMobileEarnButton && (
            <button
              onClick={isSupercharge ? handleNewSupercharge : handleNewEarning}
              className={styles.newEarnMobileBtn}
            >
              {isTabletPairs && (isSupercharge ? 'New Supercharge' : 'New Earn')}
              <img src={plusIcon} alt='' />
            </button>
          )}
        </div>

        {!isSupercharge ? (
          <div className={styles.earnInfoBlock}>
            <div
              onClick={handleNewEarning}
              className={clsx(styles.earnInfoItem, styles.earnInfoItemOrder1)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.tierInfo}>
                <div className={styles.earnInfoItemTitle}>
                  Assigned <span className={styles.earnInfoItemTitleGreen}>Tier {tierLevel}</span>
                </div>
              </div>
              <div className={styles.earnInfoData}>
                <div>
                  {+currentStakingApyPercent}% APY {assetIdRollingLeveledPlans}
                </div>
                <div className={styles.dot2} />
                <div>{maxOtherApiPercent}% APY Other</div>
                <div className={styles.dot2} />
                <div>Fees {TIER_FEE_DISCOUNTS[tierLevel]}% Off</div>
              </div>
            </div>

            <div className={clsx(styles.earnInfoItem, styles.earnInfoItemOrder2)}>
              <div className={styles.earnInfoItemTitle}>
                {addCommasToDisplayValue(rollingLeveledStakeAmount.toString(), 0)} {assetIdRollingLeveledPlans}
              </div>

              <div className={styles.earnInfoData}>Total Locked</div>
            </div>

            <div className={clsx(styles.earnInfoItem, styles.earnInfoItemOrder3)}>
              {tierLevel === 4 ? (
                <div className={styles.earnInfoItemTitle}>Max Level Reached</div>
              ) : (
                <div className={styles.earnInfoItemTitle}>
                  {getBalanceString(nextAmount, 4)} {assetIdRollingLeveledPlans}
                </div>
              )}

              <div className={styles.earnInfoData}>Lock to Reach Next Tier</div>
            </div>
          </div>
        ) : null}

        <div className={styles.table}>
          {!isSupercharge && stackingList.length ? (
            <>
              <div className={clsx(styles.tableHeader, styles.hideMobile)}>
                {columnNames[currentBreakpointPairs].map((name, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} className={clsx(styles.tableHeaderText, styles[`cell${index + 1}`])}>
                    {name}
                  </div>
                ))}
              </div>

              {/*// TODO: fo pairs stake ?*/}
              <div className={styles.tableRowsWrap}>
                {stackingList
                  .slice()
                  .sort((a, b) => {
                    if (a.assetId === assetIdRollingLeveledPlans && a.assetId !== b.assetId) {
                      return -1
                    }
                    return 0
                  })
                  .map(stake => {
                    return (
                      <div key={stake.id}>
                        <EarnRowNew stake={stake} />
                      </div>
                    )
                  })}
              </div>
            </>
          ) : null}

          {!isSupercharge && !stackingList.length ? (
            <div className={styles.clearStakeWrap}>
              <div className={styles.clearStake}>
                <div className={styles.clearStakeWrapTitle}>Lock ${assetIdRollingLeveledPlans} to Unlock Earning</div>
                <div className={styles.clearStakeWrapDescription}>
                  Lock ${assetIdRollingLeveledPlans} tokens to unlock earnings and get assigned a tier level to earn on
                  your crypto.
                </div>
              </div>
            </div>
          ) : null}

          {isSupercharge && !superChargeList.length ? (
            <div className={styles.superchargeClearWrap}>
              <div className={styles.superchargeTextWrap}>
                <div className={styles.superchargeTitle}>Join Supercharge Staking and Win Big!</div>
                <div className={styles.superchargeDescription}>
                  Dive into our exclusive Supercharge Staking and amplify your earnings! Take control of your financial
                  future and start staking today!
                </div>

                <button
                  onClick={handleNewSupercharge}
                  className={clsx(styles.btnGetStarted, 'btn-new primary', isMobilePairs ? 'width-big' : 'height-60')}
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : null}

          {hasSuperchargeData ? (
            <>
              <div className={clsx(styles.tableHeaderSupercharge, styles.hideMobile)}>
                {columnNamesSupercharge[currentBreakpointPairs].map((name, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} className={clsx(styles.tableHeaderText, styles[`cellS${index + 1}`])}>
                    {name}
                  </div>
                ))}
              </div>

              <div className={styles.tableRowsWrapSupercharge}>
                {superChargeList
                  .slice()
                  .sort((a, b) => {
                    const today = new Date().getTime()
                    const dateA = new Date(a.closeDate).getTime()
                    const dateB = new Date(b.closeDate).getTime()
                    const diffA = dateA - today
                    const diffB = dateB - today

                    if (diffA <= 0 && diffB <= 0) {
                      return diffA - diffB
                    } else if (diffA <= 0) {
                      return -1
                    } else if (diffB <= 0) {
                      return 1
                    } else {
                      return diffA - diffB
                    }
                  })
                  .map(stake => {
                    return <div key={stake.id}>{<EarnSuperchargeRow stake={stake} />}</div>
                  })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
