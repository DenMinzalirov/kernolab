export function getCurrentBreakpoint() {
  return getComputedStyle(document.documentElement).getPropertyValue('--current-breakpoint').trim().replace(/['"]/g, '')
}
