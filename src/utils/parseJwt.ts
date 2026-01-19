export function parseJwt(token: string) {
  // Проверяем, содержит ли токен три части, разделенные точками
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null // Возвращаем null, если формат не соответствует ожидаемому
  }

  try {
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (e) {
    // Возвращаем null, если произошла ошибка при разборе токена
    return null
  }
}
