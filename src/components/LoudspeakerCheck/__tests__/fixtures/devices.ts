/**
 * Real devices, as their datasheets publish them. Collected 2026-09-15; every value was read from
 * `source`. null means "not published". Values in `note` that were added up or converted are marked.
 * Used only by tests — they are not shown in the app.
 */
export interface DeviceSheet {
  id: string
  name: string
  category: 'portable' | 'room-system'
  spl_db: number | null
  /** null: a level is published without a distance. */
  spl_ref_m: number | null
  freq_low_hz: number | null
  freq_high_hz: number | null
  power_w: number | null
  /**
   * Published sensitivity, dB at 1 W / 1 m, where there is one. Recorded, not used for the level: it is a
   * small-signal driver figure, and adding 10 log10(W) to it ignores the compression and limiting that decide the
   * maximum. The check uses DERIVED_SENSITIVITY_DB_W_M, read off datasheets that publish a finished product's
   * maximum level. Only the Poly Studio X30 has one, and its own figure would put it 6 dB louder.
   */
  sensitivity_db: number | null
  woofer_mm: number | null
  note: string
  source: string
}

export const DEVICES: DeviceSheet[] = [
  { id: 'jbl-charge-5', name: 'JBL Charge 5', category: 'portable', spl_db: null, spl_ref_m: null, freq_low_hz: 60, freq_high_hz: 20000, power_w: 40, sensitivity_db: null, woofer_mm: null, note: '30 W woofer + 10 W tweeter RMS (sum added); no SPL published', source: 'https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw9c36c40d/pdfs/JBL_Charge5_SpecSheet_English.pdf' },
  { id: 'jbl-flip-7', name: 'JBL Flip 7', category: 'portable', spl_db: null, spl_ref_m: null, freq_low_hz: 60, freq_high_hz: 20000, power_w: 35, sensitivity_db: null, woofer_mm: null, note: '25 W + 10 W RMS (sum added); no SPL published', source: 'https://pl.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw3447f876/pdfs/PA_JBL_Flip%207_QSG_Global_SOP_V9_online.pdf' },
  { id: 'marshall-emberton-iii', name: 'Marshall Emberton III', category: 'portable', spl_db: 90, spl_ref_m: 1, freq_low_hz: 65, freq_high_hz: 20000, power_w: null, sensitivity_db: null, woofer_mm: null, note: 'Publishes a level and a distance ("90 dB SPL @ 1 m") but no comparable wattage, so it is not in the DERIVED_SENSITIVITY_DB_W_M fit. Its page prints TWO power figures that differ by a factor of four: "2X38 W Class D amplifier" and drivers of 2\u2033 10 W, and does not say which the 90 dB was reached with. 90 dB over 76 W gives 71.2 dB/W/m, over 20 W it gives 77.0 \u2014 read 2026-09-16', source: 'https://www.marshall.com/us/en/product/emberton-iii?pid=1006884' },
  { id: 'marshall-middleton', name: 'Marshall Middleton', category: 'portable', spl_db: 87, spl_ref_m: 1, freq_low_hz: 50, freq_high_hz: 20000, power_w: 60, sensitivity_db: null, woofer_mm: 76.2, note: '2 × 20 W + 2 × 10 W (sum added); 3" woofers converted', source: 'https://www.marshall.com/us/en/product/middleton' },
  { id: 'ue-boom-4', name: 'Ultimate Ears BOOM 4', category: 'portable', spl_db: 85, spl_ref_m: null, freq_low_hz: null, freq_high_hz: null, power_w: null, sensitivity_db: null, woofer_mm: 40, note: '"Maximum sound level 85 dBC (normal)", no distance, no frequency range', source: 'https://us.ultimateears.com/products/boom-4-active-black' },
  { id: 'ue-megaboom-4', name: 'Ultimate Ears MEGABOOM 4', category: 'portable', spl_db: 85, spl_ref_m: null, freq_low_hz: null, freq_high_hz: null, power_w: null, sensitivity_db: null, woofer_mm: 50, note: '85 dBC anechoic / 91 dBC on ground plane; no distance, no frequency range', source: 'https://us.ultimateears.com/products/megaboom-4' },
  { id: 'bo-beosound-a1-2', name: 'Beosound A1 2nd Gen', category: 'portable', spl_db: 92, spl_ref_m: 1, freq_low_hz: 55, freq_high_hz: 20000, power_w: 60, sensitivity_db: null, woofer_mm: 88.9, note: 'range at −10 dB; B&O sheet hosted by a retailer', source: 'https://im9.cz/product-docs/mcgt2ak4k8xuq1od/Produktov%C3%BD%20list%20(EN)%20-%20Bang%20&%20Olufsen%20BeoPlay%20A1%202nd%20Gen.pdf' },
  { id: 'teufel-boomster-4', name: 'Teufel BOOMSTER 4', category: 'portable', spl_db: null, spl_ref_m: null, freq_low_hz: 44, freq_high_hz: 20000, power_w: 42, sensitivity_db: null, woofer_mm: 110, note: '42 W RMS total; no SPL published', source: 'https://teufel.de/boomster-4-107001867' },
  { id: 'soundcore-motion-x600', name: 'Soundcore Motion X600', category: 'portable', spl_db: null, spl_ref_m: null, freq_low_hz: null, freq_high_hz: 40000, power_w: 50, sensitivity_db: null, woofer_mm: null, note: '"40 kHz Wide Frequency", no lower limit; no SPL', source: 'https://www.soundcore.com/products/motion-x600-a3130011' },
  { id: 'cisco-room-bar-pro', name: 'Cisco Room Bar Pro', category: 'room-system', spl_db: 97, spl_ref_m: null, freq_low_hz: 70, freq_high_hz: 22000, power_w: null, sensitivity_db: null, woofer_mm: null, note: '"Max output SPL 97 dB", no distance; 70 Hz – 22 kHz +3/−6 dB', source: 'https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/webex-room-series/room-bar-pro-ds.html' },
  { id: 'cisco-room-bar', name: 'Cisco Room Bar', category: 'room-system', spl_db: 93, spl_ref_m: null, freq_low_hz: 100, freq_high_hz: 20000, power_w: null, sensitivity_db: null, woofer_mm: null, note: '"Max output SPL 93 dB", no distance; 100 Hz – 20 kHz ±3 dB', source: 'https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/webex-room-series/webex-room-bar-ds.html' },
  { id: 'cisco-room-kit-eq', name: 'Cisco Room Kit EQ (Quad Camera)', category: 'room-system', spl_db: 90, spl_ref_m: null, freq_low_hz: 100, freq_high_hz: 20000, power_w: null, sensitivity_db: null, woofer_mm: null, note: '"Max output SPL 90dB", no distance', source: 'https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/room-kit-eq-ds.html' },
  { id: 'poly-studio-x30', name: 'Poly Studio X30', category: 'room-system', spl_db: null, spl_ref_m: null, freq_low_hz: null, freq_high_hz: null, power_w: 5, sensitivity_db: 80, woofer_mm: null, note: 'sensitivity 80 dB (1 W/1 m), 3 W RMS / 5 W max', source: 'https://h20195.www2.hp.com/v2/GetDocument.aspx?docname=c08704960' },
  { id: 'logitech-rally-bar', name: 'Logitech Rally Bar', category: 'room-system', spl_db: 99, spl_ref_m: 0.5, freq_low_hz: null, freq_high_hz: null, power_w: 8, sensitivity_db: null, woofer_mm: 70, note: '"99dB SPL @8.0W … at ½ meter": a level, its distance and the power it was driven at, so it is one of the datasheets DERIVED_SENSITIVITY_DB_W_M is read from. No speaker frequency range', source: 'https://hub.sync.logitech.com/Rally-Bar/post/rally-bar---specifications-y6v2UoNh2YbpNKh' },
  { id: 'logitech-rally-bar-mini', name: 'Logitech Rally Bar Mini', category: 'room-system', spl_db: 99, spl_ref_m: 0.5, freq_low_hz: null, freq_high_hz: null, power_w: 8, sensitivity_db: null, woofer_mm: 70, note: '99 dB @ 8 W at ½ m, the same three figures Logitech publishes for the Rally Bar, so the two count once; sensitivity published twice, contradicting (90 and 86 dB)', source: 'https://hub.sync.logitech.com/rallybarmini/post/specifications---rally-bar-mini-K3ptSACa3kgpz8h' },
  { id: 'jabra-panacast-50', name: 'Jabra PanaCast 50', category: 'room-system', spl_db: null, spl_ref_m: null, freq_low_hz: 80, freq_high_hz: 20000, power_w: null, sensitivity_db: null, woofer_mm: 50, note: 'no SPL, no power published', source: 'https://www.jabra.com/_/media/Jabra_VXi_Product-Documentation/Jabra-PanaCast-50/Tech-specs/RevJ/EN-PanaCast-50-TechSpec_NA-SKUs_28082025.pdf' },
  { id: 'yealink-a20', name: 'Yealink MeetingBar A20', category: 'room-system', spl_db: null, spl_ref_m: null, freq_low_hz: null, freq_high_hz: null, power_w: 5, sensitivity_db: null, woofer_mm: null, note: '"Built-in 5W" speaker; nothing else', source: 'https://www.yealink.com/upfiles/products/datasheet/Yealink-A20-Teams-Zoom-Collaboration-Bar-Datasheet.pdf' },
  { id: 'yealink-a30', name: 'Yealink MeetingBar A30', category: 'room-system', spl_db: null, spl_ref_m: null, freq_low_hz: null, freq_high_hz: null, power_w: 10, sensitivity_db: null, woofer_mm: null, note: '2 × 5 W (sum added)', source: 'https://www.yealink.com/upfiles/products/datasheet/Yealink-MeetingBar-A30-Teams&Zoom-Collaboration-Bar-Datasheet.pdf' },
]
