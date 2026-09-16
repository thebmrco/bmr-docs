/**
 * The sources shown to customers. Deliberately free of code references, repository names and
 * internals of the BMR analysis. Leads that were not opened are recorded in the internal method notes.
 */
export interface Source {
  id: string
  citation: string
  what: string
  url?: string
}

export const SOURCES: Source[] = [
  {
    id: 'bmr_analysis',
    citation: 'BETTERMEETINGROOMS measurement analysis.',
    what: 'The signal-to-noise ratio the analysis requires per octave band: 25 dB for a reverberation time at all, 35 dB for no noise warning, 38 dB for T30. The 28 dB line is this tool\'s own margin above 25 dB.',
  },
  {
    id: 'bmr_data',
    citation: 'BETTERMEETINGROOMS measurement data.',
    what: "Stored room measurements used to set the octave-band noise offsets, to check the room-level model and the reverberation-time estimate, and to size the model's uncertainty.",
  },
  {
    id: 'room_level',
    citation: 'Weinzierl (ed.), Handbuch der Audiotechnik, 2nd ed., ch. 11 (Ahnert & Weinzierl), Eq. (24), printed p. 226.',
    what: 'Direct plus reverberant sound pressure in a room, for an omnidirectional source: the direct term falls as 1/(4πr²) and the reverberant term is the classical 4/A, which with Sabine\'s A = 0.161·V/T is 25·T/V. The directivity factor Q in the equation this tool uses is not in Eq. (24); it is the tool\'s own, set to 2 to match the BETTERMEETINGROOMS analysis.',
  },
  {
    id: 'din18041',
    citation: 'DIN 18041:2016-03, 4.2.3, equations (1)–(6).',
    what: 'Target reverberation time T_soll = a·log10(V) + b per usage type, used when the room has not been measured.',
  },
  {
    id: 'sweep_offset',
    citation: 'Weinzierl (ed.), Handbuch der Audiotechnik, 2nd ed., ch. 17 (Goertz & Makarski), printed pp. 430–431.',
    what: 'Manufacturer maximum-SPL figures are mostly measured with pink noise at full drive and reported as the highest peak; a sine sweep has a crest factor of 3 dB. The tool assumes a sweep reaches 12 dB below the rating, which is conservative and will be replaced by full-volume measurements.',
  },
  {
    id: 'en12354_6',
    citation: 'EN 12354-6:2003, (4.6) and (5).',
    what: 'Validity of diffuse-field predictions: in rooms that are not diffuse the real reverberation time can be up to twice the prediction of that standard\'s model.',
  },
  {
    id: 'bo_explore',
    citation: 'Bang & Olufsen, Beosound Explore product sheet, 02.2022 V03.',
    what: 'Max loudness at 1 m 91 dB SPL; frequency range 56 – 22 700 Hz; 2 × 30 W Class D; 2 × 1.8" full-range drivers.',
    url: 'https://assets.ctfassets.net/8cd2csgvqd3m/18ihLlRE5rxB5S2NIDpPCi/e0382bc943290a0ededb07bb530be8ee/Beosound_Explore_Product_Sheet_English_0001_Feb2021.pdf',
  },
  {
    id: 'jabra_speak2_75',
    citation: 'Jabra Speak2 75 technical specifications, Rev C, 2024-09-17.',
    what: 'Peak audio output 88 dB SPL at 0.5 m; bandwidth 80 Hz – 20 kHz in music mode, 150 Hz – 14 kHz in speak mode.',
    url: 'https://www.jabra.com/_/media/Jabra_VXi_Product-Documentation/Jabra-Speak2-75/Technical-specifications/RevC/EN-Speak2-75-Tech-Spechs-180924.pdf',
  },
  {
    id: 'teufel_mynd',
    citation: 'Teufel MYND, "Technische Daten", teufel.de product page.',
    what: 'Maximaler Schalldruck 95 dB/1m, Frequenzbereich 52 – 20 000 Hz, 35 W RMS.',
    url: 'https://teufel.de/mynd-107002004',
  },
  {
    id: 'pohler_2025',
    citation:
      'Pohler, Room Acoustic Analysis and Material Estimation Using Reduced Measurement Setup, Master thesis (MEng), supervisors Prof. Dr. F. Melchior (Stuttgart Media University) and Univ. Prof. Dr. techn. A. Sontacchi (Institute of Electronic Music and Acoustics, University of Music and Performing Arts Graz), 2025.',
    what: 'Parallel measurements of real meeting rooms with professional reference equipment and a smartphone and Bluetooth loudspeaker chain; finds the advantages and the limitations of a mobile setup.',
  },
  {
    id: 'derived',
    citation: 'Derived in this tool, from the datasheets listed on the method page.',
    what: 'Level per watt at 1 m for a loudspeaker with no published maximum, the median of the datasheets here that publish a maximum level, its distance and a wattage (69.2, 73.2, 74.2, 79.6, 84.0 dB per watt). Also the octave band edges, f_c/√2 … f_c·√2.',
  },
]

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s]))
