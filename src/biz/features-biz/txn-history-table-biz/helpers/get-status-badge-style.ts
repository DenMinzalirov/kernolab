export const getStatusBadgeStyle = (state: string) => {
  switch (state) {
    case 'COMPLETED':
    case 'DEFAULT':
      return 'statusBadgeGreen'
    case 'REFUSED':
      return 'statusBadgeRed'
    case 'PENDING':
      return 'statusBadgeYellow'
    default:
      return ''
  }
}
