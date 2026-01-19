export function errorDescriptionHandler(code: string): string {
  // TODO: set t()
  switch (code) {
    case 'NOT_EXISTS_USER':
      return "This user doesn't exist."

    case 'INCORRECT_CREDENTIALS':
      return 'Your email or password is incorrect. Please try again.'

    case 'USER_ALREADY_EXISTS':
      return 'Your email is already registered. Please login using this email.'

    case 'INCORRECT_CONFIRMATION_CODE':
      return 'Your confirmation code is incorrect. Please try again.'

    default:
      return code || ''
  }
}
