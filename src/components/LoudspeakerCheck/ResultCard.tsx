import { useState } from 'react'
import Link from '@docusaurus/Link'
import { ChevronDown } from 'lucide-react'
import { AREA_SEARCH_MAX_M2, ROOM_CLASSES, TIERS } from './lib/constants'
import type { Result, Status } from './lib/types'
import { Working } from './Working'
import styles from './styles.module.css'

/** Fields the engine adds for the full result; optional so the card renders on either engine version. */
type FullResult = {
  status: Status
  max_area_m2: number
  bass_ratio_possible?: boolean
  area_range_m2: [number, number]
  binding: 'rt' | 125 | 250
  margins: { rt: number; b125: number; b250: number }
}
type R = Result & Partial<{ full: FullResult; snr_125_db: number; snr_250_db: number; max_area_display_m2: number }>

const n1 = (v: number | undefined) => (v !== undefined && Number.isFinite(v) ? v.toFixed(1) : '—')
const sign = (v: number) => (v >= 0 ? '+' : '')

const DOT: Record<Status, string> = { yes: styles.dotYes, borderline: styles.dotBorderline, no: styles.dotNo }
const WORD: Record<Status, string> = { yes: 'yes', borderline: 'borderline', no: 'no' }

/* Dual units: metric is what BMR uses; the imperial approximation rides along muted. */
const SQFT = 10.7639
const FT = 3.28084
const sig3 = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 })
const sqft = (a: number) => sig3.format(a * SQFT)
const ft = (m: number) => new Intl.NumberFormat('en-US', { maximumSignificantDigits: 2 }).format(m * FT)
const Imp = ({ children }: { children: React.ReactNode }) => <span className={styles.imperial}>{children}</span>

/** Renders engine copy, appending the sq ft equivalent after every "N m²" it contains. */
function DualText({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,.]*\s?m²)/g)
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^(\d[\d,.]*)\s?m²$/)
        if (!m) return <span key={i}>{p}</span>
        const v = Number(m[1].replace(/,/g, ''))
        return (
          <span key={i}>
            {p} <Imp>(≈{sqft(v)} sq ft)</Imp>
          </span>
        )
      })}
    </>
  )
}

/** "(35–175+)": a range edge at or beyond the volume cap is shown as the cap with a plus. */
function span([lo, hi]: [number, number], cap?: number) {
  const edge = (x: number) => (cap !== undefined && x >= cap ? `${Math.floor(cap)}+` : String(x))
  return ` (${edge(lo)}–${edge(hi)})`
}

function area(a: number, cap?: number): React.ReactNode {
  if (cap !== undefined && a >= cap)
    return (
      <>
        up to {Math.floor(cap)}+ m² <Imp>(≈{sqft(cap)}+ sq ft)</Imp>
      </>
    )
  if (a >= AREA_SEARCH_MAX_M2) return `> ${AREA_SEARCH_MAX_M2} m²`
  if (a <= 0) return '—'
  return (
    <>
      up to {a} m² <Imp>(≈{sqft(a)} sq ft)</Imp>
    </>
  )
}

/** Predicted SNR with its borderline zone, against the analysis lines. */
function SnrScale({ result }: { result: R }) {
  const LO = 10
  const HI = 55
  const pos = (x: number) => ((Math.min(Math.max(x, LO), HI) - LO) / (HI - LO)) * 100
  const s = result.snr_rt_db
  const lo = pos(s - result.band_db)
  const hi = pos(s + result.band_db)
  return (
    <div>
      <div className={styles.scaleHead}>
        <span>Predicted SNR, {result.binding_band_hz === 1000 ? '1 kHz' : '500 Hz'} band</span>
        <span className={styles.tnum} style={{ fontWeight: 600 }}>
          {n1(s)} ± {n1(result.band_db)} dB
        </span>
      </div>
      <div className={styles.scaleTrack}>
        <div className={styles.scaleBand} style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
        <div className={styles.scaleDot} style={{ left: `${pos(s)}%` }} />
        {TIERS.map((t) => (
          <div key={t.key} className={styles.scaleTick} style={{ left: `${pos(t.snrDb)}%` }} />
        ))}
      </div>
      <div className={styles.scaleLabels}>
        {TIERS.map((t, i) => (
          <span key={t.key} style={{ left: `${pos(t.snrDb)}%`, transform: i % 2 === 0 ? 'translateX(-100%)' : 'translateX(2px)' }}>
            {t.snrDb}
          </span>
        ))}
      </div>
    </div>
  )
}

