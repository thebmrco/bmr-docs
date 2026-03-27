# Webex Control Hub Sync

:::info Beta feature — available on request
Webex Control Hub Sync is currently in **Beta** and available to selected users on request. A full public release is coming soon. Contact the BMR team to get access.
:::

Keep your rooms and locations in sync between Cisco Webex Control Hub and BETTERMEETINGROOMS — automatically.

## What It Does

The Webex Control Hub integration imports your Webex **locations** and **workspaces** (rooms) into BETTERMEETINGROOMS. Once connected, it syncs automatically on a schedule so your room data stays up to date without any manual work.

- Locations from Webex become Locations in BETTERMEETINGROOMS
- Workspaces from Webex become Rooms in BETTERMEETINGROOMS
- New items are created, existing items are updated, and optionally removed items can be deleted



## Getting Started

### Prerequisites

- An **Admin** account in BETTERMEETINGROOMS
- Access to your organization's **Cisco Webex Control Hub**

### Connecting Your Organization

1. Navigate to your organization in BETTERMEETINGROOMS
2. Open the **Webex Sync** section
3. In Webex Control Hub, generate an **activation code** for your organization
4. Paste the activation code into BETTERMEETINGROOMS and click **Activate**
5. Your locations and rooms will begin syncing automatically

Once activated, you'll see the connection status and your Webex organization name confirmed in the settings panel.

## Sync Settings

After activation, you can configure how the sync behaves:

| Setting | Default | What it does |
|---------|---------|--------------|
| **Enabled** | On | Turn the sync on or off without disconnecting |
| **Sync interval** | Every 60 minutes | How often data is pulled from Webex (5 min to 24 hours) |
| **Sync locations** | On | Import and update locations from Webex |
| **Sync workspaces** | On | Import and update rooms/workspaces from Webex |
| **Archive removed items** | Off | Automatically archive rooms or locations that were deleted in Webex |
| **Default location** | None | Assign a fallback location for Webex workspaces that don't have one |

## Monitoring Sync Status

The Webex Sync overview (available to admins) shows the status of each connected organization:

- **Success** — Last sync completed without issues
- **Error** — Something went wrong (details are shown inline)
- **In Progress** — A sync is currently running

You can also see:
- When the last sync ran
- How many locations and rooms were created or updated
- Any error messages from the last sync

### Manual Sync

If you don't want to wait for the next scheduled sync, click **Sync Now** to trigger an immediate sync.

## Disconnecting

To disconnect an organization from Webex Control Hub:

1. Go to your organization's Webex Sync settings
2. Click **Deactivate**
3. Confirm the action

This removes the stored credentials and stops all syncing. Your existing rooms and locations in BETTERMEETINGROOMS are **not** deleted — only the connection is removed.

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| Sync shows **Error** status | Expand the error message for details. Common causes: expired credentials, Webex API downtime, or network issues. Try deactivating and reactivating. |
| Rooms are missing a location | Webex workspaces without a location are skipped unless you set a **default location** in the sync settings. |
| Sync seems stuck (In Progress for a long time) | Syncs that run longer than 30 minutes are automatically reset. If it persists, try triggering a manual sync. |
| Changes in Webex aren't showing up | Check the sync interval. Changes appear after the next scheduled sync, or use **Sync Now**. |
| Deleted rooms keep reappearing | Enable **Archive removed items** in the sync settings to automatically archive items removed from Webex. |
