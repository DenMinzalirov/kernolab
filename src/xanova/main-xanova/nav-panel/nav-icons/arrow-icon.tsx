type ArrowIconProps = {
  className?: string
}

export function ArrowIcon({ className }: ArrowIconProps) {
  return (
    <svg
      className={className}
      width='12'
      height='13'
      viewBox='0 0 12 13'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M2.625 4.753 6 8.154l3.375-3.401'
        stroke='currentColor'
        strokeWidth='1.127'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
