import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { useNavigate, useParams } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { handleError } from 'utils/error-handler'
import { LaunchpadProjectIcon, LaunchpadService } from 'wip/services/launchpads'

import zeekImg from '../../assets/images/ZekretMainImage.png'
import { HeaderTitle, ProgressBar, Spinner } from '../../components'
import { LaunchpadStatus } from '../../components/launchpad-status'
import { SimpleHint } from '../../components/simple-hint'
import { TBDHideId, ZEEKNODEPRICE } from '../../config'
import configDataJson from '../../configData.json'
import { pages } from '../../constant'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $tierLevel } from '../../model/cefi-stacking'
import { $currency } from '../../model/currency'
import {
  $allocationLaunchpad,
  $allocationsLaunchpads,
  $currentLaunchpad,
  getAllocationLaunchpadFx,
  getAllocationsLaunchpadsFx,
  getLaunchpadFx,
  getLaunchpadsFx,
} from '../../model/launchpads'
import { getToken } from '../../utils'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import { formatDateOrTime } from '../../utils/formats'
import CHAT from './icons/CHAT.svg'
import DEFAULT from './icons/DEFAULT.svg'
import FACEBOOK from './icons/FACEBOOK.svg'
import LINKEDIN from './icons/LINKEDIN.svg'
import REDDIT from './icons/REDDIT.svg'
import SuccessIconGreen from './icons/successIconGreen.svg'
import TELEGRAM from './icons/TELEGRAM.svg'
import WEBSITE from './icons/WEBSITE.svg'
import WHITEPAPER from './icons/WHITEPAPER.svg'
import X from './icons/X.svg'
import YOUTUBE from './icons/YOUTUBE.svg'
import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

const rightIcons: Record<string, any> = {
  WHITEPAPER: WHITEPAPER,
  WEBSITE: WEBSITE,
  CHAT: CHAT,
}

const bottomIcons: Record<string, any> = {
  FACEBOOK: FACEBOOK,
  DEFAULT: DEFAULT,
  LINKEDIN: LINKEDIN,
  REDDIT: REDDIT,
  TELEGRAM: TELEGRAM,
  X: X,
  YOUTUBE: YOUTUBE,
}

