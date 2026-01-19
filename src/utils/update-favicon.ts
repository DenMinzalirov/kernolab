import { documentTitle, favicon } from 'config'

export const updateFavicon = (): void => {
  const head = document.getElementsByTagName('head')[0]
  const links = head.getElementsByTagName('link')
  const icon = favicon() ?? ''

  for (const lnk of links) {
    if (lnk.rel === 'icon') {
      head.removeChild(lnk)
    }
    const link = document.createElement('link')
    link.setAttribute('href', icon)
    link.setAttribute('type', 'image/x-icon')
    link.setAttribute('rel', 'icon')
    head.appendChild(link)
  }

  document.title = documentTitle()
}
