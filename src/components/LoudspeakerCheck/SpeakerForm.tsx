import { FREQ_INPUT_RANGE_HZ } from './lib/constants'
import { EMPTY_SPEAKER, EXAMPLES } from './lib/examples'
import type { Connection, PowerKind, Speaker } from './lib/types'
import { Badge, Card, CardTitle, Disclosure, Field, Info, LogRangeSlider, NumberInput, Select, TextInput } from './ui'
import styles from './styles.module.css'

/**
 * Three things are required and nothing substitutes for them: a level, the distance that level was
 * measured at, and a frequency range. Everything else sharpens the answer and lives behind a disclosure.
 */
/** Field-by-field, so that editing any one of them drops the example's highlight by itself. */
function same(a: Speaker, b: Speaker): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Speaker>
  return [...keys].every((k) => a[k] === b[k])
}

export function SpeakerForm({ speaker, onChange }: { speaker: Speaker; onChange: (s: Speaker) => void }) {
  const set = <K extends keyof Speaker>(k: K, v: Speaker[K]) => onChange({ ...speaker, [k]: v })
  // Highlighted only while the form still holds that example exactly. Clicking it again clears the form.
  const selected = EXAMPLES.find((e) => same(e.speaker, speaker))?.id
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
    <Card>
      <CardTitle title="Loudspeaker" sub="The fields marked * are what the answer is built from." />
      {warnings.length > 0 && (
        <div className={styles.stackSm}>
          {warnings.map((w) => (
            <p key={w} className={styles.fieldHint}>
              {w}
            </p>
          ))}
        </div>
      )}

      <div className={styles.stack}>
        <Field label="Name" hint="For the notes. It does not affect the result.">
          <TextInput value={speaker.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Teufel MYND, Cisco Room Bar, Jabra Speak2 75" />
        </Field>

        <div className={styles.grid2}>
          <Field
            label="Maximum sound level"
            required
            hint="Listed as max SPL or peak audio output."
            info={
              <>
                On a German datasheet, <em>maximaler Schalldruck</em>. Not the &ldquo;signal-to-noise ratio&rdquo; line — that is a ratio
                between the device and its own noise, not a level, and it lands in the same range as a real one, so nothing here
                can catch the mistake for you.
              </>
            }
          >
            <NumberInput value={speaker.spl_peak_db} onChange={(v) => set('spl_peak_db', v)} suffix="dB" />
          </Field>
          <Field
            label="…measured at"
            hint="Printed next to it as @ 0.5 m or /1m."
            info={
              <>
                Datasheets that give a level often leave the distance out. If it was measured at 0.5 m the figure is 6 dB
                optimistic, so with &ldquo;not stated&rdquo; ticked 3 dB is taken off the level — halfway between the two. Entering the
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
              <input type="checkbox" checked={!speaker.spl_ref_distance_stated} onChange={(e) => set('spl_ref_distance_stated', !e.target.checked)} />
              <span>
                Not stated — assume 1 m {!speaker.spl_ref_distance_stated && <Badge tone="warn">−3 dB</Badge>}
              </span>
            </span>

          </Field>
        </div>

        <Field label="Frequency range" required hint="The loudspeaker line, not the microphone one." info="On a conference system look for the speaker frequency response. A stated limit is where the output is a few dB down, not where it stops, so a band whose centre is inside the range still counts.">
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
        </Field>

        <p className={styles.footnote}>
          * No maximum sound level on the datasheet? Many portables publish none. Enter the output power under &ldquo;More from the
          datasheet&rdquo; instead and the check estimates the level from it — as an estimate, with the wider doubt shown on the answer.
        </p>

        <Disclosure
          summary={speaker.spl_peak_db === null ? 'More from the datasheet — the power is used here' : 'More from the datasheet (optional)'}
          detail={
            speaker.spl_peak_db === null
              ? 'With no maximum sound level published, the output power is what the room size is built from. Driver size and connection sharpen the rest.'
              : 'Power, driver size and connection sharpen the check.'
          }
        >
          <div className={styles.grid2}>
            <Field
              label="Output power"
              hint="Total RMS."
              info="Used only when no maximum sound level is published. Take the figure for how it will run: a portable delivers less on battery than on mains, and most datasheets print both."
            >
              <NumberInput value={speaker.power_watt} onChange={(v) => set('power_watt', v)} suffix="W" />
            </Field>
            <Field
              label="What kind of watts"
              info="The estimate is fitted on total device ratings, so a per-driver figure reads low. One datasheet here prints both, four times apart: a 2 \u00d7 38 W amplifier driving 2 \u00d7 10 W drivers. Picking the driver figure does not change the number \u2014 it adds a warning instead."
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
            <Field label="Bass driver diameter" hint="The largest driver. A small one runs out in the low bands first.">
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

        <div className={styles.examples}>
          <p>Or try one we have looked up</p>
          <div className={styles.pills}>
            {EXAMPLES.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={selected === e.id}
                className={`${styles.pill} ${selected === e.id ? styles.pillActive : ''}`}
                onClick={() => onChange(selected === e.id ? EMPTY_SPEAKER : e.speaker)}
              >
                {e.speaker.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
