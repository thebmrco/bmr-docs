import Link from '@docusaurus/Link'
import { AudioLines, CircleCheck, CircleX, DoorOpen, Gauge, Sigma, TriangleAlert } from 'lucide-react'
import { AREA_SEARCH_MAX_M2, TIERS } from './lib/constants'
import type { Result, Status } from './lib/types'
import { Working } from './Working'
import { Card, Details } from './ui'
import styles from './styles.module.css'

/** Fields the engine adds for the full result; optional so the card renders on either engine version. */
type FullResult = {
  status: Status
  max_area_m2: number
  area_range_m2: [number, number]
  binding: 'rt' | 125 | 250
  margins: { rt: number; b125: number; b250: number }
}
type R = Result & Partial<{ full: FullResult; snr_125_db: number; snr_250_db: number; max_area_display_m2: number }>

const n1 = (v: number | undefined) => (v !== undefined && Number.isFinite(v) ? v.toFixed(1) : '—')
const sign = (v: number) => (v >= 0 ? '+' : '')

const LIGHT = {
  green: { bed: styles.lightGreen, text: styles.textGreen, Icon: CircleCheck },
  yellow: { bed: styles.lightYellow, text: styles.textYellow, Icon: TriangleAlert },
  red: { bed: styles.lightRed, text: styles.textRed, Icon: CircleX },
} as const

const DOT: Record<Status, string> = { yes: styles.dotYes, borderline: styles.dotBorderline, no: styles.dotNo }
const WORD: Record<Status, string> = { yes: 'yes', borderline: 'borderline', no: 'no' }

/** "(35–175+)": a range edge at or beyond the volume cap is shown as the cap with a plus. */
function span([lo, hi]: [number, number], cap?: number) {
  const edge = (x: number) => (cap !== undefined && x >= cap ? `${Math.floor(cap)}+` : String(x))
  return ` (${edge(lo)}–${edge(hi)})`
}

function area(a: number, cap?: number) {
  if (cap !== undefined && a >= cap) return `up to ${Math.floor(cap)} m²`
  return a >= AREA_SEARCH_MAX_M2 ? `> ${AREA_SEARCH_MAX_M2} m²` : a > 0 ? `up to ${a} m²` : '—'
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

function YourRoom({ result }: { result: R }) {
  const r = result.room
  return (
    <div>
      <p className={styles.pStrong}>
        {r.area_m2} m², {r.noise_floor_db} dB(A): <span className={LIGHT[result.room_light].text}>{result.room_verdict}</span>
      </p>
      <p className={styles.p}>{result.room_recommendation}</p>
      <ul className={styles.list} style={{ borderTop: 0 }}>
        {result.reach.map((x) => (
          <li key={x.class_key} className={styles.reachItem} style={{ borderTop: 0 }}>
            <span className={`${styles.dot} ${DOT[x.status]}`} aria-hidden />
            <span className={x.status === 'no' ? styles.muted : undefined}>{x.label}</span>
            <span className={styles.small}>
              {x.people} · {x.area_m2} m²
            </span>
            <span className={styles.reachRight}>{WORD[x.status]}</span>
          </li>
        ))}
      </ul>
      <p className={styles.small} style={{ marginTop: '0.75rem', marginBottom: 0 }}>
        Change the room and the background noise above the answer.
      </p>
    </div>
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
        Red: outside its range.
      </p>
    </div>
  )
}

export function ResultCard({ result }: { result: R }) {
  // The header leads with what the loudspeaker can do; the line below answers for the room the user chose. The
  // color is the more cautious of the two, so an amber room verdict is never hidden behind a green size.
  const rank = { green: 0, yellow: 1, red: 2 } as const
  const light = LIGHT[rank[result.room_light] > rank[result.light] ? result.room_light : result.light]
  const Icon = light.Icon
  // Without a published maximum level there is no level, no SNR and no size; the frequency bands still stand.
  const sized = Number.isFinite(result.spl_at_1m_db)

  return (
    <Card flush>
      <header className={`${styles.resultHeader} ${light.bed}`}>
        <div className={styles.resultRow}>
          <Icon size={28} className={`${styles.resultIcon} ${light.text}`} aria-hidden />
          <div style={{ minWidth: 0 }}>
            <h2 className={styles.headline}>{result.headline}</h2>
            <p className={styles.resultName}>{result.speaker.name || 'This loudspeaker'}</p>
            <p className={styles.resultText}>
              {result.room_headline !== result.headline && <strong>{result.room_headline}. </strong>}
              {result.headline_text}
            </p>
            {result.headline_range && <p className={styles.resultSmall}>{result.headline_range}</p>}
            {result.margin_uncertainty_db > 0 && (
              <p className={styles.resultSmall} style={{ marginTop: '0.5rem' }}>
                {result.confidence_reason} — less certain by ±{n1(result.margin_uncertainty_db)} dB.
              </p>
            )}
          </div>
        </div>
      </header>

      <div className={styles.resultBody}>
        {sized && (
          <Details icon={DoorOpen} summary={`Selected room, ${result.room.area_m2} m²: ${result.room_verdict.replace(' in this room', '').toLowerCase()}`}>
            <YourRoom result={result} />
          </Details>
        )}

        {sized && (
        <Details icon={Gauge} summary="How close it is">
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
            <dt>At the far corner, {n1(result.distance_m)} m</dt>
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
        </Details>
        )}

        <Details icon={AudioLines} summary="Frequency bands">
          <BandChart result={result} />
        </Details>

        {result.caveats.length > 0 && (
          <Details icon={TriangleAlert} summary={`What this rests on (${result.caveats.length})`}>
            <ul className={styles.list}>
              {result.caveats.map((c) => (
                <li key={c.id} className={styles.caveat} style={{ borderTop: 0 }}>
                  <span className={styles.caveatDot} aria-hidden />
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </Details>
        )}

        <Details icon={Sigma} summary="The working">
          {sized && <Working trace={result.trace} />}
          <Link to="/docs/acoustics/loudspeaker-check/method" className={styles.link}>
            Method, formulas and sources
          </Link>
        </Details>
      </div>
    </Card>
  )
}
