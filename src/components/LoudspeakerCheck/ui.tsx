import type { InputHTMLAttributes, ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import styles from './styles.module.css'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

export function Card({ children, flush = false }: { children: ReactNode; flush?: boolean }) {
  return <section className={cx(styles.card, flush && styles.cardFlush)}>{children}</section>
}

export function CardTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className={styles.cardTitle}>
      <h2>{title}</h2>
      {sub && <p className={styles.cardSub}>{sub}</p>}
    </header>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {hint && <span className={styles.fieldHint}>{hint}</span>}
      <div className={styles.fieldBody}>{children}</div>
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={styles.input} />
}

export function NumberInput({
  value,
  onChange,
  suffix,
  ...rest
}: {
  value: number | null
  onChange: (v: number | null) => void
  suffix?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <div className={styles.inputWrap}>
      <input
        {...rest}
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={cx(styles.input, styles.tnum, suffix && styles.inputSuffixed)}
      />
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </div>
  )
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.input}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick} className={cx(styles.chip, active && styles.chipActive)}>
      {children}
    </button>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'warn' | 'good' | 'bad'; children: ReactNode }) {
  const t = { neutral: styles.badgeNeutral, good: styles.badgeGood, warn: styles.badgeWarn, bad: styles.badgeBad }[tone]
  return <span className={cx(styles.badge, t)}>{children}</span>
}

/** A collapsed section that states its current value on the summary line. */
export function Disclosure({ summary, detail, children, open }: { summary: string; detail?: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className={styles.disclosure}>
      <summary className={styles.summary}>
        <span className={styles.summaryText}>
          <span className={styles.summaryTitle}>{summary}</span>
          {detail && <span className={styles.summaryDetail}>{detail}</span>}
        </span>
        <ChevronDown size={16} className={styles.chevron} aria-hidden />
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  )
}

/** Expert detail behind a click, with an icon in the summary like the docs' own collapsible blocks. */
export function Details({ summary, icon: Icon, children, open }: { summary: string; icon?: LucideIcon; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className={styles.details}>
      <summary className={styles.summary}>
        {Icon && <Icon size={18} color="var(--ifm-color-primary)" aria-hidden />}
        <span className={cx(styles.summaryText, styles.detailsTitle)}>{summary}</span>
        <ChevronDown size={16} className={styles.chevron} aria-hidden />
      </summary>
      <div className={styles.detailsBody}>{children}</div>
    </details>
  )
}

/**
 * Two-handle slider on a logarithmic frequency axis, so every octave is the same width. A value of 0 means
 * "not entered yet": the handles sit at the ends, greyed, and the first drag sets both.
 */
export function LogRangeSlider({ low, high, min, max, onChange }: { low: number; high: number; min: number; max: number; onChange: (low: number, high: number) => void }) {
  const STEPS = 1000
  const unset = !(low > 0 && high > 0)
  const toPos = (f: number) => Math.round((Math.log(Math.min(Math.max(f, min), max) / min) / Math.log(max / min)) * STEPS)
  // Snap coarser as the numbers grow, so the readout shows 52 Hz and 14 000 Hz, not 14 013 Hz.
  const toHz = (p: number) => {
    const f = min * (max / min) ** (p / STEPS)
    const q = f < 100 ? 1 : f < 1000 ? 5 : f < 10000 ? 50 : 100
    return Math.min(max, Math.max(min, Math.round(f / q) * q))
  }
  const lo = unset ? 0 : toPos(low)
  const hi = unset ? STEPS : toPos(high)
  const pct = (p: number) => `${(p / STEPS) * 100}%`
  const ticks = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 24000].filter((t) => t >= min && t <= max)

  return (
    <div className={cx(unset && styles.sliderUnset)}>
      <div className={styles.slider}>
        <div className={styles.sliderTrack}>
          <div className={styles.sliderFill} style={{ left: pct(lo), right: `calc(100% - ${pct(hi)})` }} />
        </div>
        <input
          type="range"
          min={0}
          max={STEPS}
          value={lo}
          aria-label="Lowest frequency"
          aria-valuetext={unset ? 'not set' : `${low} Hz`}
          onChange={(e) => onChange(toHz(Math.min(Number(e.target.value), hi - 1)), unset ? max : high)}
        />
        <input
          type="range"
          min={0}
          max={STEPS}
          value={hi}
          aria-label="Highest frequency"
          aria-valuetext={unset ? 'not set' : `${high} Hz`}
          onChange={(e) => onChange(unset ? min : low, toHz(Math.max(Number(e.target.value), lo + 1)))}
        />
      </div>
      <div className={styles.ticks}>
        {ticks.map((t, i) => (
          <span
            key={t}
            style={{
              left: pct(toPos(t)),
              transform: i === 0 ? 'translateX(-9px)' : i === ticks.length - 1 ? 'translateX(calc(-100% + 9px))' : 'translateX(-50%)',
            }}
          >
            {t >= 1000 ? `${t / 1000}k` : t}
          </span>
        ))}
      </div>
    </div>
  )
}
