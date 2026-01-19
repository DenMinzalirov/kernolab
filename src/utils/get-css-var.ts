export function getCssVar(variable: string, selector = '.app'): string {
  const element = document.querySelector<HTMLElement>(selector) || document.documentElement
  return getComputedStyle(element).getPropertyValue(variable).trim()
}
