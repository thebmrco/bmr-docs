---
title: November 2025 – Beta Release 05
---

# November 2025 – Beta Release 05

This release introduces new functionality and usability improvements across both the **iOS App** and **Web Platform**.  
All updates have been verified as part of version `BMR-PROD-1.0.3`.

---

## 📱 App (iPhone / iPad)

<details className="bmr-details">
<summary className="bmr-summary">Handle Non-LiDAR Devices Gracefully for Scanning and AR Placement (BMRAPP-637)</summary>

Users on iPhones or iPads without a LiDAR sensor now gets alerted about the incompatibility. 
If they attempt to start a scan or AR placement, a clear message is displayed:

> “Scanning is not supported on this device. Please use a LiDAR-enabled iPhone or iPad.”

All other functionality remains available.

</details>

<details className="bmr-details">
<summary className="bmr-summary">Room Details Page Update with Task Status (BMRAPP-585)</summary>

The Room Details view now lists Discovery and Design tasks with completion indicators, timestamps, and user details.  
Each phase (Discovery / Design / Deployment) is collapsible and dynamically populated from backend data, improving clarity and usability.

</details>

---

## 🌐 Web Platform

<details className="bmr-details">
<summary className="bmr-summary">Implement Web Home Page with Organisation Filter and Dynamic Content Sections (BMRAPP-735)</summary>

A new **Home Page** provides a personalised overview with:
* Greeting header and organisation filter dropdown  
* “Recently Updated Rooms” carousel  
* “Your Open Tasks” table  

The filter persists during a session and updates both lists automatically.

</details>

<details className="bmr-details">
<summary className="bmr-summary">Make Web Search Results Persistent When Navigating Back (BMRAPP-730)</summary>

Search queries and result lists now persist when returning from a detail view.  
The previous search term, results, and scroll position are restored, eliminating the need to repeat searches.

</details>

<details className="bmr-details">
<summary className="bmr-summary">Upload Design Comment Is Now Mandatory (BMRAPP-740)</summary>

When uploading a new design, users must now provide a description before submission, ensuring traceability and review context.

</details>

---

## 🧩 Additional Notes


---

_Release prepared by the Better Meeting Rooms team – November 2025_