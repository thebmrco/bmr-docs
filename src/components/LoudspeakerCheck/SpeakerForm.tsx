import type { ReactNode } from 'react'
import { FREQ_INPUT_RANGE_HZ } from './lib/constants'
import type { Connection, PowerKind, Speaker } from './lib/types'
import { Badge, Disclosure, Field, LogRangeSlider, NumberInput, Select, TextInput } from './ui'
import styles from './styles.module.css'

/**
 * The form as three numbered steps (design canvas, 2026-09). Three things are required and nothing
 * substitutes for them: a level, the distance that level was measured at, and a frequency range.
 * Everything else sharpens the answer and lives behind the step-2 disclosure.
 */
function Step({ n, title, sub, children }: { n: number; title: string; sub: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.step}>
      <div className={styles.stepNum} aria-hidden>
        {n}
      </div>
      <div className={styles.stepBody}>
        <div>
          <h2 className={styles.stepTitle}>{title}</h2>
          <p className={styles.stepSub}>{sub}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

/** Unticked, the distance goes back to the 1 m the form says it assumes; a typed 0.5 m would otherwise stay in use. */
export function withDistanceStated(speaker: Speaker, stated: boolean): Speaker {
  return { ...speaker, spl_ref_distance_stated: stated, spl_ref_distance_m: stated ? speaker.spl_ref_distance_m : 1 }
}

export function SpeakerForm({ speaker, onChange }: { speaker: Speaker; onChange: (s: Speaker) => void }) {
  const set = <K extends keyof Speaker>(k: K, v: Speaker[K]) => onChange({ ...speaker, [k]: v })
  // Typed numbers are taken as given, but an implausible one is worth saying out loud rather than answering with
  // a confident room size.
  const warnings: string[] = []
  if (speaker.spl_peak_db !== null && (speaker.spl_peak_db < 50 || speaker.spl_peak_db > 130)) {
    warnings.push(`${speaker.spl_peak_db} dB is outside what loudspeakers publish (about 50–130 dB). Check the figure and its unit.`)
  }
  if (speaker.freq_low_hz > 0 && speaker.freq_high_hz > 0 && speaker.freq_low_hz >= speaker.freq_high_hz) {
    warnings.push('The frequency range runs backwards — the lower limit belongs in the left field.')
  }
  if (speaker.spl_ref_distance_stated && speaker.spl_ref_distance_m < 0.1) {
    warnings.push('A measuring distance below 0.1 m is not a datasheet figure; 0.5 m and 1 m are the usual ones.')
  }

  return (
    <div>
      <Step n={1} title="Name the loudspeaker" sub="For your notes only. It does not affect the result.">
        <TextInput
          value={speaker.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Teufel MYND, Cisco Room Bar, Jabra Speak2 75"
          style={{ maxWidth: '32rem' }}
        />
      </Step>

      <Step
        n={2}
        title="How loud can it play?"
        sub={
          <>
            Enter the datasheet&rsquo;s <strong>maximum sound level</strong> — or, if none is published,{' '}
            <strong>expand the box below</strong> and use the output power instead.
          </>
        }
      >
        {warnings.length > 0 && (
          <div className={styles.stackSm}>
            {warnings.map((w) => (
              <p key={w} className={styles.fieldHint}>
                {w}
              </p>
            ))}
          </div>
        )}
        <div className={styles.grid2} style={{ maxWidth: '32rem' }}>
          <Field
            label="Maximum sound level"
            hint="Listed as max SPL or peak audio output."
            info={
              <>
                On a German datasheet, <em>maximaler Schalldruck</em>. Not the &ldquo;signal-to-noise ratio&rdquo; line — that is a ratio
                between the device and its own noise, not a level, and it lands in the same range as a real one, so nothing here
                can catch the mistake for you.
              </>
            }
          >
            <NumberInput value={speaker.spl_peak_db} onChange={(v) => set('spl_peak_db', v)} suffix="dB" placeholder="e.g. 88" />
          </Field>
          <Field
            label="…measured at"
            hint="Printed next to the level as “@ 1 m” or “@ 0.5 m”."
            info={
              <>
                Datasheets that give a level often leave the distance out. If it was measured at 0.5 m the figure is 6 dB
                optimistic, so by default 1 m is assumed and 3 dB is taken off the level — halfway between the two. Entering the
                real distance removes that and makes the room size larger.
              </>
            }
          >
            <NumberInput
              value={speaker.spl_ref_distance_m}
              onChange={(v) => set('spl_ref_distance_m', v ?? 1)}
              step="0.1"
              min="0.1"
              suffix="m"
              disabled={!speaker.spl_ref_distance_stated}
            />
            <span className={styles.check}>
              <input type="checkbox" checked={speaker.spl_ref_distance_stated} onChange={(e) => onChange(withDistanceStated(speaker, e.target.checked))} />
              <span>The datasheet states the distance — enter it above</span>
            </span>
            {!speaker.spl_ref_distance_stated && (
              <span className={styles.defaultNote}>
                Default in use: <strong>1 m assumed</strong> <Badge tone="warn">−3 dB</Badge>
              </span>
            )}
          </Field>
        </div>

        <Disclosure
          alt
          summary={speaker.spl_peak_db === null && speaker.power_watt !== null ? 'Alternative in use: level estimated from the output power' : 'No maximum sound level on the datasheet? Use the output power instead'}
          detail={
            speaker.spl_peak_db === null && speaker.power_watt !== null
              ? 'With no maximum sound level published, the output power is what the room size is built from.'
              : 'Expand and enter the output power — the level is estimated from it, with a wider margin of doubt on the answer.'
          }
        >
          <div className={styles.grid2}>
            <Field
              label="Output power"
              hint="Total RMS."
              info="Used only when no maximum sound level is published. Take the figure for how it will run: a portable delivers less on battery than on mains, and most datasheets print both."
            >
              <NumberInput value={speaker.power_watt} onChange={(v) => set('power_watt', v)} suffix="W" placeholder="e.g. 40" />
            </Field>
            <Field
              label="What kind of watts"
              info="The estimate is fitted on total device ratings, so a per-driver figure reads low. One datasheet here prints both, four times apart: a 2 × 38 W amplifier driving 2 × 10 W drivers. Picking the driver figure does not change the number — it adds a warning instead."
            >
              <Select
                value={speaker.power_kind ?? 'amplifier'}
                onChange={(v) => set('power_kind', v as PowerKind)}
                options={[
                  { value: 'amplifier', label: 'Amplifier / total device power' },
                  { value: 'speaker', label: 'Speaker (driver) power' },
                ]}
              />
            </Field>
            <Field
              label="Bass driver diameter"
              hint={
                speaker.woofer_mm
                  ? `The largest driver — ${speaker.woofer_mm} mm ≈ ${(speaker.woofer_mm * 0.0393701).toFixed(1)} in.`
                  : 'The largest driver, in mm. A small one runs out in the low bands first.'
              }
            >
              <NumberInput value={speaker.woofer_mm} onChange={(v) => set('woofer_mm', v)} suffix="mm" />
            </Field>
            <Field label="Connection" hint="A wired input takes the Bluetooth path out of the measurement.">
              <Select
                value={speaker.connection}
                onChange={(v) => set('connection', v as Connection)}
                options={[
                  { value: 'unknown', label: 'Not sure' },
                  { value: 'bluetooth', label: 'Bluetooth only' },
                  { value: 'wired', label: 'Wired only (AUX / USB)' },
                  { value: 'both', label: 'Bluetooth and wired' },
                ]}
              />
            </Field>
            <Field label="Bluetooth codec" hint="Recorded with the answer. It does not affect the result.">
              <TextInput value={speaker.bluetooth_codec} onChange={(e) => set('bluetooth_codec', e.target.value)} placeholder="SBC, AAC, LDAC…" />
            </Field>
          </div>
        </Disclosure>
      </Step>

      <Step
        n={3}
        title="How deep and high does it go?"
        sub={
          <>
            Listed as <strong>frequency range</strong> or <strong>frequency response</strong>, e.g. &ldquo;80 Hz – 20 kHz&rdquo;. Use the
            loudspeaker line, not the microphone one. A stated limit is where the output is a few dB down, not where it stops.
          </>
        }
      >
        <div style={{ maxWidth: '40rem' }}>
          <LogRangeSlider
            low={speaker.freq_low_hz}
            high={speaker.freq_high_hz}
            min={FREQ_INPUT_RANGE_HZ[0]}
            max={FREQ_INPUT_RANGE_HZ[1]}
            onChange={(lo, hi) => onChange({ ...speaker, freq_low_hz: lo, freq_high_hz: hi })}
          />
          <div className={styles.rangeInputs}>
            <NumberInput value={speaker.freq_low_hz || null} onChange={(v) => set('freq_low_hz', v ?? 0)} suffix="Hz" placeholder="52" />
            <span className={styles.muted}>to</span>
            <NumberInput value={speaker.freq_high_hz || null} onChange={(v) => set('freq_high_hz', v ?? 0)} suffix="Hz" placeholder="20000" />
          </div>
        </div>
      </Step>
    </div>
  )
}
