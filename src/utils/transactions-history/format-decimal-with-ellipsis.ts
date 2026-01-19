/**
 * Formats a decimal number represented as a string to display a user-friendly version.
 *
 * - If the number starts with "0." and its decimal part begins with "00",
 *   followed by additional digits, it truncates the number to "0.00..." to indicate
 *   that there are more insignificant digits.
 * - If the number starts with "0." but does not meet the above condition,
 *   it returns the number as is.
 * - For numbers greater than or equal to 1, it returns the original value without changes.
 *
 * Example:
 *   formatDecimalWithEllipsis('0.000014'); // '0.00...'
 *   formatDecimalWithEllipsis('0.001');    // '0.00...'
 *   formatDecimalWithEllipsis('0.07666139'); // '0.076'
 *   formatDecimalWithEllipsis('1.000013'); // '1.000013'
 *   formatDecimalWithEllipsis('0.00');    // '0.00'
 *
 * @param {string} value - The decimal number as a string.
 * @returns {string} - The formatted string with or without ellipsis.
 */

export const formatDecimalWithEllipsis = (value: string): string => {
  if (value.startsWith('0.')) {
    const decimalPart = value.slice(2)

    if (decimalPart.startsWith('00') && decimalPart.length > 2) {
      return '0.00...'
    }

    return value
  }

  return value
}
