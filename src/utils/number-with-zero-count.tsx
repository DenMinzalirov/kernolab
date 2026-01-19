export const NumberWithZeroCount = ({ numberString }: { numberString: string }) => {
  if (!numberString) return ''
  const [integerPart, decimalPart = ''] = numberString.split('.')
  const zeroMatches = decimalPart.match(/0+/g)
  const parts = []
  let lastIndex = 0

  if (zeroMatches) {
    zeroMatches.forEach(zeros => {
      const zeroCount = zeros.length
      const zeroIndex = decimalPart.indexOf(zeros, lastIndex)

      if (zeroIndex > lastIndex) {
        parts.push(decimalPart.slice(lastIndex, zeroIndex))
      }

      if (zeroCount > 3) {
        parts.push(0)
        parts.push(<sub key={lastIndex}>{zeroCount}</sub>)
      } else {
        parts.push(zeros)
      }

      lastIndex = zeroIndex + zeroCount
    })

    if (lastIndex < decimalPart.length) {
      parts.push(decimalPart.slice(lastIndex))
    }
  } else {
    parts.push(decimalPart)
  }

  return (
    <span>
      {integerPart}
      {decimalPart && '.'}
      {parts}
    </span>
  )
}
