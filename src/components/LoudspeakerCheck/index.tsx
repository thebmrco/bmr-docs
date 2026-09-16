import { useMemo, useState } from 'react'
import { DEFAULT_NOISE_FLOOR_DB, DEFAULT_ROOM_CLASS, DEFAULT_TIER, DEFAULT_USAGE, ROOM_CLASSES } from './lib/constants'
import { EMPTY_SPEAKER } from './lib/examples'
import { score } from './lib/scoring'
import type { Room, Speaker } from './lib/types'
import { ResultCard } from './ResultCard'
import { RoomPanel } from './RoomPanel'
import { SpeakerForm } from './SpeakerForm'
import styles from './styles.module.css'

const defaultClass = ROOM_CLASSES.find((c) => c.key === DEFAULT_ROOM_CLASS)!

const DEFAULT_ROOM: Room = {
  class_key: defaultClass.key,
  area_m2: defaultClass.area_m2,
  height_m: defaultClass.height_m,
  noise_floor_db: DEFAULT_NOISE_FLOOR_DB,
  tier: DEFAULT_TIER,
  usage: DEFAULT_USAGE,
  rt_override_s: null,
}

export default function LoudspeakerCheck() {
  const [speaker, setSpeaker] = useState<Speaker>(EMPTY_SPEAKER)
  const [room, setRoom] = useState<Room>(DEFAULT_ROOM)
  const ready = speaker.spl_peak_db !== null || (speaker.sensitivity_db_1w_1m !== null && speaker.power_watt !== null)
  const result = useMemo(() => (ready ? score(speaker, room) : null), [ready, speaker, room])

  return (
    <div className={`${styles.root} ${styles.stack}`}>
      <SpeakerForm speaker={speaker} onChange={setSpeaker} />
      <RoomPanel room={room} onChange={setRoom} />
      {result ? <ResultCard result={result} /> : <div className={styles.empty}>The answer appears here once there is a maximum sound level.</div>}
    </div>
  )
}
