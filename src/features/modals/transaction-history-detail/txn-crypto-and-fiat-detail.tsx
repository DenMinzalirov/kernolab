import { useEffect, useState } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { GREEN_TEXT_STYLES } from 'features/transactions-history/constants'
import { CryptoAndFiatHistoryTypeNew } from 'features/transactions-history/hooks/type'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { formatStakingTypeForDisplay } from 'utils/transactions-history/format-staking-type-for-display'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { getAmount } from 'utils/transactions-history/get-amout'
import { getAssetId } from 'utils/transactions-history/get-asset-id'
import { getBlockchainExplorerUrl } from 'utils/transactions-history/get-blockchain-explorer-url'
import { getStatus } from 'utils/transactions-history/get-status'
import { getStatusIndicatorColor } from 'utils/transactions-history/get-status-indicator-color'
import { trimAndFormatDecimal } from 'utils/transactions-history/trimAndFormatDecimal'
import { OperationType, TransactionsNewServices } from 'wip/services/transactions-new'
import { CheckedIcon, CopyIcon } from 'icons'
import linkSvg from 'assets/icons/link.svg'

import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

type UnifiedMoreDetailsResponse = {
  id: number
  userUuid: string
  networkId?: string
  sourceAddress?: string
  targetAddress?: string
  blockchainHash?: string
  fbTxId?: string
  rejectReason?: string
  withdrawalHotVaultId?: string
  destinationAddress?: string
  destinationTag?: string
  internalTransaction?: boolean
  destinationUserUuid?: string
  frozenDepositToDestinationOperationId?: string
  bankeraOperationId?: string
  bankeraLastUpdate?: string
  bankAddressUuid?: string
  operationType?: string
  beneficiaryIban?: string
  payerIban?: string
  payerName?: string

  iban?: string
}

type Props = {
  data: CryptoAndFiatHistoryTypeNew
}

