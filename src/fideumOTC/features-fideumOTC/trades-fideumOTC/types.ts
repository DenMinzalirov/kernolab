// export interface TradeData {
//   tradeUuid: string
//   status: string
//   clientUuid: string
//   liquidityProvider: string
//   instrument: string
//   side: 'BUY' | 'SELL'
//   amount: string
//   expectedExecutionPrice: string
//   slippagePercent: string
//   clientPrice: string
//   executedPrice: string
//   createdAt: string
//   updatedAt: string
// }

import { OTCTrade } from '../../../wip/services/fideumOTC-services/OTC-trade'

export interface ColumnConfig {
  key: keyof OTCTrade
  label: string
  width: number
  visible: boolean
  formatter?: (value: any) => string
}

// export interface TradesResponse {
//   totalElements: number
//   totalPages: number
//   size: number
//   content: TradeData[]
//   number: number
//   sort: {
//     empty: boolean
//     sorted: boolean
//     unsorted: boolean
//   }
//   first: boolean
//   last: boolean
//   numberOfElements: number
//   pageable: {
//     offset: number
//     sort: {
//       empty: boolean
//       sorted: boolean
//       unsorted: boolean
//     }
//     pageSize: number
//     pageNumber: number
//     paged: boolean
//     unpaged: boolean
//   }
//   empty: boolean
// }

export type LocalTradeData = OTCTrade & {
  profit?: number
}

export interface ExtendedColumnConfig extends Omit<ColumnConfig, 'key'> {
  key: keyof LocalTradeData
  sortable?: boolean
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  column: keyof LocalTradeData | null
  direction: SortDirection
}
