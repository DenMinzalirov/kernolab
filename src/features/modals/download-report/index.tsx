import { useCallback, useState } from 'react'
// @ts-ignore
import { CSVLink } from 'react-csv'
import moment from 'moment/moment'
import clsx from 'clsx'

import { FilterOptionsPairsType } from 'features/txn-history-filters-pairs'
import { handleError } from 'utils/error-handler'
import downloadIcon from 'assets/icons/download-icon.svg'

import { MiniButton } from '../../../components/mini-button'
import { NoResultsFilter } from '../../../components/no-results-filter'
import { isBiz } from '../../../config'
import { useCurrentBreakpointPairs } from '../../../hooks/use-current-breakpoint-pairs'
import { GetOperationHistoryParams, ReportServices } from '../../../wip/services/reports'
import { OperationType } from '../../../wip/services/transactions-new'
import { TYPE_TXN_HISTORY } from '../../transactions-history/constants'
import { FilterOptionsType } from '../transaction-filter'
import { FilterBar } from '../transaction-filter/filter-bar'
import { convertToTableFormat } from './helps/convertToTableFormat'
import stylesFideum from './styles.module.scss'
import stylesBiz from './styles-biz.module.scss'

const FORMAT_DATE = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'

const STEPS = {
  FILTER: 'FILTER',
  DOWNLOAD: 'DOWNLOAD',
}

type Props = {
  transactionType: string
  filterOptions?: FilterOptionsPairsType[]
}

