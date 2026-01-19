export const getStatusIndicatorColor = (txnStatus: string, variant: 'primary' | 'secondary' = 'primary') => {
  const statusColors: { [key: string]: string } = {
    REFUSED: 'red',
    CANCELED: 'red',
    COMPLETED: 'green',
  }
  if (variant === 'secondary') {
    return statusColors[txnStatus] || 'green10'
  }
  return statusColors[txnStatus] || 'green'
}
