/* eslint-disable max-len */
import { SVGProps } from 'react'

export function Icon({ fill, stroke, ...props }: SVGProps<SVGSVGElement>) {
  return <svg {...props} />
}
