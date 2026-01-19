/**
 * Обрезает конечные нули в дробной части до значащих цифр.
 * Если fractionDigits больше, чем длина значащей дробной части, добавляет нули до нужного количества знаков.
 * Если fractionDigits меньше или равен длине значащей дробной части, не изменяет дробную часть,
 * кроме удаления конечных нулей.
 */

export const trimAndFormatDecimal = (numStr: string, fractionDigits?: number) => {
  // Если строка содержит точку (является десятичным числом)
  if (numStr.includes('.')) {
    // Удаляем все конечные нули после последней значащей цифры
    numStr = numStr.replace(/(\.\d*?[1-9])0+$/, '$1')

    // Если строка заканчивается на точку (например, '123.'), удаляем её
    numStr = numStr.replace(/\.$/, '')

    // Если после удаления нулей у нас остается что-то вида '90.0', то нужно оставить только '90'
    numStr = numStr.replace(/\.0+$/, '')
  }

  // Обработка в случае, если fractionDigits равен 0
  if (fractionDigits === 0) {
    // Проверяем, является ли число целым (без дробной части)
    const [integerPart, fractionalPart = ''] = numStr.split('.')

    // Если дробной части нет, возвращаем только целую часть
    if (fractionalPart === '') {
      return integerPart
    }

    // Если дробная часть есть, возвращаем исходное число
    return numStr
  }

  // Применяем `fractionDigits`, только если он задан и больше 0
  if (typeof fractionDigits === 'number' && fractionDigits > 0) {
    const [integerPart, fractionalPart = ''] = numStr.split('.')

    // Удаляем конечные нули и сохраняем значащую дробную часть
    const trimmedFractional = fractionalPart.replace(/0+$/, '')

    // Если длина значащей дробной части меньше `fractionDigits`, добавляем нули
    if (trimmedFractional.length < fractionDigits) {
      numStr = `${integerPart}.${trimmedFractional.padEnd(fractionDigits, '0')}`
    } else {
      // Если дробная часть уже соответствует требованию, просто оставляем ее как есть
      numStr = `${integerPart}.${trimmedFractional}`
    }
  }

  return numStr
}
