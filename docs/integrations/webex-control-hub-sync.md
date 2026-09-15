---
title: Webex Control Hub Sync
sidebar_label: Webex Integration
description: Connect your Webex organization to BETTERMEETINGROOMS and keep locations and rooms in sync automatically.
---

# Webex Control Hub Sync

BETTERMEETINGROOMS (BMR) can connect to your Webex organization and automatically import your **locations** and **workspaces (rooms)** from Control Hub. Once connected, the sync runs on a schedule and keeps room names, capacities, and location assignments up to date — no manual data entry.

## Prerequisites

- **Webex side:** a Webex **full administrator** for your organization (needed once, to authorize the app in Control Hub).
- **BMR side:** edit access to your organization's settings.

## Step 1 — Authorize the Service App in Control Hub

The integration uses a Webex **Service App** called *Better Meeting Rooms*. Your Webex administrator has to approve it once:

1. Sign in to [Webex Control Hub](https://admin.webex.com) as a full administrator.
2. Go to **Apps → Service Apps** and locate **Better Meeting Rooms**.
3. Review the requested permissions (read-only access to your organization's locations and workspaces) and click **Authorize**.

:::note
The app only ever **reads** locations and workspaces. It does not modify anything in your Webex organization.
:::

## Step 2 — Connect your organization

1. In BMR, open **Organization → Integrations → Webex**.
2. Paste the organization's **refresh token** into the **Connect Webex Organization** form — it is available on [developer.webex.com](https://developer.webex.com) after the authorization (your BMR contact can help with this step).
3. Click **Connect**. The token is verified against Webex; your Webex organization's name appears when the connection succeeds.

## Step 3 — Configure the sync

| Setting | What it does |
|---|---|
| **Enable automatic sync** | Turns the scheduled sync on or off. |
| **Sync interval** | How often the sync runs, in minutes (5–1440). |
| **Sync locations** | Imports and updates locations from Control Hub. |
| **Sync workspaces (rooms)** | Imports and updates rooms from Control Hub workspaces. |
| **Soft-delete items removed from Webex** | If a location/room disappears from Webex, it is archived here too. |
| **Default location** | Where rooms land when their workspace has no location in Webex. |

:::warning Before your first sync
If some of your Webex rooms already exist in BMR (created manually), the first sync will import them **again as duplicates**. Prevent this by adding the Webex workspace ID to each existing room first — see [Avoiding duplicate rooms](#avoiding-duplicate-rooms) below.
:::

Click **Save Settings**, then use **Sync Now** to run the first import immediately.

## Avoiding duplicate rooms

If you already created rooms manually **before** connecting Webex, the sync would import their Webex counterparts as new, duplicate rooms. To prevent that, link each existing room to its workspace first:

1. Open the room for editing and find the **Control Hub Id** field.
2. Paste the room's **Webex workspace ID** (your BMR contact can provide the list). The helper line below the field decodes the ID so you can double-check it matches the workspace shown in Control Hub.
3. Save. On the next sync the room is updated in place instead of duplicated.

Rooms and locations that came from Webex show a **Webex** badge and their synced fields (name, capacity) are managed by the sync.

## Monitoring and troubleshooting

The Webex Sync panel shows the last sync time, status, and counts of created/updated items.

| Message | What to do |
|---|---|
| *The Webex authorization has expired or been revoked* | Have your Webex admin re-authorize the Service App in Control Hub, then reconnect with a fresh token (Step 2). |
| *Couldn't reach Webex* / *Webex didn't respond as expected* | Temporary network or Webex outage — try again in a few minutes. |
| *Webex refused the request* | The app's authorization in Control Hub is missing scopes — re-authorize it. |
| *The last sync took too long and was cancelled* | Try again — if it keeps timing out, your Webex organization may be too large for a single sync. |

## Disconnecting

1. In **Organization → Integrations → Webex**, click **Deactivate**. This stops syncing and deletes the stored token.
2. To fully revoke the app's access, your Webex administrator should also remove the *Better Meeting Rooms* authorization in **Control Hub → Apps → Service Apps**.

:::info
Deactivating keeps all already-imported rooms and locations — only the connection is removed.
:::
