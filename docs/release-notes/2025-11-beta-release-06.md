---
title: November 2025 – Beta Release 06
description: Latest improvements across iOS, Web, Back-end, and Design workflows
---

# November 2025 – Beta Release 06

This release brings major updates across **iOS**, **Web**, **Backend**, and **3D Design**, improving the Discovery workflow, AR capabilities, markers, task handling, design processing, and the overall user experience.

---

## 📱 iOS & AR Improvements

<details className="bmr-details">
<summary className="bmr-summary">Display Markers Inside 3D Scan View</summary>

Users can now view all captured markers directly inside the 3D scan visualization.

**Highlights**
- Marker icons appear at correct coordinates  
- Tapping reveals marker thumbnails  
- Toggle markers on/off  
- Works for both scan markers and standalone markers  
- Uses the same UI as the post-marker-placement view  

**Screenshots**

![3D Markers 1](/img/release/2025-11-Marker-3D-view-1.png)

![3D Markers 2](/img/release/2025-11-Marker-3D-view-2.png)

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Swipe Between Markers in Fullscreen View</summary>

Users can now swipe horizontally between markers in fullscreen mode.

**Highlights**
- Swipe left/right to move between markers  
- Smooth animated transitions  
- Loops from last → first  
- Works across any marker set  

**Screenshot**

![Swipe Markers](/img/release/2025-11-Marker-swipe-side.png)

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Handle Non-LiDAR Devices Gracefully</summary>

The app now detects when the device does not support LiDAR and prevents crashes by showing a clear user message.

**What’s new**
- Stable behaviour on non-LiDAR devices  
- Clean fallback flows for:
  - Scanning  
  - Markers  
  - AR placement (future)  

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Improved Acoustic Recording (Raw Audio Mode)</summary>

To support balloon-pop or manual impulse responses, the app now records fully raw audio without Apple’s processing.

**Includes**
- `AVAudioSession` measurement mode  
- Uncompressed PCM  
- Disabled AGC, noise suppression, and echo cancellation  

Results in much more accurate acoustic measurements.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Marker Coordinate Storage (Backend + iOS)</summary>

Marker captures now store precise metadata:

- Camera position  
- Camera orientation  
- Marker 3D coordinates  

This enables accurate alignment between markers and the scan model.

</details>

---

## 🖥️ Web Enhancements

<details className="bmr-details">
<summary className="bmr-summary">New BMR Web Landing Page (Activity + My Tasks)</summary>

A completely redesigned landing page shows:

- Recent room updates across your organisations  
- Your open tasks, filtered by organisation  
- A modern and clean layout  
- High-priority information surfaced immediately  

**Screenshot**

![New BMR Home](/img/release/2025-11-New-BMR-home-page.png)

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Automatically Populate Equipment List When Uploading a Design</summary>

The platform now automatically extracts equipment information from uploaded GLB files.

**Highlights**
- Reads `CatalogID` from 3D objects  
- Auto-generates equipment list  
- No manual entry needed  

**Screenshot**

![Equipment List](/img/release/2025-11-Equipment-list.png)

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Assign New Task Types on Room Page</summary>

Two new Discovery tasks can now be assigned directly from a room:

- **Create Acoustic Measurement**  
- **Create AR Design** (future feature)  

**Screenshot**

![Tasks Update](/img/release/2025-11-Tasks-AR-Acoustic-update.png)

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Persistent Search Results</summary>

Search results are now fully preserved when navigating back.

**Includes**
- Previous search term  
- Results list  
- Scroll position  
- No reloads required  

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Improved Room Details Page (Task Status UI)</summary>

The task status section now clearly displays:

- Discovery & Design tasks  
- Completion timestamps  
- Task owners  
- Quick “View [item]” navigation  
- Collapsible sections  

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Coverage View Toggle (One Active at a Time)</summary>

Camera / Screen / Microphone coverage layers now behave cleanly — only one can be active at a time.

Reduces visual noise and improves clarity.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Validation When Adding New User</summary>

A confirmation dialog now appears:

> “Send invitation to [email]?”

Users can edit the email before sending — reducing accidental invitations.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Mandatory Description When Uploading a Design</summary>

The design upload form now requires a description, ensuring consistency and clarity.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Fix: Design Status Refresh</summary>

The design list now updates instantly after:

- Approving a design  
- Requesting changes  

No need to refresh manually.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Other Improvements</summary>

This release includes fixes to:

- Marker breadcrumbs  
- My-Tasks visibility for organisation-level tasks  
- Location deletion  
- Back/Edit button alignment  
- Task retrieval across organisations  

</details>

---

## 🎨 UI & Visual Fixes

<details className="bmr-details">
<summary className="bmr-summary">Navigation Bar Visual Improvements (iOS)</summary>

Resolved liquid-glass UI issues affecting:

- Title contrast  
- Icon alignment  
- Background appearance  

Ensures a polished and consistent top navigation bar.

</details>

---

This concludes **Beta Release 06 (November 2025)**.