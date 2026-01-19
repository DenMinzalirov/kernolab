export interface ModalOptions {
  title?: string
  variant?: 'right' | 'center' | 'right-top' | 'down-mobile'
  isFullScreen?: boolean
  centerMobileFix?: boolean

  ////

  delayClose?: number
  noPadding?: boolean
  noClose?: boolean
  redirect?: boolean
  className?: string
  topFixed?: boolean // фиксация модалки на 100px от верхней части экрана
  customCloseModal?: () => void
  loader?: boolean
  maxWidth?: string

  /*
  окно на всю высоту
  all - без отступа снизу
  content - c отступом
  растягивается снизу вверх по содержимому до хеадера
  (будет работать только для моб режима)
 */
  fullSize?: 'all' | 'content'
  onlyMobile?: boolean // модалка будет закрыватся при именении рамеров экрана до десктопа
  onlyDesktop?: boolean // модалка будет закрыватся при именении рамеров экрана до мобильной
  drawer?: boolean // для всплывающих компонентов не на всю высоту
}

export interface ModalLayoutProps extends ModalOptions {
  closeModal: () => void
  children: React.ReactNode
}
