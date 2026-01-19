export function getCurrentBreakpointPairs() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--current-breakpoint-pairs')
    .trim()
    .replace(/['"]/g, '')
}
