export function getCurrentBreakpointXanova() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--current-breakpoint-xanova')
    .trim()
    .replace(/['"]/g, '')
}
