import type { ReactNode } from 'react'

/**
 * Dual-unit display: metric first (what BMR and its screenshots use), the imperial
 * equivalent in parentheses as an approximation. Registered as a global MDX component,
 * so pages write `<U m2={175} />` with no import.
 *
 *   <U m={1} />            → 1 m (≈3.3 ft)
 *   <U m2={175} />         → 175 m² (≈1,880 sq ft)
 *   <U m2={[20, 40]} />    → 20–40 m² (≈215–430 sq ft)
 *   <U m3={500} />         → 500 m³ (≈17,700 cu ft)
 *   <U mm={45} />          → 45 mm (≈1.8 in)
 *   <U cm={30} />          → 30 cm (≈12 in)
 */
type Value = number | [number, number]

const KINDS = {
  m: { factor: 3.28084, metric: 'm', imperial: 'ft', sig: 2 },
  m2: { factor: 10.7639, metric: 'm²', imperial: 'sq ft', sig: 3 },
  m3: { factor: 35.3147, metric: 'm³', imperial: 'cu ft', sig: 3 },
  cm: { factor: 0.393701, metric: 'cm', imperial: 'in', sig: 2 },
  mm: { factor: 0.0393701, metric: 'mm', imperial: 'in', sig: 2 },
} as const
type Kind = keyof typeof KINDS

const metricFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const sig = (digits: number) => new Intl.NumberFormat('en-US', { maximumSignificantDigits: digits })

export default function U(props: Partial<Record<Kind, Value>> & { children?: ReactNode }): ReactNode {
  const kind = (Object.keys(KINDS) as Kind[]).find((k) => props[k] !== undefined)
  if (!kind) return props.children ?? null
  const { factor, metric, imperial, sig: digits } = KINDS[kind]
  const v = props[kind]!
  const values: [number, number] | [number] = Array.isArray(v) ? v : [v]
  const show = (vals: number[], f: Intl.NumberFormat, convert = false) =>
    vals.map((x) => f.format(convert ? x * factor : x)).join('–')
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {show(values as number[], metricFmt)} {metric}{' '}
      <span style={{ color: 'var(--ifm-color-emphasis-600)' }}>
        (≈{show(values as number[], sig(digits), true)} {imperial})
      </span>
    </span>
  )
}
