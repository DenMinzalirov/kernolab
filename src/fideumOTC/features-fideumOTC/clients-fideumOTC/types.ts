import { OTCClient } from '../../../wip/services/fideumOTC-services/OTC-trade'

export enum OTCClientStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export interface ClientData extends OTCClient {
  clientTrades: string
}

export interface ColumnConfig {
  key: keyof ClientData
  label: string
  width: number
  visible: boolean
  formatter?: (value: any) => string
}
