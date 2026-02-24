---
title: February 2026 – Beta Release 09
description: App improvements focused on resilience, navigation, acoustic positioning, and updated design language
---

# February 2026 – Beta Release 09

This release focuses on strengthening the core **App experience**, improving reliability in the Discovery workflow, enhancing navigation between Library and Room contexts, and introducing the first step toward spatially aware acoustic documentation inside the Digital Twin.

---

## 📱 App Improvements

<details className="bmr-details">
<summary className="bmr-summary">New Design Language (Updated Icons & Visual Consistency)</summary>

The App now adopts the updated BMR design language, aligned with the Web platform.

**What’s improved**
- Updated icon set consistent with the Web interface  
- Improved visual hierarchy  
- Cleaner navigation elements  
- More consistent spacing and typography  

This creates a unified experience across App and Web, strengthening platform consistency and reducing cognitive friction when switching between devices.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Extended Resilience During Data Upload</summary>

Uploading scan, marker, and acoustic data is now significantly more robust.

**New behavior**
- Data uploads automatically in the background  
- A status banner clearly indicates upload progress  
- If upload fails, data is safely stored locally  
- Users can manually retry uploads later  

This ensures:
- No data loss due to unstable network conditions  
- Reduced workflow interruptions  
- Improved reliability in field environments  

The Discovery process is now far more resilient when operating on mobile networks or unstable Wi-Fi connections.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Direct Access to Room from Library</summary>

Users can now navigate directly to the associated room from Library items.

Supported items:
- Acoustic measurements  
- Scans  
- Designs  
- Markers  

This eliminates unnecessary back-navigation and significantly improves workflow efficiency when reviewing historical data or continuing work in a room context.

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Acoustic Test Records Position Coordinates (Digital Twin Check)</summary>

Acoustic measurements now capture spatial position data when performed in a room that contains a Digital Twin.

**New functionality**
- The phone’s position is recorded when the acoustic test begins  
- The system checks for an existing Digital Twin before enabling spatial recording  
- Position data will be visualized inside the Digital Twin  

This marks the first step toward a fully spatial acoustic documentation flow, where:

- Speaker positions  
- Measurement positions  
- Historical acoustic states  

will be visualized and comparable over time.

This lays the foundation for future enhancements including:
- Speaker placement documentation  
- Before/after acoustic comparison  
- Advanced acoustic optimization workflows  

</details>

---

<details className="bmr-details">
<summary className="bmr-summary">Library Items Sorted by Last Modified (Default)</summary>

Library content is now sorted by **Last Modified** by default.

This ensures:
- Most recently updated items appear first  
- Faster access to active projects  
- Improved visibility of ongoing work  

The sorting logic better reflects real-world usage patterns and reduces unnecessary scrolling.

</details>

---

## 🖥️ Web Platform

No major Web changes in this release.  
This update primarily strengthens the mobile Discovery and Acoustic workflows.

---

# ✅ End of Release Notes  