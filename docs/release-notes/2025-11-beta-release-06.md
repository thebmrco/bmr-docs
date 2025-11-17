---
title: November 2025 – Beta Release 06
description: Latest improvements across iOS, Web, Back-end, and Design workflows
---

# November 2025 – Beta Release 06

This release brings major updates across **iOS**, **Web**, **Backend**, and **3D Design**, improving the Discovery workflow, AR capabilities, markers, tasks, design handling, and the overall user experience.

---

## 📱 iOS & AR Improvements

### ▶️ Display Markers Inside 3D Scan View
<details>
<summary><strong>Show details</strong></summary>

Users can now view all captured markers directly inside the 3D scan visualization.

**Highlights**
- Marker icons appear at correct coordinates  
- Tapping shows marker thumbnails  
- Toggle markers on/off  
- Works for both scan markers and standalone markers  
- Same UI as post-marker-placement view  

**Screenshots**

![3D Markers 1](/img/release/2025-11-Marker-3D-view-1.png)  
![3D Markers 2](/img/release/2025-11-Marker-3D-view-2.png)

</details>

---

### ▶️ Swipe Between Markers in Fullscreen View
<details>
<summary><strong>Show details</strong></summary>

Users can now swipe horizontally between markers when viewing them in fullscreen.

**Highlights**
- Swipe left/right between markers  
- Smooth animated transitions  
- Loops from last → first  
- Works inside any marker context  

**Screenshot**

![Swipe Markers](/img/release/2025-11-Marker-swipe-side.png)

</details>

---

### ▶️ Handle Non-LiDAR Devices Gracefully
<details>
<summary><strong>Show details</strong></summary>

The iOS app now detects when the device does not support LiDAR and prevents crashes by showing a clear user message.

**What’s new**
- No crashes on non-LiDAR devices  
- Graceful fallback for:
  - Scanning  
  - Markers  
  - AR placement (future)  

</details>

---

### ▶️ Improved Acoustic Recording (Raw Audio Mode)
<details>
<summary><strong>Show details</strong></summary>

To support balloon-pop or manual impulse responses, the app now avoids built-in Apple audio filtering using:

- `AVAudioSession` **measurement mode**  
- Uncompressed PCM recording  
- No AGC, noise suppression, or echo cancellation  

This results in more accurate acoustic measurements.

</details>

---


### ▶️ Marker Coordinate Storage (Backend + iOS)
<details>
<summary><strong>Show details</strong></summary>

Marker captures now store:
- Camera position  
- Camera orientation  
- Marker 3D coordinates  

This enables accurate marker-to-scan alignment.

</details>

---

## 🖥️ Web Enhancements

### ▶️ New BMR Web Landing Page (Latest Activity + My Tasks)
<details>
<summary><strong>Show details</strong></summary>

The web now includes a completely new landing page showing:

- Recent activity across your organisations  
- Your tasks filtered by organisation  
- Clean new layout  
- High-priority and recent updates at a glance  

**Screenshot**

![New BMR Home](/img/release/2025-11-New-BMR-home-page.png)

</details>

---

### ▶️ Auto-Populate Equipment List When Uploading a Design
<details>
<summary><strong>Show details</strong></summary>

When uploading a design (GLB), the system now automatically detects equipment objects and populates the equipment list.

- Reads CatalogID from 3D objects  
- Displays equipment list instantly  
- No more manual data entry  

**Screenshot**

![Equipment List](/img/release/2025-11-Equipment-list.png)

</details>

---

### ▶️ Assign New Task Types on Room Page (AR Design & Acoustic)
<details>
<summary><strong>Show details</strong></summary>

You can now assign new Discovery-phase tasks directly from the room home page:

- **Acoustic Measurement**  
- **Create AR Design** (future feature)  

**Screenshot**

![Tasks Update](/img/release/2025-11-Tasks-AR-Acoustic-update.png)

</details>

---

### ▶️ Persistent Search Results
<details>
<summary><strong>Show details</strong></summary>

Search results now remain intact when the user navigates back from a detail page.

- Search term preserved  
- Results list preserved  
- Scroll position preserved  
- No reload needed  

</details>

---

### ▶️ Improved Room Details Page (Task Status UI)
<details>
<summary><strong>Show details</strong></summary>

The room details page now displays:

- Discovery + Design tasks  
- Completion timestamps  
- User who performed tasks  
- “View [item]” navigation links  
- Collapsible sections  

</details>

---

### ▶️ Coverage View Toggle (Only One Active at a Time)
<details>
<summary><strong>Show details</strong></summary>

Camera / Screen / Microphone coverage layers can no longer overlap.

Only one can be active at once → reduces visual clutter.

</details>

---

### ▶️ Validation When Adding New User
<details>
<summary><strong>Show details</strong></summary>

A confirmation dialog now appears:

> “Send invitation to [email]?”

✔️ Email can be edited to fix typos  
✔️ Prevents sending invitations to wrong addresses  

</details>

---

### ▶️ Mandatory Description When Uploading a Design
<details>
<summary><strong>Show details</strong></summary>

Uploading a design now requires a description.  
Prevents unnamed designs and improves project clarity.

</details>

---

### ▶️ Web Refresh Fix After Approving/Requesting Designs
<details>
<summary><strong>Show details</strong></summary>

The design status now updates immediately after:

- Approving  
- Requesting changes  

No more manual page refresh required.

</details>

---

### ▶️ Fixes to Marker Breadcrumbs, Task Lists, Location Deletion, My-Tasks
<details>
<summary><strong>Show details</strong></summary>

This release includes improvements to:

- Marker breadcrumbs  
- My-Tasks visibility for organisation-level tasks  
- Location deletion  
- Back/Edit button alignment  
- Task retrieval for all organisations  

</details>

---

## 🎨 UI & Visual Fixes

### ▶️ Navigation Bar Visual Improvements (iOS)
<details>
<summary><strong>Show details</strong></summary>

Fixed alignment and contrast issues caused by Apple’s liquid glass UI on:

- Organisation title  
- User icon  
- Background materials  

</details>

---


# ✅ End of Release Notes  
This concludes **Beta Release 06 (November 2025)**.
