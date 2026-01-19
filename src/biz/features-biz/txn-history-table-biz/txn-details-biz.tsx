import { useEffect, useState } from 'react'
import moment from 'moment'
import clsx from 'clsx'

import { Modal } from 'components'
import { GREEN_TEXT_STYLES } from 'features/transactions-history/constants'
import { UnifiedHistoryTypeForBiz } from 'features/transactions-history/hooks/type'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { getAmountSign } from 'utils/transactions-history/get-amount-sign'
import { getBlockchainExplorerUrl } from 'utils/transactions-history/get-blockchain-explorer-url'
import { trimAndFormatDecimal } from 'utils/transactions-history/trimAndFormatDecimal'
import { OperationType, TransactionsNewServices } from 'wip/services/transactions-new'
import { CheckedIcon, CopyIcon } from 'icons'
import linkSvg from 'assets/icons/link.svg'

import { getAmountBiz } from './helpers/get-amount-biz'
import { getAssetIdBiz } from './helpers/get-asset-id-biz'
import { getOperationTypeTextForDisplay } from './helpers/get-operation-type-text-for-display'
import { getStatusTextForDisplay } from './helpers/get-status-text-for-display'
import styles from './styles.module.scss'

type UnifiedMoreDetailsResponse = {
  // TODO это дубликат
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
  data: UnifiedHistoryTypeForBiz
}

export const TxnDetailsBiz = ({ data }: Props) => {
  const [moreDetails, setMoreDetails] = useState<UnifiedMoreDetailsResponse | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

    const firstPart = hash.slice(0, 20)
    const lastPart = hash.slice(-3)

    return `${firstPart}...${lastPart}`
  }

  const amount = getAmountBiz(data)
  const addCommasAmount = addCommasToDisplayValue(amount || '', 8)
  const formatAmount = trimAndFormatDecimal(addCommasAmount, isFiat ? 0 : undefined)
  const assetId = getAssetIdBiz(data)
  const status = data?.withdrawStatus || 'COMPLETED' // Если поля со статусам нету то по дефолту COMPLETED

  const titleForDisplay = getOperationTypeTextForDisplay(data.operationType)
  const dateForDisplay = moment(data.operationTime).format('MMMM D, YYYY h:mm A')
  const statusForDisplay = getStatusTextForDisplay(status)
  const fee = data.fee || data.feeAmount ? Number(data.fee || data.feeAmount) : 0
  const feeAssetId = data.assetId || data.fromAssetId

  const fromAssetId = data.fromAssetId || data.assetFromId
  const toAssetId = data.toAssetId || data.assetToId

  return (
    <div className={styles.detailsModal}>
      <div className={styles.detailsModalContent}>
        <div className={styles.detailsModalTitleWrap}>
          <div className={styles.detailsModalTitle}>{titleForDisplay}</div>
          <div
            className={clsx(
              styles.detailsModalAmountText,
              GREEN_TEXT_STYLES.includes(data.title || '') && styles.greenColor
            )}
          >
            {getAmountSign(data.title)}
            {formatAmount} {assetId}
          </div>
        </div>

        <div className={styles.detailsModalRowsWrap}>
          <div className={styles.detailsModalRow}>
            <div className={styles.detailsModalRowText}>Date:</div>
            <div className={styles.detailsModalRowSubText}>{dateForDisplay}</div>
          </div>

          {data.operationType === OperationType.FIAT_DEPOSIT && moreDetails?.beneficiaryIban ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>IBAN:</div>
              <div className={styles.detailsModalRowSubText}>{moreDetails.beneficiaryIban}</div>
            </div>
          ) : null}

          {data.operationType === OperationType.FIAT_DEPOSIT && moreDetails?.payerIban ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>Bank:</div>
              <div className={styles.detailsModalRowSubText}>{moreDetails.payerIban}</div>
            </div>
          ) : null}

          {data.operationType === OperationType.FIAT_WITHDRAW && moreDetails?.iban ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>IBAN:</div>
              <div className={styles.detailsModalRowSubText}>{moreDetails.iban}</div>
            </div>
          ) : null}

          {data.operationType === OperationType.FIAT_WITHDRAW && moreDetails?.payerIban ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>Bank:</div>
              <div className={styles.detailsModalRowSubText}>{moreDetails.payerIban}</div>
            </div>
          ) : null}

          {data.fromAmount ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>From:</div>
              <div className={styles.detailsModalRowSubText}>
                {addCommasToDisplayValue(data.fromAmount, 5)} {fromAssetId}
              </div>
            </div>
          ) : null}

          {data.toAmount ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>To:</div>
              <div className={styles.detailsModalRowSubText}>
                {addCommasToDisplayValue(data.toAmount, 5)} {toAssetId}
              </div>
            </div>
          ) : null}

          {data.exchangeRate ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>Conversion rate:</div>
              <div className={styles.detailsModalRowSubText}>
                1 {data.fromAssetId} = {addCommasToDisplayValue(data.exchangeRate, 5)} {data.toAssetId}
              </div>
            </div>
          ) : null}

          {fee ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>Fee:</div>
              <div className={styles.detailsModalRowSubText}>
                {fee} {feeAssetId}
              </div>
            </div>
          ) : null}

          {moreDetails?.blockchainHash ? (
            <div className={styles.detailsModalRow}>
              <div className={styles.detailsModalRowText}>Blockchain hash:</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className={styles.detailsModalRowSubText}>{formatBlockchainHash(moreDetails.blockchainHash)}</div>
                <div className={styles.iconWrap} onClick={handleLink}>
                  <img src={linkSvg} alt='' />
                </div>
                <div className={styles.iconWrap} onClick={() => handleCopy(moreDetails.blockchainHash)}>
                  {isCopied ? (
                    <CheckedIcon fill='var(--mainBlue)' />
                  ) : (
                    <CopyIcon isMobile={true} fill='var(--mainBlue)' />
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.detailsModalRow}>
            <div className={styles.detailsModalRowText}>Status:</div>
            <div className={styles.detailsModalRowSubText}>{statusForDisplay}</div>
          </div>

          {isLoading ? (
            <div className={styles.rowLoading}>
              <span className='spinner-border' />
            </div>
          ) : null}
        </div>
      </div>

      <button onClick={() => Modal.close()} className='btn-biz blue'>
        Close
      </button>
    </div>
  )
}
