import moment from 'moment'

import { FilterOptionsType } from 'features/modals/transaction-filter'
import { OperationType } from 'wip/services/transactions-new'

import { TYPE_TXN_HISTORY } from '../constants'

const FORMAT_DATE = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'

export const parseFilters = (currentFilterOptions: FilterOptionsType[], transactionType: string) => {
  const dateNow = moment().format(FORMAT_DATE)
  let fromDate = moment('2020-01-01').format(FORMAT_DATE)
  let toDate = dateNow

  const assetIds: string[] = []
  const operationTypes: OperationType[] = []

  currentFilterOptions.forEach(({ field, value }) => {
    switch (field) {
      case 'ASSET_TYPE':
        assetIds.push(value)
        break
      case 'TIME': {
        const [from, to] = value.split(' - ')
        fromDate = moment(from).startOf('day').format(FORMAT_DATE) || fromDate
        let formattedToDate = moment(to).endOf('day').format(FORMAT_DATE)

        if (moment(formattedToDate).isAfter(moment())) {
          formattedToDate = moment().format(FORMAT_DATE)
        }
        toDate = formattedToDate || toDate
        break
      }
      case 'TRANSACTION_TYPE':
        if (transactionType === TYPE_TXN_HISTORY.CRYPTO) {
          switch (value) {
            case 'Deposit':
              operationTypes.push(OperationType.CRYPTO_DEPOSIT)
              break
            case 'Withdrawal':
              operationTypes.push(OperationType.CRYPTO_WITHDRAW)
              break
            case 'Exchange':
              operationTypes.push(OperationType.EXCHANGE)
              break
            case 'Earning Reward':
              operationTypes.push(OperationType.STAKING_REWARD)
              break
            case 'Referral Bonus':
              operationTypes.push(OperationType.REWARD)
              break
            case 'Token Claim':
              operationTypes.push(OperationType.LAUNCHPAD_CLAIM_TOKEN)
              break
            case 'Refund Claim':
              operationTypes.push(OperationType.LAUNCHPAD_CLAIM_REFUND)
              break
            case 'Stake Allocation':
              operationTypes.push(OperationType.LAUNCHPAD_STAKE_ALLOCATION)
              break
            case 'Refund':
              operationTypes.push(OperationType.CASHBACK)
              break
            case 'Campaign Reward':
              operationTypes.push(OperationType.STAKING_CAMPAIGN_CREATE)
              operationTypes.push(OperationType.STAKING_CAMPAIGN_CLOSE)
              break
            default:
              break
          }
        } else if (transactionType === TYPE_TXN_HISTORY.FIAT) {
          switch (value) {
            case 'Top Up':
              operationTypes.push(OperationType.FIAT_DEPOSIT)
              break
            case 'Withdrawal':
              operationTypes.push(OperationType.FIAT_WITHDRAW)
              break
            default:
              break
          }
        } else if (transactionType === TYPE_TXN_HISTORY.STAKING) {
          switch (value) {
            case 'Staking':
              operationTypes.push(
                OperationType.STAKING_CAMPAIGN_CREATE,
                OperationType.STAKING_POS_CREATE,
                OperationType.STAKING_ROLLING_CREATE,
                OperationType.STAKING_ROLLING_LEVELED_CREATE,
                OperationType.STAKING_SIMPLE_CREATE
              )
              break
            case 'Claiming':
              operationTypes.push(
                OperationType.STAKING_CAMPAIGN_CLOSE,
                OperationType.STAKING_POS_CLOSE,
                OperationType.STAKING_ROLLING_CLOSE,
                OperationType.STAKING_ROLLING_LEVELED_CLOSE,
                OperationType.STAKING_SIMPLE_CLOSE
              )
              break
            case 'Supercharge Staked':
              operationTypes.push(OperationType.STAKING_CAMPAIGN_CREATE)
              break
            case 'Supercharge Claimed':
              operationTypes.push(OperationType.STAKING_CAMPAIGN_CLOSE)
              break
            case 'FI Staked':
              operationTypes.push(OperationType.STAKING_ROLLING_LEVELED_CREATE)
              break
            case 'FI Claimed':
              operationTypes.push(OperationType.STAKING_ROLLING_LEVELED_CLOSE)
              break
            case 'Fideum Earn Staked':
              operationTypes.push(OperationType.STAKING_SIMPLE_CREATE)
              break
            case 'Fideum Earn Claimed':
              operationTypes.push(OperationType.STAKING_SIMPLE_CLOSE)
              break
            case 'Staking Reward':
              operationTypes.push(OperationType.STAKING_REWARD)
              break
            default:
              break
          }
        } else if (transactionType === TYPE_TXN_HISTORY.BIZ) {
          switch (value) {
            case 'Receive Crypto':
              operationTypes.push(OperationType.CRYPTO_DEPOSIT)
              break
            case 'Send Crypto':
              operationTypes.push(OperationType.CRYPTO_WITHDRAW)
              break
            case 'Receive Fiat':
              operationTypes.push(OperationType.FIAT_DEPOSIT)
              break
            case 'Send Fiat':
              operationTypes.push(OperationType.FIAT_WITHDRAW)
              break
            case 'Exchange':
              operationTypes.push(OperationType.EXCHANGE)
              break
            default:
              break
          }
        }
        break
      default:
        break
    }
  })

  return { fromDate, toDate, assetIds, operationTypes }
}