export function TxnCryptoAndFiatDetail({ data }: Props) {
  const [moreDetails, setMoreDetails] = useState<UnifiedMoreDetailsResponse | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const time = data.operationTime || ''

  const formatTime = moment(time).format('MMMM D, YYYY hh:mm A')
  const isFiat = [OperationType.FIAT_DEPOSIT, OperationType.FIAT_WITHDRAW].includes(data.operationType as OperationType)

  useEffect(() => {
    const getDetails = async () => {
      setIsLoading(true)
      try {
        let responste: UnifiedMoreDetailsResponse[] = []
        if (data.operationType === OperationType.CRYPTO_DEPOSIT) {
          responste = await TransactionsNewServices.getCryptoDepositHistory([data.id])
        } else if (data.operationType === OperationType.CRYPTO_WITHDRAW) {
          responste = await TransactionsNewServices.getCryptoWithdrawHistory([data.id])
        } else if (data.operationType === OperationType.FIAT_DEPOSIT) {
          responste = await TransactionsNewServices.getFiatDepositHistory([data.id])
        } else if (data.operationType === OperationType.FIAT_WITHDRAW) {
          responste = await TransactionsNewServices.getFiatWithdrawHistory([data.id])
        }
        responste.length && setMoreDetails(responste[0])
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    getDetails()
  }, [])

  const handleCopy = (value?: string): void => {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    })
  }

  const handleLink = (): void => {
    const networkId = moreDetails?.networkId
    const blockchainHash = moreDetails?.blockchainHash

    if (networkId && blockchainHash) {
      const linkUrl = getBlockchainExplorerUrl(networkId, blockchainHash)

      linkUrl && window.open(linkUrl, '_blank')
    }
  }

  const formatBlockchainHash = (hash: string): string => {
    if (!hash) return ''

    if (hash.includes('txt:')) {
      return hash.slice('txt:'.length)
    }

    const firstPart = hash.slice(0, 20)
    const lastPart = hash.slice(-3)

    return `${firstPart}...${lastPart}`
  }

  const amount = getAmount(data)
  const addCommasAmount = addCommasToDisplayValue(amount || '', 8)
  const formatAmount = trimAndFormatDecimal(addCommasAmount, isFiat ? 0 : 5)
  const assetId = getAssetId(data)

  const fee = data.fee || data.feeAmount ? Number(data.fee || data.feeAmount) : 0
  const feeAssetId = data.assetId || data.fromAssetId

  const statusIndicatorColor1 = getStatusIndicatorColor(data.withdrawStatus || '')
  const statusIndicatorColor2 = getStatusIndicatorColor(data.withdrawStatus || '', 'secondary')
  const statusText = getStatus(data.withdrawStatus || '')

  return (
    <>
      <div className={styles.main}>
        <>
          <div className={styles.header}>
            <img className={styles.icon} alt='icon' src={data.icon} />
            <div className={styles.headerTitleWrap}>
              <div className={styles.headerTitle}>{data.title}</div>
              <div className={styles.headerSubTitle}>{formatTime}</div>
            </div>
          </div>

          <div className={styles.content}>
            <div
              className={clsx(
                styles.amountText,
                GREEN_TEXT_STYLES.includes(data.title || '') && styles.greenColor,
                ['PENDING', 'TRAVEL_RULE_PENDING'].includes(data.withdrawStatus || '') && styles.pendingStyle
              )}
            >
              {getAmountSign(data.title)}
              {formatAmount} {assetId}
            </div>

            <div className={styles.rowWrap}>
              {data.operationType === OperationType.LAUNCHPAD_STAKE_ALLOCATION && data.feeAmount ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Allocation Purchase Fee:</div>
                  <div className={styles.rowSubText}>
                    {addCommasToDisplayValue(data.feeAmount || '', 5)} {data.feeAssetId}
                  </div>
                </div>
              ) : null}

              {data.operationType === OperationType.LAUNCHPAD_STAKE_ALLOCATION && data.amount ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Allocation Amount:</div>
                  <div className={styles.rowSubText}>
                    {addCommasToDisplayValue(data.amount || '', 5)} {data.supplyAssetId}
                  </div>
                </div>
              ) : null}

              {data.projectName ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Project:</div>
                  <div className={styles.rowSubText}>{data.projectName}</div>
                </div>
              ) : null}

              {data.operationType === OperationType.FIAT_DEPOSIT && moreDetails?.beneficiaryIban ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>IBAN:</div>
                  <div className={styles.rowSubText}>{moreDetails.beneficiaryIban}</div>
                </div>
              ) : null}

              {data.operationType === OperationType.FIAT_DEPOSIT && moreDetails?.payerIban ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Bank:</div>
                  <div className={styles.rowSubText}>{moreDetails.payerIban}</div>
                </div>
              ) : null}

              {data.operationType === OperationType.FIAT_WITHDRAW && moreDetails?.iban ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>IBAN:</div>
                  <div className={styles.rowSubText}>{moreDetails.iban}</div>
                </div>
              ) : null}

              {data.operationType === OperationType.FIAT_WITHDRAW && moreDetails?.payerIban ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Bank:</div>
                  <div className={styles.rowSubText}>{moreDetails.payerIban}</div>
                </div>
              ) : null}

              {data.withdrawStatus ? (
                <div className={styles.row}>
                  <div className={styles.statusBlockWrap}>
                    <div className={styles.rowText}>Status:</div>

                    <div className={styles.statusBlock}>
                      <div className={styles.statusIndicatorWrap}>
                        <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor1])}></div>
                        <div className={clsx(styles.statusIndicator, styles[statusIndicatorColor2])}></div>
                      </div>
                      <div className={styles.statusBlockText}>{statusText}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {data.fromAmount ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>From:</div>
                  <div className={styles.rowSubText}>
                    {addCommasToDisplayValue(data.fromAmount, 5)} {data.fromAssetId}
                  </div>
                </div>
              ) : null}

              {data.toAmount ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>To:</div>
                  <div className={styles.rowSubText}>
                    {addCommasToDisplayValue(data.toAmount, 5)} {data.toAssetId}
                  </div>
                </div>
              ) : null}

              {data.exchangeRate ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Conversion rate:</div>
                  <div className={styles.rowSubText}>
                    1 {data.fromAssetId} = {addCommasToDisplayValue(data.exchangeRate, 5)} {data.toAssetId}
                  </div>
                </div>
              ) : null}

              {data.operationType !== OperationType.LAUNCHPAD_STAKE_ALLOCATION && fee ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Fee:</div>
                  <div className={styles.rowSubText}>
                    {fee} {feeAssetId}
                  </div>
                </div>
              ) : null}

              {moreDetails?.blockchainHash ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Blockchain hash:</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className={styles.rowSubText}>{formatBlockchainHash(moreDetails.blockchainHash)}</div>
                    <div className={styles.iconWrap} onClick={() => handleCopy(moreDetails.blockchainHash)}>
                      {isCopied ? (
                        <CheckedIcon fill='var(--Deep-Space)' />
                      ) : (
                        <CopyIcon isMobile={true} fill='var(--Deep-Space)' />
                      )}
                    </div>
                    <div className={styles.iconWrap} onClick={handleLink}>
                      <img src={linkSvg} alt='' />
                    </div>
                  </div>
                </div>
              ) : null}

              {data.operationType === OperationType.STAKING_REWARD && data.stakingType ? (
                <div className={styles.row}>
                  <div className={styles.rowText}>Staking Type:</div>
                  <div className={styles.rowSubText}>{formatStakingTypeForDisplay(data.stakingType)}</div>
                </div>
              ) : null}

              {isLoading ? (
                <div className={styles.rowLoading}>
                  <span className='spinner-border' />
                </div>
              ) : null}
            </div>
          </div>
        </>

        <div className={styles.flexGrow1}></div>

        <button className={`btn-new primary ${isMobilePairs ? 'big' : ''}`} onClick={() => Modal.close()}>
          Looks Good!
        </button>
      </div>
    </>
  )
}
