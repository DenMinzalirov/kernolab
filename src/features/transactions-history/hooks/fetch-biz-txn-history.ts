import { OperationType, TransactionsNewServices } from 'wip/services/transactions-new'

export const fetchBizTransactionHistory = async (groupedByOperationType: Record<string, number[]>) => {
  const operationMappings = [
    { type: OperationType.CRYPTO_DEPOSIT, service: TransactionsNewServices.getDepositHistory },
    { type: OperationType.FIAT_DEPOSIT, service: TransactionsNewServices.getDepositHistory },
    { type: OperationType.EXCHANGE, service: TransactionsNewServices.getExchangeHistory },
    { type: OperationType.CRYPTO_WITHDRAW, service: TransactionsNewServices.getWithdrawHistory },
    { type: OperationType.FIAT_WITHDRAW, service: TransactionsNewServices.getWithdrawHistory },
    { type: OperationType.OTC_DEPOSIT, service: TransactionsNewServices.otcDepositHistory },
    { type: OperationType.OTC_EXCHANGE, service: TransactionsNewServices.otcExchangeHistory },
    { type: OperationType.OTC_REFUND, service: TransactionsNewServices.otcDepositRefundHistory },
  ]

  const results = await Promise.all(
    operationMappings.map(({ type, service }) =>
      groupedByOperationType[type] ? service(groupedByOperationType[type]) : []
    )
  )

  return results
}
