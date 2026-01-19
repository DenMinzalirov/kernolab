export const getStatusTextForDisplay = (state: string) => {
  switch (state) {
    case 'COMPLETED':
      return 'Completed'
    case 'REFUSED':
      return 'Cancelled'
    case 'PENDING':
      return 'Pending'
    default:
      return 'Completed' //'Unknown'
  }
}
