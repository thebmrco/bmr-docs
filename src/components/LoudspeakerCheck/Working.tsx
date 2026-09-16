import { lineTex } from './lib/trace'
import type { TraceLine } from './lib/types'
import { Tex } from './Tex'
import styles from './styles.module.css'

const STEP = {
  1: 'What the measurement needs',
  2: 'What reaches the microphone',
  3: 'The SNR the measurement will reach',
} as const

/** The calculation, one formula per line, every formula left-aligned under the one before. */
export function Working({ trace }: { trace: TraceLine[] }) {
  return (
    <div>
      {([1, 2, 3] as const).map((step) => (
        <section key={step} className={styles.workStep}>
          <h3 className={styles.workStepTitle}>{STEP[step]}</h3>
          <ol className={styles.workList}>
            {trace
              .filter((t) => t.step === step)
              .map((t, i) => (
                <li key={i} className={styles.workRow}>
                  <div className={styles.workLabel}>{t.label}</div>
                  <div className={styles.workTex}>
                    <Tex display left>
                      {lineTex(t)}
                    </Tex>
                  </div>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
