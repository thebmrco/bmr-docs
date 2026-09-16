/**
 * This repository is public. Nothing in the Loudspeaker Check may point at BMR's internal services,
 * repositories, databases or their fields — not in code, not in comments, not in the pages.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOTS = ['src/components/LoudspeakerCheck', 'docs/acoustics/loudspeaker-check']

const FORBIDDEN: RegExp[] = [
  /loudspeaker-helper/,
  /bmr_git/,
  /analyze_functions/i,
  /calc_[a-z]/,
  /AudioAnalyzer/i,
  /abmrdb/i,
  /\bANALYZER\b/,
  /4\.0715/,
  /1\.2165/,
  /iem_analyzer/i,
  /peak_normalized/,
  /ambLevelA/,
  /amb_level_a/,
  /ambPerBand/,
  /acoustic_measurement/,
  /floor_area_square_meters/,
  /mos_handler/,
  /speech-level/,
  /rtStandard/,
  /\.sql\b/,
  /\.csv\b/,
  /analysis\//,
  /criterion\.md/,
  /origin\/develop/,
  /bmr_git/,
  /\bdocker\b/i,
  /postgres/i,
]

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

describe('public safety', () => {
  const files = ROOTS.flatMap(walk).filter((f) => !f.endsWith('public-safety.test.ts'))

  it('finds the files it is supposed to check', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  for (const file of files) {
    it(`${file} names nothing internal`, () => {
      const text = readFileSync(file, 'utf8')
      const hits = FORBIDDEN.filter((re) => re.test(text)).map(String)
      expect(hits).toEqual([])
    })
  }
})