function TierLadder({ result }: { result: R }) {
  const cap = result.max_area_display_m2
  const full = result.full
  const bindingWord = full ? (full.binding === 'rt' ? '500 Hz / 1 kHz' : `${full.binding} Hz`) : ''
  const fullMargin = full ? Math.min(full.margins.rt, full.margins.b125, full.margins.b250) : 0
  return (
    <ul className={styles.list} style={{ marginTop: '1rem' }}>
      {full && (
        <li className={styles.ladderItem}>
          <span className={`${styles.dot} ${DOT[full.status]}`} aria-hidden />
          <span className={styles.ladderMain}>
            <span className={styles.ladderHead}>
              <span>
                Full result (with Bass Ratio) <span className={styles.muted} style={{ fontWeight: 400 }}>· {WORD[full.status]}</span>
              </span>
              <span className={`${styles.small} ${styles.tnum}`}>
                {sign(fullMargin)}
                {n1(fullMargin)} dB · rooms {area(full.max_area_m2, cap)}
                {full.max_area_m2 > 0 && span(full.area_range_m2, cap)}
              </span>
            </span>
            <span className={styles.small} style={{ display: 'block', marginTop: '0.125rem' }}>
              Reverberation time in 125 Hz to 1 kHz, so the MOS score includes its Bass Ratio. Limited by {bindingWord}.
            </span>
          </span>
        </li>
      )}
      {result.tiers.map((t) => (
        <li key={t.key} className={styles.ladderItem}>
          <span className={`${styles.dot} ${DOT[t.status]}`} aria-hidden />
          <span className={styles.ladderMain}>
            <span className={styles.ladderHead}>
              <span>
                {t.label}{' '}
                <span className={styles.muted} style={{ fontWeight: 400 }}>
                  · SNR ≥ {t.snrDb} dB · {WORD[t.status]}
                </span>
              </span>
              <span className={`${styles.small} ${styles.tnum}`}>
                {sign(t.margin_db)}
                {n1(t.margin_db)} dB · rooms {area(t.max_area_m2, cap)}
                {t.max_area_m2 > 0 && span(t.area_range_m2, cap)}
              </span>
            </span>
            <span className={styles.small} style={{ display: 'block', marginTop: '0.125rem' }}>
              {t.means}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function BandChart({ result }: { result: R }) {
  return (
    <div>
      <div className={styles.bands}>
        {result.bands.map((b) => {
          const tone = !b.covered ? styles.bandMissing : b.partial ? styles.bandPartial : b.critical ? styles.bandCritical : styles.bandCovered
          return (
            <div key={b.centre_hz} className={styles.bandCol}>
              <div className={`${styles.bandBar} ${tone}`} title={`${b.centre_hz} Hz octave: ${b.low_hz}–${b.high_hz} Hz`} />
              <span className={styles.bandLabel}>{b.centre_hz >= 1000 ? `${b.centre_hz / 1000}k` : b.centre_hz}</span>
            </div>
          )
        })}
      </div>
      <p className={styles.small} style={{ marginTop: '0.5rem', marginBottom: 0 }}>
        Dark green: 500 Hz and 1 kHz, which the reverberation time is built from. Amber: at the edge of the loudspeaker's range, measured but weaker.
        Red: outside its range. The 125 Hz and 250 Hz bands decide whether the Bass Ratio can be calculated.
      </p>
    </div>
  )
}

/** Verdict pill, from the same areas the design mock keys on — the engine's real numbers. */
function verdict(areaFull: number, areaWorks: number, areaMin: number, light: Result['light']) {
  // Never greener than the engine: its colour also carries the band checks, which the areas know nothing about.
  if (light === 'red') return { label: 'Not suitable', cls: styles.verdictNo }
  if (areaFull >= 25 && light === 'green') return { label: 'Suitable', cls: styles.verdictYes }
  if (areaWorks >= 25) return { label: 'Suitable with limits', cls: styles.verdictLimits }
  if (areaMin >= 15) return { label: 'Borderline', cls: styles.verdictLimits }
  return { label: 'Not suitable', cls: styles.verdictNo }
}

const worstLight = (a: Result['light'], b: Result['light']): Result['light'] =>
  a === 'red' || b === 'red' ? 'red' : a === 'yellow' || b === 'yellow' ? 'yellow' : 'green'

export function ResultCard({ result }: { result: R }) {
  const [open, setOpen] = useState(false)
  // Without a published maximum level there is no level, no SNR and no size; the frequency bands still stand.
  const sized = Number.isFinite(result.spl_at_1m_db)
  const cap = result.max_area_display_m2

  const tierArea = (key: string) => result.tiers.find((t) => t.key === key)?.max_area_m2 ?? 0
  const bassPossible = result.full?.bass_ratio_possible !== false
  // A room only counts as "full result" when the Bass Ratio is measurable at all.
  const areaFull = sized && bassPossible ? result.full?.max_area_m2 ?? 0 : 0
  // Without the Bass Ratio bands the engine still sizes the room on the level those bands would get, and its
  // headline quotes that size; the level-only tier would offer larger rooms than the headline.
  const areaWorks = !sized ? 0 : bassPossible ? tierArea('reliable') : result.full?.max_area_m2 ?? 0
  const v = verdict(areaFull, areaWorks, sized ? tierArea('compatible') : 0, worstLight(result.light, result.room_light))

  const variants = sized
    ? [
        {
          code: 'RT',
          title: 'Reverberation time',
          desc: 'The base score, from the 500 Hz and 1 kHz bands.',
          upTo: area(areaWorks, cap),
          on: areaWorks > 0,
        },
        {
          code: 'RT-BR',
          title: '+ Bass Ratio',
          desc: 'Needs the 125 Hz and 250 Hz bands as well; penalises boomy rooms.',
          upTo: bassPossible ? area(areaFull, cap) : 'not measurable',
          on: bassPossible && areaFull > 0,
        },
        {
          code: 'RT-BR-N',
          title: '+ Background noise, no noise warning',
          desc: 'The current full score, without a “close to noise floor” warning.',
          upTo: bassPossible ? area(Math.min(areaFull, tierArea('clean')), cap) : 'not measurable',
          on: bassPossible && Math.min(areaFull, tierArea('clean')) > 0,
        },
      ]
    : []

  return (
    <div className={styles.resultStack}>
      {/* Verdict + headline */}
      <div>
        <div className={styles.verdictRow}>
          {sized && <span className={`${styles.verdictPill} ${v.cls}`}>{v.label}</span>}
          <span className={styles.verdictName}>{result.speaker.name || 'Your loudspeaker'}</span>
        </div>
        <h2 className={styles.bigHeadline}><DualText text={result.headline} /></h2>
        <p className={styles.bigSub}><DualText text={result.headline_text} /></p>
        {result.headline_range && <p className={styles.resultSmall}><DualText text={result.headline_range} /></p>}
        {result.margin_uncertainty_db > 0 && (
          <p className={styles.estimateNote}>
            {result.confidence_reason} — less certain by ±{n1(result.margin_uncertainty_db)} dB. Treat the room sizes as rough.
          </p>
        )}
      </div>

      {/* Where you can use it */}
      {sized && (
        <div>
          <p className={styles.microLabel}>Where you can use it</p>
          <div className={styles.roomsGrid}>
            {ROOM_CLASSES.map((r) => {
              const k = r.area_m2 <= areaFull ? 'yes' : r.area_m2 <= areaWorks ? 'borderline' : 'no'
              const badge = k === 'yes' ? styles.roomBadgeYes : k === 'borderline' ? styles.roomBadgeBorderline : styles.roomBadgeNo
              const label = k === 'yes' ? 'Full result' : k === 'borderline' ? 'Without Bass Ratio' : 'Too quiet'
              return (
                <div key={r.key} className={`${styles.roomCard} ${k === 'no' ? styles.roomCardMuted : ''}`}>
                  <div className={styles.roomCardMeta}>
                    {r.people} · {r.area_m2} m² <Imp>(≈{sqft(r.area_m2)} sq ft)</Imp>
                  </div>
                  <div className={styles.roomCardName}>{r.label}</div>
                  <span className={`${styles.roomBadge} ${badge}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* What the app will return */}
      {sized && (
        <div>
          <p className={styles.microLabel}>What the app will return</p>
          <div className={styles.variantList}>
            {variants.map((x) => (
              <div key={x.code} className={styles.variantRow}>
                <div>
                  <div className={styles.variantHead}>
                    <span className={`${styles.variantTag} ${x.on ? styles.variantTagOn : styles.variantTagOff}`}>{x.code}</span>
                    <span>{x.title}</span>
                  </div>
                  <div className={styles.variantDesc}>{x.desc}</div>
                </div>
                <div className={styles.variantUpTo}>{x.upTo}</div>
              </div>
            ))}
          </div>
          <p className={styles.variantFoot}>
            Room sizes for a typical meeting room: {result.room.noise_floor_db} dB(A) background noise, {result.room.height_m} m ({ft(result.room.height_m)} ft) ceiling. Score
            variants as described in <Link to="/docs/acoustics/mos-score">Understanding the MOS Score</Link>.
          </p>
        </div>
      )}

      {/* Everything else behind one toggle */}
      <button type="button" className={`${styles.detailsToggle} ${open ? styles.detailsToggleOpen : ''}`} onClick={() => setOpen(!open)}>
        <span>{open ? 'Hide the details' : 'Show all the details'}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && (
        <div className={styles.detailSections}>
          {sized && (
            <div>
              <h3 className={styles.detailSectionTitle}>How close it is</h3>
              <SnrScale result={result} />
              <TierLadder result={result} />
              <dl className={styles.kv}>
                <dt>{result.spl_at_1m_provenance === 'derived' ? 'Maximum at 1 m, estimated from the wattage' : 'Datasheet maximum at 1 m'}</dt>
                <dd>{n1(result.spl_at_1m_db)} dB SPL</dd>
                <dt>Sweep at 1 m, full volume</dt>
                <dd>
                  {n1(result.sweep_level_1m_db)} dB SPL{' '}
                  <span className={styles.muted} style={{ fontWeight: 400 }}>
                    (−{n1(result.spl_at_1m_db - result.sweep_level_1m_db)} dB: a sweep sits below a peak rating
                    {result.margin_uncertainty_db > 0 ? ', and the datasheet doubt is taken off here' : ''})
                  </span>
                </dd>
                <dt>At the far corner, {n1(result.distance_m)} m ({ft(result.distance_m)} ft)</dt>
                <dd>{n1(result.level_at_mic_db)} dB SPL</dd>
                <dt>Noise, 500 Hz / 1 kHz band</dt>
                <dd>
                  {n1(result.noise_500_db)} / {n1(result.noise_1000_db)} dB
                </dd>
                {result.snr_125_db !== undefined && (
                  <>
                    <dt>SNR 125 Hz / 250 Hz</dt>
                    <dd>
                      {n1(result.snr_125_db)} / {n1(result.snr_250_db)} dB
                    </dd>
                  </>
                )}
                <dt>Reverberation time</dt>
                <dd>
                  {result.expected_rt_s.toFixed(2)} s <span className={styles.muted} style={{ fontWeight: 400 }}>{result.rt_provenance === 'derived' ? '(DIN 18041)' : '(yours)'}</span>
                </dd>
              </dl>
            </div>
          )}

          <div>
            <h3 className={styles.detailSectionTitle}>Frequency bands</h3>
            <BandChart result={result} />
          </div>

          {result.caveats.length > 0 && (
            <div>
              <h3 className={styles.detailSectionTitle}>What this rests on</h3>
              <ul className={styles.list}>
                {result.caveats.map((c) => (
                  <li key={c.id} className={styles.caveat} style={{ borderTop: 0 }}>
                    <span className={styles.caveatDot} aria-hidden />
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className={styles.detailSectionTitle}>The working</h3>
            {sized && <Working trace={result.trace} />}
            <Link to="/docs/acoustics/loudspeaker-check/method" className={styles.link}>
              Method, formulas and sources
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
