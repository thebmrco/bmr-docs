# Loudspeaker datasheets

The manufacturer datasheets behind the presets of the Loudspeaker Check
(`src/components/LoudspeakerCheck/lib/examples.ts`), saved so the figures can be re-read when a page moves or
changes. Each file is the source named in the preset's `sourceUrl`, retrieved on the date given.

Cisco publishes its data sheets as web pages only; those files are browser printouts of the page, without images.

| Preset | File | Source | Retrieved |
|---|---|---|---|
| Teufel MYND | `teufel-mynd.pdf` — **missing**, see below | https://teufel.de/mynd-107002004 | — |
| Cisco Room Bar Pro | `cisco-room-bar-pro.pdf` | https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/webex-room-series/room-bar-pro-ds.html | 2026-09-19 |
| Beosound Explore | `beosound-explore.pdf` | https://assets.ctfassets.net/8cd2csgvqd3m/18ihLlRE5rxB5S2NIDpPCi/e0382bc943290a0ededb07bb530be8ee/Beosound_Explore_Product_Sheet_English_0001_Feb2021.pdf | 2026-09-18 |
| Cisco Room Bar | `cisco-room-bar.pdf` | https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/webex-room-series/webex-room-bar-ds.html | 2026-09-19 |
| Cisco Room Kit EQ (Quad Camera) | `cisco-room-kit-eq.pdf` | https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/spark-room-kit-series/room-kit-eq-ds.html | 2026-09-19 |
| JBL Xtreme 4 | `jbl-xtreme-4.pdf` | https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwfce87bd2/pdfs/JBL_Xtreme_4_Specsheet_EN_(with_Adaptor).pdf | 2026-09-18 |
| Typical JBL portable (€60–150) | `jbl-clip-5.pdf`, `jbl-flip-6.pdf`, `jbl-charge-5.pdf` — the three it averages | see the rows below | |
| Jabra Speak2 75 (both modes) | `jabra-speak2-75.pdf` | https://www.jabra.com/_/media/Jabra_VXi_Product-Documentation/Jabra-Speak2-75/Technical-specifications/RevC/EN-Speak2-75-Tech-Spechs-180924.pdf | 2026-09-18 |
| JBL Clip 5 | `jbl-clip-5.pdf` | https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw03908bc8/pdfs/JBL%20Clip%205_%20Specsheet_EN.pdf | 2026-09-19 |
| (average) JBL Flip 6 | `jbl-flip-6.pdf` | https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw9e70c712/pdfs/JBL_Flip_6_SpecSheet_English.pdf | 2026-09-19 |
| (average) JBL Charge 5 | `jbl-charge-5.pdf` | https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw9c36c40d/pdfs/JBL_Charge5_SpecSheet_English.pdf | 2026-09-18 |

**Teufel MYND:** Teufel publishes no datasheet file; the figures (95 dB/1 m, 52–20 000 Hz, 35 W RMS, 90 mm woofer)
are on the product page under "Technische Daten". Save that page as a PDF from a browser to `teufel-mynd.pdf`.

When a preset is added to `examples.ts`, add its datasheet here.
