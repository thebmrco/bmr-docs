import { FREQ_INPUT_RANGE_HZ } from './lib/constants'
import { EXAMPLES } from './lib/examples'
import type { Connection, PowerKind, PowerMode, Speaker } from './lib/types'
import { Badge, Card, CardTitle, Disclosure, Field, LogRangeSlider, NumberInput, Select, TextInput } from './ui'
import styles from './styles.module.css'

/**
 * Three things are required and nothing substitutes for them: a level, the distance that level was
 * measured at, and a frequency range. Everything else sharpens the answer and lives behind a disclosure.
 */
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
    <Card>
      <CardTitle title="Your loudspeaker" sub="Three numbers from the datasheet." />
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
        <Field label="Name" hint="For your own notes. It does not affect the result.">
          <TextInput value={speaker.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Teufel MYND, Cisco Room Bar, Jabra Speak2 75" />
        </Field>

        <div className={styles.grid2}>
          <Field label="Maximum sound level" hint="Listed as max SPL, peak audio output, or maximaler Schalldruck.">
            <NumberInput value={speaker.spl_peak_db} onChange={(v) => set('spl_peak_db', v)} suffix="dB" />
          </Field>
          <Field label="…measured at" hint="Printed next to it as @ 0.5 m or /1m.">
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
                Not stated — assume 1 m {!speaker.spl_ref_distance_stated && <Badge tone="warn">assumed</Badge>}
              </span>
            </span>
          </Field>
        </div>

        <Field label="Frequency range" hint="The loudspeaker line, not the microphone one. On a conference system look for the speaker frequency response.">
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

        <Disclosure summary="More from the datasheet (optional)" detail="Power, driver size and connection sharpen the check.">
          <div className={styles.grid2}>
            <Field label="Running on" hint="Portable devices publish two ratings and deliver the lower one unplugged. Room systems are always on mains.">
              <Select
                value={speaker.power_mode}
                onChange={(v) => set('power_mode', v as PowerMode)}
                options={[
                  { value: 'battery', label: 'Battery' },
                  { value: 'mains', label: 'Mains / AC power' },
                ]}
              />
            </Field>
            <Field
              label="Output power"
              hint={speaker.power_mode === 'battery' ? 'Total RMS. Use the battery-mode figure where the datasheet gives both.' : 'Total RMS, AC-mode figure.'}
            >
              <NumberInput value={speaker.power_watt} onChange={(v) => set('power_watt', v)} suffix="W" />
            </Field>
            <Field label="What kind of watts">
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
            <Field label="Sensitivity" hint="dB at 1 W / 1 m. Rarely published — only needed if there is no SPL figure.">
              <NumberInput value={speaker.sensitivity_db_1w_1m} onChange={(v) => set('sensitivity_db_1w_1m', v)} suffix="dB" />
              <span className={styles.check}>
                <input type="checkbox" checked={speaker.sensitivity_estimated} onChange={(e) => set('sensitivity_estimated', e.target.checked)} />
                <span>This is my estimate, not a published figure.</span>
              </span>
            </Field>
            <Field label="Bluetooth codec" hint="Recorded for your notes. It does not affect the result.">
              <TextInput value={speaker.bluetooth_codec} onChange={(e) => set('bluetooth_codec', e.target.value)} placeholder="SBC, AAC, LDAC…" />
            </Field>
          </div>
        </Disclosure>

        <div className={styles.examples}>
          <p>Or try one we have looked up</p>
          <div className={styles.pills}>
            {EXAMPLES.map((e) => (
              <button key={e.id} type="button" className={styles.pill} onClick={() => onChange(e.speaker)}>
                {e.speaker.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
