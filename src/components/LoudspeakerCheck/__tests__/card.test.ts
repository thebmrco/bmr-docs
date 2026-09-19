/**
 * The result card and the form, rendered against the engine. The engine is pinned by the other tests; these pin
 * that the page shows what it computed. Every case here is an input on which the card once disagreed with its
 * own headline.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@docusaurus/Link', () => ({ default: (p: { to: string; children: unknown }) => createElement('a', { href: p.to }, p.children as never) }))

import { DEFAULT_NOISE_FLOOR_DB, DEFAULT_ROOM_CLASS, DEFAULT_TIER, DEFAULT_USAGE, ROOM_CLASSES } from '../lib/constants'
import { EMPTY_SPEAKER, EXAMPLES } from '../lib/examples'
import { score } from '../lib/scoring'
import type { Room, Speaker } from '../lib/types'
import { ResultCard } from '../ResultCard'
import { withDistanceStated } from '../SpeakerForm'

const cls = ROOM_CLASSES.find((c) => c.key === DEFAULT_ROOM_CLASS)!
// The room index.tsx fixes.
const ROOM: Room = { class_key: cls.key, area_m2: cls.area_m2, height_m: cls.height_m, noise_floor_db: DEFAULT_NOISE_FLOOR_DB, tier: DEFAULT_TIER, usage: DEFAULT_USAGE, rt_override_s: null }

const text = (s: Speaker) =>
  renderToStaticMarkup(createElement(ResultCard, { result: score(s, ROOM) }))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')

/** The verdict pill and the room grid's badges, in order. */
function card(s: Speaker) {
  const html = renderToStaticMarkup(createElement(ResultCard, { result: score(s, ROOM) }))
  const pill = html.match(/class="[^"]*verdictPill[^"]*">([^<]+)</)?.[1] ?? null
  const rooms = [...html.matchAll(/class="[^"]*roomBadge [^"]*">([^<]+)</g)].map((m) => m[1])
  return { pill, rooms }
}

const at1m = (over: Partial<Speaker>): Speaker => ({ ...EMPTY_SPEAKER, name: 'x', spl_peak_db: 95, spl_ref_distance_stated: true, ...over })
const PILL_FOR: Record<string, string[]> = { green: ['Suitable'], yellow: ['Suitable with limits', 'Borderline'], red: ['Not suitable'] }
const worst = (a: string, b: string) => (a === 'red' || b === 'red' ? 'red' : a === 'yellow' || b === 'yellow' ? 'yellow' : 'green')

describe('result card', () => {
  it('never shows a pill greener than the engine', () => {
    const cases = [
      ...EXAMPLES.map((e) => e.speaker),
      at1m({}), // no frequency range
      at1m({ freq_low_hz: 60, freq_high_hz: 5000 }), // 8 kHz missing
    ]
    for (const s of cases) {
      const r = score(s, ROOM)
      const { pill } = card(s)
      if (pill === null) continue
      expect(PILL_FOR[worst(r.light, r.room_light)], `${s.name || 'custom'}: ${r.light}/${r.room_light}`).toContain(pill)
    }
  })

  it('offers no room larger than the headline when the Bass Ratio bands are missing', () => {
    const speak = EXAMPLES.find((e) => e.id === 'jabra-speak2-75-speak')!.speaker
    const r = score(speak, ROOM)
    expect(r.headline).toBe('Rooms up to about 50 m², without Bass Ratio')
    const c = card(speak)
    ROOM_CLASSES.forEach((rc, i) => {
      if (rc.area_m2 > r.full.max_area_m2) expect(c.rooms[i], rc.label).not.toBe('Without Bass Ratio')
    })
    expect(text(speak)).not.toMatch(/Reverberation time[^+]*175\+/)
  })

  it('shows every preset without throwing', () => {
    for (const e of EXAMPLES) expect(text(e.speaker)).toContain(e.speaker.name)
  })
})

describe('speaker form', () => {
  it('assumes 1 m, as it says, once the distance is no longer stated', () => {
    const jabra = EXAMPLES.find((e) => e.id === 'jabra-speak2-75')!.speaker
    expect(jabra.spl_ref_distance_m).toBe(0.5)
    const s = withDistanceStated(jabra, false)
    expect(s.spl_ref_distance_stated).toBe(false)
    expect(s.spl_ref_distance_m).toBe(1)
    expect(withDistanceStated(jabra, true)).toEqual(jabra)
  })
})
