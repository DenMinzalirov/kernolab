type CloseIconProps = {
  className?: string
}

export function CloseIcon({ className }: CloseIconProps) {
  return (
    <svg
      className={className}
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}
