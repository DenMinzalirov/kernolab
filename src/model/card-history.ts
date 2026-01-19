import { createEffect, createEvent, createStore } from 'effector'

import { getGroupIconForTxnHistory } from 'features/modals/transaction-filter/get-group-icon-by-code'
import { TYPE_TXN_HISTORY } from 'features/transactions-history/constants'
import { AccountStatementRecord, CardHistoryQueryParams, CardService } from 'wip/services'

export type ExtendedAccountStatementRecord = AccountStatementRecord & {
  transactionType: string
  icon: string
}
export const RECORD_COUNT = 50

export const queryParamsDefault: CardHistoryQueryParams = {
  fromRecord: 0,
  recordsCount: RECORD_COUNT,
  fromDate: null,
  toDate: null,
  includeAuthorizations: true,
  includeTransactions: false,
  includeAccountAdjustments: true,
  includeFees: true,
  excludeDeclinedAuthorizations: false,
  excludeReversedAuthorizations: false,
  excludeClearedAuthorizations: false,
  excludePendingAuthorizations: false,
  excludeStatusAuthorizations: false,
  excludePendingFees: false,
  excludeClearedFees: false,
  excludeDeclinedFees: false,
  mergeFees: false,
  searchKeyword: null,
  statuses: null,
  merchantCategoryCodes: null,
  merchantCategoryTypes: null,
  adjustmentType: null,
}

export const $cardHistoryByFilter = createStore<ExtendedAccountStatementRecord[]>([])
// TODO Andrey not use ? $cardHistoryQueryParams cardHistoryQueryParamsEv
export const $cardHistoryQueryParams = createStore<CardHistoryQueryParams>(queryParamsDefault)

export const cardHistoryQueryParamsEv = createEvent<CardHistoryQueryParams>()
export const getCardHistoryByFilterFx = createEffect(async (queryParams: CardHistoryQueryParams) => {
  try {
    const history = await CardService.getCardHistoryByFilter(queryParams)

    const preparedRecords = history.map(record => ({
      ...record,
      transactionType: TYPE_TXN_HISTORY.CARD,
      icon: getGroupIconForTxnHistory(record),
    }))

    return preparedRecords
  } catch (error) {
    console.log('ERROR-getCardHistoryByFilter', error)
    throw error
  }
})

$cardHistoryByFilter.on(getCardHistoryByFilterFx.doneData, (_, repos) => repos)