export function IndividualLaunchpad() {
  const hideBlocks = configDataJson?.launchpadConfig?.hideBlocks || []

  const { launchpadId } = useParams()
  const currentLaunchpad = useUnit($currentLaunchpad)
  const assets = useUnit($assetsListData)
  const allocationsLaunchpads = useUnit($allocationsLaunchpads)
  const userLevel = useUnit($tierLevel)
  const allocationLaunchpad = useUnit($allocationLaunchpad)
  const userLevelAllocation = currentLaunchpad?.userLevelAllocations.find(item => item.userLevel === userLevel)
  const token = getToken()

  const isZeekNode = currentLaunchpad?.supplyAssetId === 'ZEEKNODE'

  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const { isMobilePairs, isTabletPairs } = useCurrentBreakpointPairs()

  const asset = assets.find(assetItem => assetItem.assetId === currentLaunchpad?.buyingAssetId)

  const currencyFixStringView = () => {
    const isAzura = currentLaunchpad?.supplyAssetId === 'AZURA'
    const isTBD = TBDHideId.includes(currentLaunchpad?.projectId || '')

    if (isAzura) return ''

    if (isTBD) return ''

    const isZeekNode = currentLaunchpad?.supplyAssetId === 'ZEEKNODE'
    const fixPrice = asset ? asset[currencyType].price : 0
    const zeekNodePrice = Object.entries(ZEEKNODEPRICE).find(([key]) => currentLaunchpad?.name.includes(key))?.[1]

    const amountCurrency = asset
      ? addCommasToDisplayValue((fixPrice * +(currentLaunchpad?.buyingAssetPrice || 0)).toString(), 2)
      : 0

    return `≈${isZeekNode ? '$' : currency.symbol}${isZeekNode ? zeekNodePrice : amountCurrency}`
  }

  const finishAllocationLaunchpad = allocationsLaunchpads.find(
    item => item.projectUuid === allocationLaunchpad?.projectUuid
  )

  const minUserLevelAllocation = Math.min(...(currentLaunchpad?.userLevelAllocations?.map(obj => obj.userLevel) || [0]))
  const unlimitedTierLevelAllocationArray = currentLaunchpad?.userLevelAllocations
    ? currentLaunchpad.userLevelAllocations.filter(obj => obj.isUnlimited).map(obj => obj.userLevel)
    : []
  const unlimitedTierLevelAllocation = unlimitedTierLevelAllocationArray.length
    ? Math.min(...unlimitedTierLevelAllocationArray)
    : null

  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (launchpadId) {
      getLaunchpadFx(launchpadId).finally(() => {
        setIsLoading(false)
      })
      if (token) {
        getAllocationLaunchpadFx(launchpadId)
      }
    }
  }, [launchpadId])

  if (!currentLaunchpad) {
    return (
      <div style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        {/*//TODO set load all assets for webpack*/}
        <img src={zeekImg} alt={''} style={{ display: 'none' }} />
        <Spinner />
      </div>
    )
  }

  const progress = () => {
    return (+currentLaunchpad.supplyRaisedAmount * 100) / +currentLaunchpad.supplyAmount
  }

  const progressAllocation = () => {
    return (
      100 -
      (+(allocationLaunchpad?.totalPurchasedAmount || 0) * 100) / +(userLevelAllocation?.supplyAllocationSize || 0)
    )
  }

  const handlePurchase = () => {
    if (!token) {
      navigate(pages.SignIn.path)
      return
    }

    if (!(minUserLevelAllocation <= userLevel)) {
      navigate(pages.EARN.path)
      return
    }

    navigate(pages.LAUNCHPAD_PURCHASE.path, {
      state: { currentLaunchpad: currentLaunchpad, unlimitedLevel: unlimitedTierLevelAllocation },
    })
  }

  const handleRefund = async () => {
    setIsLoading(true)
    try {
      await LaunchpadService.createRefundLaunchpad(currentLaunchpad.projectId)
      await getLaunchpadsFx({ page: '0', size: '2000' })
      await getAllocationsLaunchpadsFx({ page: '0', size: '2000' })
    } catch (error) {
      console.log('handleRefund-error', error)
      handleError(error)
    }
    setIsLoading(false)
  }

  const handleClaim = async () => {
    setIsLoading(true)
    try {
      await LaunchpadService.createClaimLaunchpad(currentLaunchpad.projectId)
      await getLaunchpadsFx({ page: '0', size: '2000' })
      await getAllocationsLaunchpadsFx({ page: '0', size: '2000' })
    } catch (error) {
      console.log('handleClaim-error', error)
      handleError(error)
    }
    setIsLoading(false)
  }

  const showResidualAllocation = () => {
    if (TBDHideId.includes(launchpadId || '')) return false
    if (currentLaunchpad.status === 'COMING_SOON') return false
    if (currentLaunchpad.status === 'FULLY_RAISED' && unlimitedTierLevelAllocation) return false
    if (currentLaunchpad.status === 'NOT_RAISED' && userLevel < +(unlimitedTierLevelAllocation || 4)) return false
    if (unlimitedTierLevelAllocation && userLevel >= unlimitedTierLevelAllocation) return false
    return true
  }

  const goToAssetContract = (url: string) => {
    if (window) {
      window.open(url)
    }
  }

  //TODO not hint icon
  const renderIcons = (icons: LaunchpadProjectIcon[], filterIcons: Record<string, any>) =>
    icons
      .filter(icon => !Object.keys(filterIcons).includes(icon.iconType))
      .map(icon => (
        <div
          key={icon.iconType}
          onClick={() => window.open(icon.url)}
          style={{ cursor: 'pointer', width: 20, height: 20 }}
        >
          <img src={bottomIcons[icon.iconType] || rightIcons[icon.iconType] || DEFAULT} alt={''} />
        </div>
      ))

  const combinedBlock = () => {
    if (!token) return null
    if (currentLaunchpad.status === 'FINISHED') return null
    if (currentLaunchpad.status === 'CANCELED') return null
    return (
      <>
        {token &&
        allocationLaunchpad &&
        minUserLevelAllocation <= userLevel &&
        currentLaunchpad.status !== 'COMING_SOON' ? (
          <>
            <div className={styles.divider} />
            {showResidualAllocation() ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className={styles.infoBlockTitle}>Your residual allocation</div>
                    <SimpleHint
                      text={`The amount of tokens you are allocated to buy based on your tier level on Pairs Earnings.`}
                    />
                  </div>
                </div>

                <div className={styles.infoBlockAmount}>
                  {addCommasToDisplayValue(userLevelAllocation?.supplyAllocationSize || '0', 2)} $
                  {currentLaunchpad.supplyAssetId}
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className={styles.infoBlockTitle}>Purchased</div>
                  <SimpleHint text={`The amount you have purchased.`} />
                </div>
              </div>

              <div className={styles.infoBlockAmount}>
                {addCommasToDisplayValue(allocationLaunchpad.totalPurchasedAmount || '0', 2)} $
                {currentLaunchpad.supplyAssetId}
              </div>
              {isZeekNode || (unlimitedTierLevelAllocation && userLevel >= unlimitedTierLevelAllocation) ? null : (
                <ProgressBar value={progressAllocation() ? 100 - progressAllocation() : 0} isBig />
              )}
              {!TBDHideId.includes(launchpadId || '') &&
              unlimitedTierLevelAllocation &&
              progressAllocation() <= 0 &&
              unlimitedTierLevelAllocation > userLevel ? (
                <div className={styles.infoBlockTitle} style={{ maxWidth: 310, marginTop: 20 }}>
                  <span style={{ fontWeight: 700 }}>You’ve reached your residual allocation amount.</span> You can still
                  continue purchasing via upgrading your Tier Level
                </div>
              ) : null}
            </div>

            {currentLaunchpad.status === 'FULLY_RAISED' &&
            unlimitedTierLevelAllocation &&
            userLevel >= unlimitedTierLevelAllocation ? (
              <div className={styles.infoBlockTitle} style={{ maxWidth: 252 }}>
                The project has reached its raising goal.{' '}
                <span style={{ fontWeight: 700 }}>
                  You can still buy more, since you are on tier{' '}
                  {userLevel >= unlimitedTierLevelAllocation ? userLevel : unlimitedTierLevelAllocation} level.
                </span>
              </div>
            ) : null}
            {currentLaunchpad.status === 'FULLY_RAISED' &&
            unlimitedTierLevelAllocation &&
            userLevel < unlimitedTierLevelAllocation ? (
              <div className={styles.infoBlockTitle} style={{ maxWidth: 252 }}>
                The project has reached its raising goal.{' '}
                <span style={{ fontWeight: 700 }}>
                  Only Tier {unlimitedTierLevelAllocation} Users can purchase more
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div
            className={styles.activeText}
            style={{
              fontWeight: 400,
              textAlign: 'center',
              display: currentLaunchpad.status === 'COMING_SOON' ? 'none' : 'flex',
            }}
          >
            Project available only for Tier {minUserLevelAllocation} users and above.
          </div>
        )}
        {currentLaunchpad.status === 'COMING_SOON' ? (
          <div className={styles.activeText} style={{ textAlign: 'center' }}>
            This project has not started the raising period.{' '}
          </div>
        ) : currentLaunchpad.status === 'NOT_RAISED' && userLevel <= +(unlimitedTierLevelAllocation || 5) ? (
          <div className={styles.infoBlockTitle}>The project has not reached its raising goal.</div>
        ) : currentLaunchpad.status !== 'FULLY_RAISED' ? (
          <button onClick={() => handlePurchase()} className={clsx('btn-new primary')}>
            {isLoading ? (
              <span className='spinner-border' />
            ) : (
              <div className={styles.btnTitle}>
                {minUserLevelAllocation <= userLevel
                  ? `${TBDHideId.includes(launchpadId || '') ? 'Migrate' : 'Purchase'} Allocation`
                  : 'Update tier'}
              </div>
            )}
          </button>
        ) : null}
      </>
    )
  }

  const finishBlock = (isClaimed?: boolean) => {
    if (!token) return null
    if (currentLaunchpad.status !== 'FINISHED') return null

    return (
      <>
        <div className={styles.divider} />
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: isClaimed ? 'center' : 'flex-start' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className={styles.infoBlockTitle}>Purchased</div>
              <SimpleHint text={`The amount you have purchased.`} />
            </div>
          </div>

          <div className={styles.infoBlockAmount}>
            {addCommasToDisplayValue(finishAllocationLaunchpad?.totalPurchasedAmount || '0', 2)} $
            {currentLaunchpad.supplyAssetId}
          </div>
          {isClaimed ? (
            <>
              <div className={styles.divider} style={{ width: '100%', margin: '30px 0' }} />
              <img src={SuccessIconGreen} alt={''} />
              <div style={{ height: 30 }} />
              <div className={styles.infoBlockTitle}>Tokens have been successfully claimed.</div>
            </>
          ) : null}
          {!isClaimed && +(allocationLaunchpad?.totalPurchasedAmount || 0) > 0 ? (
            <>
              {hideBlocks.includes('claimAvailableFromDate') ? null : (
                <div className={styles.infoBlockTitle} style={{ fontWeight: 700, maxWidth: 310 }}>
                  This project has successfully reached its goal and is not available for purchase anymore. Claim date
                  is {new Date(currentLaunchpad.claimAvailableFromDate).toLocaleString()}
                </div>
              )}

              <button onClick={() => handleClaim()} className={clsx('btn-new primary')}>
                {isLoading ? <span className='spinner-border' /> : <div className={styles.btnTitle}>Claim Tokens</div>}
              </button>
            </>
          ) : null}
        </div>
      </>
    )
  }

  const canceledBlock = (isClaimed?: boolean) => {
    if (!token) return null
    if (currentLaunchpad.status !== 'CANCELED') return null
    return (
      <>
        <div className={styles.divider} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className={styles.infoBlockTitle}>Purchased</div>
              <SimpleHint text={`The amount you have purchased.`} />
            </div>
          </div>
          <div className={styles.infoBlockAmount}>
            {addCommasToDisplayValue(finishAllocationLaunchpad?.totalPurchasedAmount || '0', 2)} $
            {currentLaunchpad.supplyAssetId}
          </div>
          <div className={styles.infoBlockTitle} style={{ fontWeight: 700, maxWidth: 310 }}>
            The project has been terminated due to violation of our terms and conditions. All purchases will be refunded
            to the investors.
          </div>
          {isClaimed ? (
            <>
              <div className={styles.divider} style={{ width: '100%', margin: '30px 0' }} />
              <div className={styles.infoBlockTitle}>Refund claimed.</div>
            </>
          ) : null}
          {!isClaimed && +(allocationLaunchpad?.totalPurchasedAmount || 0) > 0 ? (
            <button onClick={() => handleRefund()} className={clsx('btn-new red')}>
              {isLoading ? <span className='spinner-border' /> : <div className={styles.btnTitle}>Claim Refund</div>}
            </button>
          ) : null}
        </div>
      </>
    )
  }

  return (
    <div className='page-container-pairs'>
      {isTabletPairs || isMobilePairs ? null : <HeaderTitle headerTitle={currentLaunchpad.name} showBackBtn />}

      <div className={styles.launchpadInfoWrap}>
        <div className={styles.launchpadInfo}>
          <div className={styles.launchpadInfoHeaderWrap}>
            <div className={styles.launchpadInfoHeader}>
              <img
                className={styles.launchpadInfoIcon}
                src={currentLaunchpad?.iconUrl || require('../../assets/images/crypto-icons/unknown.png')}
                alt=''
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
                  <div className={styles.titleText}>{currentLaunchpad.name}</div>
                  {isTabletPairs || isMobilePairs ? null : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {currentLaunchpad.tags && currentLaunchpad.tags.length
                        ? currentLaunchpad.tags.map(tag => {
                            return (
                              <div key={tag.name} className={styles.launchpadItemBtn}>
                                {tag.name}
                              </div>
                            )
                          })
                        : null}
                    </div>
                  )}
                </div>
                {isTabletPairs || isMobilePairs ? null : (
                  <div style={{ display: 'flex', gap: 16 }}>
                    {currentLaunchpad.icons && currentLaunchpad.icons.length
                      ? currentLaunchpad.icons.map(icon => {
                          // TODO: bottom
                          if (Object.keys(rightIcons).includes(icon.iconType)) return null
                          return (
                            <div
                              onClick={() => window.open(icon.url)}
                              style={{ cursor: 'pointer', width: 20, height: 20 }}
                              key={icon.iconType}
                            >
                              <SimpleHint
                                text={icon.iconType.charAt(0) + icon.iconType.slice(1).toLowerCase()}
                                icon={bottomIcons[icon.iconType] || DEFAULT}
                              />
                            </div>
                          )
                        })
                      : null}
                  </div>
                )}
              </div>
            </div>
            {isTabletPairs || isMobilePairs ? null : (
              <div style={{ display: 'flex', gap: 16, alignSelf: 'flex-end' }}>
                {currentLaunchpad.icons && currentLaunchpad.icons.length
                  ? currentLaunchpad.icons.map(icon => {
                      // TODO: right
                      if (!Object.keys(rightIcons).includes(icon.iconType)) return null
                      return (
                        <div onClick={() => window.open(icon.url)} style={{ cursor: 'pointer' }} key={icon.iconType}>
                          <SimpleHint
                            text={icon.iconType.charAt(0) + icon.iconType.slice(1).toLowerCase()}
                            icon={rightIcons[icon.iconType] || DEFAULT}
                          />
                        </div>
                      )
                    })
                  : null}
              </div>
            )}
          </div>

          <div className={styles.divider} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            <div style={{ width: '100%' }}>
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                skipHtml={false}
                className={'launchpad-markdown'}
              >
                {currentLaunchpad.fullDescription}
              </Markdown>
            </div>
          </div>

          {isTabletPairs || isMobilePairs ? (
            <>
              <div className={styles.divider} />

              <div style={{ display: 'flex', gap: 16 }}>
                {currentLaunchpad.icons?.length ? renderIcons(currentLaunchpad.icons, rightIcons) : null}
                {currentLaunchpad.icons?.length ? renderIcons(currentLaunchpad.icons, bottomIcons) : null}
              </div>
            </>
          ) : null}
        </div>
        <div className={styles.actionsWrap}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 38 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: -13 }}>
              <LaunchpadStatus status={currentLaunchpad?.status || ''} />
              {+currentLaunchpad.supplyRaisedAmount >= +currentLaunchpad.supplyAmount * 0.8 &&
              currentLaunchpad.status === 'ACTIVE' ? (
                <div className={styles.finalCall}>Final Call</div>
              ) : null}
            </div>

            {TBDHideId.includes(currentLaunchpad.projectId) ? null : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className={styles.activeText}>Raising</div>
                {isZeekNode ? (
                  <div className={styles.infoBlockAmount}>
                    {addCommasToDisplayValue(currentLaunchpad.supplyRaisedAmount, 2)} /{' '}
                    {addCommasToDisplayValue(currentLaunchpad.supplyAmount, 2)} {currentLaunchpad.supplyAssetId}
                  </div>
                ) : (
                  <div className={styles.infoBlockAmount}>
                    {addCommasToDisplayValue(
                      (+currentLaunchpad.supplyRaisedAmount * +currentLaunchpad.buyingAssetPrice).toString(),
                      2
                    )}{' '}
                    /{' '}
                    {addCommasToDisplayValue(
                      (+currentLaunchpad.supplyAmount * +currentLaunchpad.buyingAssetPrice).toString(),
                      2
                    )}{' '}
                    {currentLaunchpad.buyingAssetId}
                  </div>
                )}
                {isZeekNode ? null : (
                  <ProgressBar
                    customColor={currentLaunchpad.status === 'CANCELED' ? 'var(--P-System-Red)' : ''}
                    value={progress() || 0}
                    isBig
                  />
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TBDHideId.includes(currentLaunchpad.projectId) ? null : (
                <div className={styles.infoBlock}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className={styles.infoBlockTitle}>Supply</div>
                    <SimpleHint text={`Available Supply for purchase\n through the Pairs launchpad.`} />
                  </div>
                  <div className={styles.infoBlockAmount}>
                    <>
                      {addCommasToDisplayValue(currentLaunchpad.supplyAmount, 2)} ${currentLaunchpad.supplyAssetId}
                    </>
                  </div>
                </div>
              )}

              <div className={styles.infoBlock}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className={styles.infoBlockTitle}>Token Price</div>
                  <SimpleHint text={`Fixed price of each token during raising period.`} />
                </div>
                <div className={styles.infoBlockAmount}>
                  <>
                    {addCommasToDisplayValue(currentLaunchpad.buyingAssetPrice || '0', 4)}{' '}
                    {currentLaunchpad.buyingAssetId}
                    <span className={styles.descriptionCurrency}>{currencyFixStringView()}</span>
                  </>
                </div>
              </div>
              {currentLaunchpad.contracts && currentLaunchpad.contracts.length ? (
                <div className={styles.infoBlock}>
                  <div className={styles.infoBlockTitle}>Contract address</div>
                  <div className={styles.infoBlockAmount} style={{ display: 'flex', gap: 9 }}>
                    {currentLaunchpad.contracts && currentLaunchpad.contracts.length
                      ? currentLaunchpad.contracts.map(contract => {
                          const nativeAsset = assets.find(assetItem => {
                            if (contract.type === 'BSC' && assetItem.symbol === 'BNB') return true
                            return assetItem.symbol === contract.type
                          })
                          const icon = nativeAsset?.icon
                          return (
                            <img
                              key={contract.type}
                              onClick={() => goToAssetContract(contract.url)}
                              style={{ width: 16, height: 16, borderRadius: 5, cursor: 'pointer' }}
                              src={icon}
                              alt=''
                            />
                          )
                        })
                      : null}
                  </div>
                </div>
              ) : null}

              {hideBlocks.includes('launchDate') ? null : (
                <div className={styles.infoBlock}>
                  <div className={styles.infoBlockTitle}>Launch Date</div>
                  <div className={styles.infoBlockAmount}>{formatDateOrTime(currentLaunchpad.launchDate)}</div>
                </div>
              )}
            </div>
          </div>
          {combinedBlock()}
          {finishBlock(finishAllocationLaunchpad?.status === 'CLAIMED')}
          {canceledBlock(finishAllocationLaunchpad?.status === 'CLAIMED')}
        </div>
      </div>
    </div>
  )
}
