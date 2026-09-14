---
title: Microsoft 365 Integration
sidebar_label: Microsoft 365 Integration
description: Connect a customer's Microsoft 365 tenant to BETTERMEETINGROOMS through Microsoft Entra ID tenant-wide admin consent.
---

# Microsoft 365 Integration

Connect a customer's Microsoft 365 tenant to BETTERMEETINGROOMS through Microsoft Entra ID tenant-wide admin consent.

## What It Does

Links a BETTERMEETINGROOMS organization to the customer's **Microsoft Entra ID tenant**:

- An organization admin generates a **consent link**
- A Microsoft Entra administrator of the customer's tenant **approves it**
- BETTERMEETINGROOMS **verifies the grant** and stores the tenant connection on the organization

Once connected, BETTERMEETINGROOMS can obtain **app-only Microsoft Graph tokens** for the tenant — the foundation for Microsoft Graph–based features. The current release establishes the connection itself; **no data is synced yet**.

:::info Scope note
Consent only covers the permissions statically declared on the BETTERMEETINGROOMS app registration, which are shown on the Microsoft approval screen. It can be revoked at any time from the customer's Entra admin center.
:::

## Getting Started

### Prerequisites

- **Server-side**: the BETTERMEETINGROOMS operator must configure the Microsoft app registration. Until then, the Microsoft 365 tab shows *"Microsoft integration isn't configured on this server."*
- **Organization-side**: an account that can edit the organization in BETTERMEETINGROOMS.
- **Customer-side**: a Microsoft Entra administrator of the customer's tenant (e.g. a Global Administrator) to approve the consent.

### Connecting a Tenant

1. Navigate to the organization in BETTERMEETINGROOMS
2. Open **Integrations → Microsoft 365**
3. Either:
   - Click **Connect with Microsoft** to open the Microsoft admin-consent screen yourself, or
   - Click **Copy link for IT admin** and forward the link to the customer's Entra administrator — the link works **without a BETTERMEETINGROOMS account** and stays valid for 7 days
4. The Entra administrator reviews and accepts the requested permissions on Microsoft's approval screen
5. Microsoft redirects back to BETTERMEETINGROOMS, which **verifies the grant** by acquiring an app-only token for the tenant before storing anything
6. The result page confirms the outcome; the Microsoft 365 tab then shows **Connected**, the Entra tenant ID, and when consent was granted

:::note
If Microsoft reports consent but verification hasn't caught up yet (new grants can take a few minutes to propagate on Microsoft's side), the result page says so — reopening the consent link a few minutes later completes the connection.
:::

### Disconnecting

**Disconnect** on the Microsoft 365 tab clears the stored tenant on the BETTERMEETINGROOMS side only. To fully revoke access, the customer's Entra admin must also remove the BETTERMEETINGROOMS enterprise application in their Entra admin center.
