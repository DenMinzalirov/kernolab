export const validateHintPassword = (data: string): boolean | string => {
  const errorArray = []

  const regex8Characters = /^.{8,}$/
  const isMin8Characters = regex8Characters.test(data)
  if (!isMin8Characters) errorArray.push('Min 8 characters')

  const regexOneUppercase = /.*[A-Z].*/
  const isOneUppercase = regexOneUppercase.test(data)
  if (!isOneUppercase) errorArray.push('One Uppercase')

  const regexOneLowercase = /.*[a-z].*/
  const isOneLowercase = regexOneLowercase.test(data)
  if (!isOneLowercase) errorArray.push('One Lowercase')

  const regexOneNumber = /\d+/
  const isOneNumber = regexOneNumber.test(data)
  if (!isOneNumber) errorArray.push('One Number')

  const regexOneSign = /[\W_]/
  const isOneSign = regexOneSign.test(data)
  if (!isOneSign) errorArray.push('One Sign')

  const errorStrings = errorArray.join(',')

  return !errorArray.length ? true : errorStrings
}
