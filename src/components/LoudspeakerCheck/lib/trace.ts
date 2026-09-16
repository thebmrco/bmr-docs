import type { TraceLine } from './types'

/** One line of the working as a single LaTeX string: the formula with its result appended. */
export function lineTex(t: TraceLine): string {
  return `${t.tex} ${t.result_tex ?? `= \\textbf{${t.value}}`}`
}
