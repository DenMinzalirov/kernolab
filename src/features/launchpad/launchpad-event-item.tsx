import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { MenuWithActions } from 'components/menu-with-actions'
import linkPairsSvg from 'assets/icons/link-pairs.svg'

import { Modal, ProgressBar } from '../../components'
import { LaunchpadStatus } from '../../components/launchpad-status'
import { TBDHideId, ZEEKNODEPRICE } from '../../config'
import configDataJson from '../../configData.json'
import { pages } from '../../constant'
import { $assetsListData } from '../../model/cefi-combain-assets-data'
import { $currency } from '../../model/currency'
import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
import { formatDateOrTime } from '../../utils/formats'
import { ShortLaunchpadProject } from '../../wip/services/launchpads'
import { LaunchpadShareModal } from '../modals/launchpad-share'
import styles from './styles.module.scss'

type Props = {
  launchpad: ShortLaunchpadProject
}

export function LaunchpadEventItem({ launchpad }: Props) {
  const isZeekNode = launchpad.supplyAssetId === 'ZEEKNODE'

  const assets = useUnit($assetsListData)
  const hideBlocks = configDataJson?.launchpadConfig?.hideBlocks || []
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'

  const asset = assets.find(assetItem => assetItem.assetId === launchpad.buyingAssetId)

  const navigate = useNavigate()

  const currencyFixStringView = () => {
    const isAzura = launchpad.supplyAssetId === 'AZURA'
    const isTBD = TBDHideId.includes(launchpad.projectId)

    if (isAzura) return ''

    if (isTBD) return ''

    const isZeekNode = launchpad.supplyAssetId === 'ZEEKNODE'
    const zeekNodePrice = Object.entries(ZEEKNODEPRICE).find(([key]) => launchpad.name.includes(key))?.[1]

    const fixPrice = asset ? asset[currencyType].price : 0
    const amountCurrency = asset ? addCommasToDisplayValue((fixPrice * +launchpad.buyingAssetPrice).toString(), 2) : 0

    return `≈${isZeekNode ? '$' : currency.symbol}${isZeekNode ? zeekNodePrice : amountCurrency}`
  }

  const goToAssetContract = (url: string) => {
    if (window) {
      window.open(url)
    }
  }

  const progress = () => {
    return (+launchpad.supplyRaisedAmount * 100) / +launchpad.supplyAmount
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(
      `${window?.location?.origin || 'app.fideum.group'}/launchpad/${launchpad.projectId}`
    )
    Modal.open(<LaunchpadShareModal />, {
      title: pages.PORTFOLIO.name,
      variant: 'center',
    })
  }

  return (
    <>
      <div className={styles.launchpadItemCard}>
        <div className={styles.cardHeader}>
          <img
            className={styles.cardHeaderIcon}
            src={launchpad?.iconUrl || require('../../assets/images/crypto-icons/unknown.png')}
            alt=''
          />
          <div className={styles.cardHeaderTitleWrap}>
            <div className={styles.cardHeaderTitle}>{launchpad.name}</div>
            <LaunchpadStatus status={launchpad?.status || ''} />
          </div>

          <div className={styles.cardHeaderActions}>
            <MenuWithActions
              actions={[
                {
                  label: 'Share',
                  icon: <img src={linkPairsSvg} className={styles.linkIconWrap} />,
                  onClick: handleShare,
                  disabled: false,
                },
              ]}
              isDotBig
            />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.cardDescription}>{launchpad.shortDescription}</div>

        <div className={styles.infoBlockWrap}>
          <div className={clsx(styles.infoBlockWrap, styles.flexGrow1)}>
            <div className={styles.infoBlock}>
              <div className={styles.infoBlockTitle}>Token Price</div>
              <div className={styles.infoBlockAmount}>
                {addCommasToDisplayValue(launchpad.buyingAssetPrice || '0', 4)} {launchpad.buyingAssetId}
              </div>
            </div>

            {hideBlocks.includes('launchDate') ? null : (
              <div className={styles.infoBlock}>
                <div className={styles.infoBlockTitle}>Launch Date</div>
                <div className={styles.infoBlockAmount}>{formatDateOrTime(launchpad.launchDate)}</div>
              </div>
            )}
          </div>

          {/* TODO Доработать этот блок, понять его назначение и внешний вид в дизайне. ? */}
          {launchpad.contracts && launchpad.contracts.length && (
            <div className={styles.infoBlock}>
              <div className={styles.infoBlockTitle}>Contracts</div>
              <div className={styles.infoBlockAmount} style={{ display: 'flex', gap: 9 }}>
                {launchpad.contracts.map(contract => {
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
                })}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            opacity: TBDHideId.includes(launchpad.projectId) ? '0' : '1',
          }}
          className={styles.totalRaisedWrap}
        >
          <div className={styles.lableText}>Total raised</div>
          {isZeekNode ? (
            <div className={styles.infoBlockAmount}>
              {addCommasToDisplayValue(launchpad.supplyRaisedAmount, 2)} /{' '}
              {addCommasToDisplayValue(launchpad.supplyAmount, 2)} {launchpad.supplyAssetId}
            </div>
          ) : (
            <div className={styles.infoBlockAmount}>
              {addCommasToDisplayValue((+launchpad.supplyRaisedAmount * +launchpad.buyingAssetPrice).toString(), 2)} /{' '}
              {addCommasToDisplayValue((+launchpad.supplyAmount * +launchpad.buyingAssetPrice).toString(), 2)}{' '}
              {launchpad.buyingAssetId}
            </div>
          )}

          {isZeekNode ? null : <ProgressBar value={progress() || 0} isBig />}
        </div>

        <button
          type='submit'
          className={clsx('btn-new primary')}
          onClick={() => navigate(`${pages.LAUNCHPAD.path}/${launchpad.projectId}`)}
        >
          Learn More
        </button>
      </div>
    </>
  )
}
