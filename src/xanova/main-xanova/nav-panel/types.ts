export type SubItemIcon = 'support' | 'logout'

export type SubItem = {
  id: string
  label: string
  path: string
  icon?: SubItemIcon
}

export type NavItem = {
  id: string
  path: string
  label: string
  submenu: SubItem[]
  isButton?: boolean
  icon?: 'settings' | 'profile'
  dropdownTone?: 'light' | 'dark'
  align?: 'left' | 'right'
}
