type MenuIconProps = {
  className?: string
}

export function MenuIcon({ className }: MenuIconProps) {
  return (
    <svg
      className={className}
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M4 6h12M4 10h12M4 14h12' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}
