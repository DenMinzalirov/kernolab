type ReportType =
  | 'CryptoWithdraw'
  | 'CryptoDeposit'
  | 'Exchange'
  | 'Cashback'
  | 'Reward'
  | 'StakingReward'
  | 'FiatDeposit'
  | 'FiatWithdraw'
  | 'StakingCampaignClose'
  | 'OTCDeposit'
  | 'OTCRefund'
  | 'OTCExchange'

const headersMap: Record<ReportType, string[]> = {
  CryptoWithdraw: [
    'asset_id',
    'total_amount',
    'network_id',
    'recipient_wallet_address',
    'status',
    'reject_reason',
    'blockchain_hash',
    'transaction_time',
  ],
  CryptoDeposit: [
    'asset_id',
    'network_id',
    'recipient_wallet_address',
    'total_amount',
    'blockchain_hash',
    'transaction_time',
  ],
  Exchange: ['from_asset_id', 'to_asset_id', 'from_amount', 'to_amount', 'rate', 'transaction_time'],
  Cashback: ['reward_type', 'asset_id', 'amount', 'operation_time'],
  Reward: ['reward_type', 'asset_id', 'amount', 'operation_time'],
  StakingReward: ['rewardName', 'stakingType', 'asset_id', 'amount', 'operationTime'],
  FiatDeposit: ['asset_id', 'amount', 'payerIban', 'payerName', 'operationTime'],
  FiatWithdraw: ['asset_id', 'amount', 'fee', 'iban', 'status', 'operationTime'],
  StakingCampaignClose: ['asset_id', 'total_amount', 'staking_type', 'operationTime'],

  OTCDeposit: ['otc_request_id', 'asset_from_id', 'asset_to_id', 'from_amount'],
  OTCRefund: [
    'otc_request_id',
    'asset_from_id',
    'asset_to_id',
    'from_amount',
    'to_total_amount',
    'to_fee_amount',
    'to_amount',
    'rate',
  ],
  OTCExchange: [
    'otc_request_id',
    'asset_from_id',
    'asset_to_id',
    'from_amount',
    'to_total_amount',
    'to_fee_amount',
    'to_amount',
    'rate',
  ],
}

const extractDataMap: Record<ReportType, (item: any) => any[]> = {
  CryptoWithdraw: item => [
    item.assetId || '',
    item.amount || '',
    item.networkId || '',
    item.destinationAddress || '',
    item.withdrawStatus || '',
    item.rejectReason || '',
    item.blockchainHash || '',
    item.operationTime || '',
  ],
  CryptoDeposit: item => [
    item.assetId || '',
    item.networkId || '',
    item.targetAddress || '',
    item.amount || '',
    item.blockchainHash || '',
    item.operationTime || '',
  ],
  Exchange: item => [
    item.fromAssetId || '',
    item.toAssetId || '',
    item.fromAmount || '',
    item.toAmount || '',
    item.exchangeRate || '',
    item.operationTime || '',
  ],
  Cashback: item => [
    item.operationType || '',
    item.cashbackAssetId || '',
    item.cashbackAmount || '',
    item.operationTime || '',
  ],
  Reward: item => [item.rewardName || '', item.assetId || '', item.amount || '', item.operationTime || ''],
  StakingReward: item => [
    item.rewardName || '',
    item.stakingType || '',
    item.assetId || '',
    item.amount || '',
    item.operationTime || '',
  ],
  FiatDeposit: item => [
    item.assetId || '',
    item.amount || '',
    item.payerIban || '',
    item.payerName || '',
    item.operationTime || '',
  ],
  FiatWithdraw: item => [
    item.assetId || '',
    item.amount || '',
    item.fee || '',
    item.iban || '',
    item.withdrawStatus || '',
    item.operationTime || '',
  ],
  StakingCampaignClose: item => [
    item.assetId || '',
    item.amount || '',
    item.operationType || '',
    item.operationTime || '',
  ],

  OTCDeposit: item => [item.otcRequestId || '', item.assetFromId || '', item.assetToId || '', item.fromAmount || ''],
  OTCRefund: item => [
    item.otcRequestId || '',
    item.assetFromId || '',
    item.assetToId || '',
    item.fromAmount || '',
    item.toTotalAmount || '',
    item.toFeeAmount || '',
    item.toAmount || '',
    item.rate || '',
  ],
  OTCExchange: item => [
    item.otcRequestId || '',
    item.assetFromId || '',
    item.assetToId || '',
    item.fromAmount || '',
    item.toTotalAmount || '',
    item.toFeeAmount || '',
    item.toAmount || '',
    item.rate || '',
  ],
}

export const convertToTableFormat = (data: any[], reportType: ReportType) => {
  const header = headersMap[reportType]
  const result = [header]

  data.forEach(item => {
    const row = extractDataMap[reportType](item)
    result.push(row)
  })

  return result
}