export function DownloadReportModal({ filterOptions, transactionType }: Props) {
  const [selectedDate, setSelectedDate] = useState('')
  const [currentFilterOptions, setCurrentFilterOptions] = useState<FilterOptionsType[]>(filterOptions || [])
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<Record<string, any>>({})
  const [step, setStep] = useState(STEPS.FILTER)

  const styles = isBiz ? stylesBiz : stylesFideum

  const { isMobilePairs } = useCurrentBreakpointPairs()

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  function formatDateFilterToISO(obj: { from: string; to: string }) {
    if (!obj.from && !obj.to) return ''
    const fromDate = obj.from ? moment(obj.from, 'DD/MM/YY') : moment()
    const toDate = obj.to ? moment(obj.to, 'DD/MM/YY') : moment()

    const isoFromDate = fromDate.toISOString()
    const isoToDate = toDate.toISOString()

    return `${isoFromDate} - ${isoToDate}`
  }

  const handleDateButtonPress = (label: string) => {
    setSelectedDate(label)
    const now = new Date()
    let fromDate
    const toDate = now

    switch (label) {
      case 'Last month':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'Last quarter':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case 'Last year':
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        fromDate = toDate
        break
    }

    const formattedFrom = formatDate(fromDate)
    const formattedTo = formatDate(toDate)

    const options: FilterOptionsType[] = []
    const dateString = formatDateFilterToISO({ from: formattedFrom, to: formattedTo })
    dateString && options.push({ field: 'TIME', value: dateString })

    setCurrentFilterOptions(options)
  }

  const handleCancelFilter = () => {} //TODO add function delete filter option

  const parseFilters = useCallback(() => {
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
              case 'Reward':
              case 'Earning Reward':
              case 'Campaign Reward':
                operationTypes.push(OperationType.REWARD)
                break
              case 'Cashback':
                operationTypes.push(OperationType.CASHBACK)
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
              case 'Staking Reward':
                operationTypes.push(OperationType.STAKING_REWARD)
                break
              default:
                break
            }
          } else if (transactionType === TYPE_TXN_HISTORY.BIZ) {
            switch (value) {
              case 'Send Fiat':
                operationTypes.push(OperationType.FIAT_WITHDRAW)
                break
              case 'Receive Fiat':
                operationTypes.push(OperationType.FIAT_DEPOSIT)
                break
              case 'Receive Crypto':
                operationTypes.push(OperationType.CRYPTO_DEPOSIT)
                break
              case 'Send Crypto':
                operationTypes.push(OperationType.CRYPTO_WITHDRAW)
                break
              case 'OTC Trade':
                operationTypes.push(OperationType.OTC_DEPOSIT)
                operationTypes.push(OperationType.OTC_REFUND)
                operationTypes.push(OperationType.OTC_EXCHANGE)
                break
              //TODO  add operationTypes.push(OperationType.EXCHANGE)

              //
              // case 'Exchange':
              //   operationTypes.push(OperationType.EXCHANGE)
              //   break

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
  }, [currentFilterOptions, transactionType])

  const fetchPaginatedData = async (fetchFunction: any, requestData: GetOperationHistoryParams) => {
    let currentPage = 0
    let totalPages = 1
    const allData = []

    while (currentPage < totalPages) {
      const response = await fetchFunction({ ...requestData, page: currentPage })
      const { content, totalPages: fetchedTotalPages } = response

      if (content && content.length) {
        allData.push(...content) // Добавляем данные текущей страницы
      }

      totalPages = fetchedTotalPages || 1 // Обновляем общее количество страниц
      currentPage += 1 // Переходим на следующую страницу
    }

    return allData
  }

  const handleDownload = async () => {
    setIsLoading(true)
    const { fromDate, toDate, assetIds, operationTypes } = parseFilters()

    // TODO без : any[] ошибка несоответствие типов между operationTypesArray и operationTypes
    const operationTypesArray: any[] = []

    if (operationTypes.length) {
      operationTypesArray.push(...operationTypes)
    } else if (transactionType === TYPE_TXN_HISTORY.CRYPTO) {
      operationTypesArray.push(
        OperationType.CRYPTO_DEPOSIT,
        OperationType.CRYPTO_WITHDRAW,
        OperationType.EXCHANGE,
        OperationType.LAUNCHPAD_CLAIM_REFUND,
        OperationType.LAUNCHPAD_CLAIM_TOKEN,
        OperationType.LAUNCHPAD_STAKE_ALLOCATION,
        OperationType.REWARD
      )
    } else if (transactionType === TYPE_TXN_HISTORY.BIZ) {
      operationTypesArray.push(
        OperationType.FIAT_DEPOSIT,
        OperationType.FIAT_WITHDRAW,
        OperationType.CRYPTO_DEPOSIT,
        OperationType.CRYPTO_WITHDRAW,
        OperationType.EXCHANGE,
        OperationType.OTC_DEPOSIT,
        OperationType.OTC_REFUND,
        OperationType.OTC_EXCHANGE
      )
    } else if (transactionType === TYPE_TXN_HISTORY.FIAT) {
      operationTypesArray.push(OperationType.FIAT_DEPOSIT, OperationType.FIAT_WITHDRAW)
    } else if (transactionType === TYPE_TXN_HISTORY.CASHBACK) {
      operationTypesArray.push(OperationType.CASHBACK)
    } else if (transactionType === TYPE_TXN_HISTORY.STAKING) {
      operationTypesArray.push(
        OperationType.STAKING_CAMPAIGN_CLOSE,
        OperationType.STAKING_CAMPAIGN_CREATE,
        OperationType.STAKING_POS_CREATE,
        OperationType.STAKING_POS_CLOSE,
        OperationType.STAKING_ROLLING_CREATE,
        OperationType.STAKING_ROLLING_CLOSE,
        OperationType.STAKING_ROLLING_LEVELED_CREATE,
        OperationType.STAKING_ROLLING_LEVELED_CLOSE,
        OperationType.STAKING_SIMPLE_CREATE,
        OperationType.STAKING_SIMPLE_CLOSE,
        OperationType.STAKING_REWARD
      )
    }

    try {
      const requestData = {
        from: fromDate,
        to: toDate,
        operationTypes: operationTypesArray,
        assetIds: assetIds,
        page: 0,
        size: 2000,
      }

      const resultReports: Record<string, any> = {}

      if (transactionType === TYPE_TXN_HISTORY.CRYPTO) {
        const depositReport = operationTypesArray.includes(OperationType.CRYPTO_DEPOSIT)
          ? await fetchPaginatedData(ReportServices.getCryptoDepositReport, requestData)
          : []
        const withdrawalReport = operationTypesArray.includes(OperationType.CRYPTO_WITHDRAW)
          ? await fetchPaginatedData(ReportServices.getCryptoWithdrawReport, requestData)
          : []
        const exchangeReport = operationTypesArray.includes(OperationType.EXCHANGE)
          ? await fetchPaginatedData(ReportServices.getExchangeReport, requestData)
          : []
        const cashbackReport = await fetchPaginatedData(ReportServices.getCashbackReport, requestData)
        const rewardsReport = await fetchPaginatedData(ReportServices.getRewardsReport, requestData)
        const stakingRewardsReport = await fetchPaginatedData(ReportServices.getStakingRewardsReport, requestData)

        if (depositReport && depositReport.length) {
          resultReports.Deposits = convertToTableFormat(depositReport, 'CryptoDeposit')
        }

        if (withdrawalReport && withdrawalReport.length) {
          resultReports.Withdrawals = convertToTableFormat(withdrawalReport, 'CryptoWithdraw')
        }

        if (exchangeReport && exchangeReport.length) {
          resultReports.Exchanges = convertToTableFormat(exchangeReport, 'Exchange')
        }

        if (cashbackReport && cashbackReport.length) {
          resultReports.Cashbacks = convertToTableFormat(cashbackReport, 'Cashback')
        }

        if (rewardsReport && rewardsReport.length) {
          resultReports.Rewards = convertToTableFormat(rewardsReport, 'Reward')
        }

        if (stakingRewardsReport && stakingRewardsReport.length) {
          resultReports['Staking Rewards'] = convertToTableFormat(stakingRewardsReport, 'StakingReward')
        }
      }

      if (transactionType === TYPE_TXN_HISTORY.FIAT) {
        const depositReport = operationTypesArray.includes(OperationType.FIAT_DEPOSIT)
          ? await fetchPaginatedData(ReportServices.getFiatDepositsReport, requestData)
          : []
        const withdrawalReport = operationTypesArray.includes(OperationType.FIAT_WITHDRAW)
          ? await fetchPaginatedData(ReportServices.getFiatWithdrawsReport, requestData)
          : []

        if (depositReport && depositReport.length) {
          resultReports['Fiat Deposits'] = convertToTableFormat(depositReport, 'FiatDeposit')
        }

        if (withdrawalReport && withdrawalReport.length) {
          resultReports['Fiat Withdrawals'] = convertToTableFormat(withdrawalReport, 'FiatWithdraw')
        }
      }

      if (transactionType === TYPE_TXN_HISTORY.STAKING) {
        const campaignCloses = operationTypesArray.includes(OperationType.STAKING_CAMPAIGN_CLOSE)
          ? await fetchPaginatedData(ReportServices.getStakingCampaignClosesReport, requestData)
          : []
        const campaignCreates = (
          operationTypesArray.includes(OperationType.STAKING_CAMPAIGN_CREATE)
            ? await fetchPaginatedData(ReportServices.getStakingCampaignCreatesReport, requestData)
            : []
        ).map(historyItem => {
          // only for campaign fix report TASK-1162
          return { ...historyItem, amount: historyItem.increasedByAmount }
        })

        const rollingCloses = operationTypesArray.includes(OperationType.STAKING_ROLLING_CLOSE)
          ? await fetchPaginatedData(ReportServices.getStakingRollingClosesReport, requestData)
          : []
        const rollingCreates = operationTypesArray.includes(OperationType.STAKING_ROLLING_CREATE)
          ? await fetchPaginatedData(ReportServices.getStakingRollingCreatesReport, requestData)
          : []

        const rollingLeveledCloses = operationTypesArray.includes(OperationType.STAKING_ROLLING_LEVELED_CLOSE)
          ? await fetchPaginatedData(ReportServices.getStakingRollingLeveledClosesReport, requestData)
          : []
        const rollingLeveledCreates = (
          operationTypesArray.includes(OperationType.STAKING_ROLLING_LEVELED_CREATE)
            ? await fetchPaginatedData(ReportServices.getStakingRollingLeveledCreatesReport, requestData)
            : []
        ).map(historyItem => {
          // only for rolling leveled fix report TASK-1138
          return { ...historyItem, amount: historyItem.increasedByAmount }
        })

        const simpleCloses = operationTypesArray.includes(OperationType.STAKING_SIMPLE_CLOSE)
          ? await fetchPaginatedData(ReportServices.getStakingSimpleClosesReport, requestData)
          : []
        const simpleCreates = operationTypesArray.includes(OperationType.STAKING_SIMPLE_CREATE)
          ? await fetchPaginatedData(ReportServices.getStakingSimpleCreatesReport, requestData)
          : []

        const allStakingHistories = [
          ...campaignCloses,
          ...campaignCreates,
          ...rollingCloses,
          ...rollingCreates,
          ...rollingLeveledCloses,
          ...rollingLeveledCreates,
          ...simpleCloses,
          ...simpleCreates,
        ]

        if (allStakingHistories && allStakingHistories.length) {
          resultReports.Staking = convertToTableFormat(allStakingHistories, 'StakingCampaignClose')
        }

        const stakingRewards = operationTypesArray.includes(OperationType.STAKING_REWARD)
          ? await fetchPaginatedData(ReportServices.getStakingRewardsReport, requestData)
          : []

        if (stakingRewards && stakingRewards && stakingRewards.length) {
          resultReports['Staking Rewards'] = convertToTableFormat(stakingRewards, 'StakingReward')
        }
      }

      if (transactionType === TYPE_TXN_HISTORY.BIZ) {
        const fiatDepositReport = operationTypesArray.includes(OperationType.FIAT_DEPOSIT)
          ? await fetchPaginatedData(ReportServices.getFiatDepositsReport, requestData)
          : []
        const fiatWithdrawalReport = operationTypesArray.includes(OperationType.FIAT_WITHDRAW)
          ? await fetchPaginatedData(ReportServices.getFiatWithdrawsReport, requestData)
          : []

        const depositReport = operationTypesArray.includes(OperationType.CRYPTO_DEPOSIT)
          ? await fetchPaginatedData(ReportServices.getCryptoDepositReport, requestData)
          : []
        const withdrawalReport = operationTypesArray.includes(OperationType.CRYPTO_WITHDRAW)
          ? await fetchPaginatedData(ReportServices.getCryptoWithdrawReport, requestData)
          : []
        const exchangeReport = operationTypesArray.includes(OperationType.EXCHANGE)
          ? await fetchPaginatedData(ReportServices.getExchangeReport, requestData)
          : []
        const otcDepositReport = operationTypesArray.includes(OperationType.OTC_DEPOSIT)
          ? await fetchPaginatedData(ReportServices.getOTCDepositsReport, requestData)
          : []
        const otcExchangeReport = operationTypesArray.includes(OperationType.OTC_EXCHANGE)
          ? await fetchPaginatedData(ReportServices.getOTCExchangesReport, requestData)
          : []
        const otcRefundReport = operationTypesArray.includes(OperationType.OTC_REFUND)
          ? await fetchPaginatedData(ReportServices.getOTCDepositRefundsReport, requestData)
          : []

        if (fiatDepositReport && fiatDepositReport.length) {
          resultReports['Fiat Deposits'] = convertToTableFormat(fiatDepositReport, 'FiatDeposit')
        }

        if (fiatWithdrawalReport && fiatWithdrawalReport.length) {
          resultReports['Fiat Withdrawals'] = convertToTableFormat(fiatWithdrawalReport, 'FiatWithdraw')
        }

        if (depositReport && depositReport.length) {
          resultReports.Deposits = convertToTableFormat(depositReport, 'CryptoDeposit')
        }

        if (withdrawalReport && withdrawalReport.length) {
          resultReports.Withdrawals = convertToTableFormat(withdrawalReport, 'CryptoWithdraw')
        }

        if (exchangeReport && exchangeReport.length) {
          resultReports.Exchanges = convertToTableFormat(exchangeReport, 'Exchange')
        }

        if (otcDepositReport && otcDepositReport.length) {
          resultReports['OTC Deposit'] = convertToTableFormat(otcDepositReport, 'OTCDeposit')
        }
        if (otcExchangeReport && otcExchangeReport.length) {
          resultReports['OTC Exchange'] = convertToTableFormat(otcExchangeReport, 'OTCExchange')
        }
        if (otcRefundReport && otcRefundReport.length) {
          resultReports['OTC Refund'] = convertToTableFormat(otcRefundReport, 'OTCRefund')
        }
      }

      setReportData(resultReports)

      setStep(STEPS.DOWNLOAD)
    } catch (error) {
      console.log('handleDownload-ERROR', error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportData = (reportItem: string) => {
    return reportData[reportItem]
  }

  // const description = filterOptions?.length
  //   ? // eslint-disable-next-line max-len
  //     'Download transaction history report, which will include all transactions currently visible and any applied filters from:'
  //   : // eslint-disable-next-line max-len
  //     'Download transaction history report, which will include all transactions currently visible. Please select the desired period for the report.'

  const description =
    'Download transaction history report, which will include all transactions currently visible and any applied filters from:'

  return (
    <div className={styles.containerModal}>
      {step === STEPS.FILTER ? (
        <>
          <div className={styles.title}>Get Transaction History</div>
          <div className={styles.description}>{description}</div>

          {filterOptions?.length ? (
            <>
              <div className={styles.dinamicHeight} />
              <FilterBar filterOptions={filterOptions} handleCancelFilter={handleCancelFilter} isReport={true} />
            </>
          ) : (
            <>
              <div className={styles.dinamicHeight} />
              <div className={styles.buttonGroupFilter}>
                {['Last month', 'Last quarter', 'Last year'].map(title => (
                  <MiniButton
                    key={title}
                    title={title}
                    action={() => handleDateButtonPress(title)}
                    buttonActive={selectedDate === title}
                  />
                ))}
              </div>
            </>
          )}

          <div className={styles.dinamicHeight} />
          <button
            disabled={!currentFilterOptions.length || isLoading}
            style={!currentFilterOptions.length ? { opacity: 0.3 } : {}}
            className={isBiz ? 'btn-biz blue' : clsx('btn-new primary', styles.mainBtnFilters)}
            onClick={async () => {
              if (!currentFilterOptions.length || isLoading) return
              await handleDownload()
            }}
          >
            {isLoading ? (
              <span className='spinner-border' />
            ) : (
              <>
                <div>Get Report</div>
                {/*<img className={styles.btnGroupIcon} alt='icon' src={downloadIcon} />*/}
              </>
            )}
          </button>
        </>
      ) : null}

      {step === STEPS.DOWNLOAD ? (
        <>
          <div style={isMobilePairs ? {} : { textAlign: 'center' }} className={styles.title}>
            Success!
          </div>
          <div style={isMobilePairs ? {} : { textAlign: 'center' }} className={styles.description}>
            Transaction history reports are ready to be downloaded.
          </div>
          <div className={styles.downloadBtnWrap}>
            {Object.keys(reportData).length ? (
              Object.keys(reportData).map(reportItem => {
                const csvData = handleReportData(reportItem)
                const time = currentFilterOptions.find(currentFilterOption => currentFilterOption.field === 'TIME')
                const fileName = (
                  `${transactionType}_${reportItem}_transaction_report${time ? '_' + time.value : ''}` + '.csv'
                ).toLowerCase()

                return (
                  <div className={styles.downloadBtnItem} key={reportItem}>
                    <CSVLink filename={fileName} data={csvData}>
                      {reportItem}
                      <img className={styles.btnGroupIcon} alt='icon' src={downloadIcon} />
                    </CSVLink>
                  </div>
                )
              })
            ) : (
              <>{isBiz ? <div className={styles.description}>No results found.</div> : <NoResultsFilter />}</>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
