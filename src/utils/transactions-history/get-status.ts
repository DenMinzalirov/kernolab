export const getStatus = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'

    case 'PENDING':
    case 'TRAVEL_RULE_PENDING':
      return 'Pending'

    case 'REFUSED':
    case 'CANCELED':
      return 'Refused'

    default: {
      return status
    }
  }
}
