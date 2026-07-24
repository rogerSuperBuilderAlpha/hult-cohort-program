# Discord-to-Relay migration plan

Relay 65 should replace Discord through a deliberate cutover, not by running two primary systems indefinitely.

## Channel mapping

| Discord use | Relay destination |
|---|---|
| Server announcements | `#announcements` |
| General cohort chat | `#general` |
| Build/deploy coordination | `#ship-room` |
| Peer-review coordination | `#reviews` |
| Technical blockers | `#help-desk` |
| Social conversation | `#random` |
| Private Discord DM | Relay 1:1 DM |
| Long reply chain | Relay thread |
| Pinned project/task link | Channel PM board card or task unfurl |

## Cutover

### T-2 days

- Deploy Relay on its final HTTPS domain.
- Verify GitHub OAuth, admin bootstrap, PM deep links, rules, and mobile behavior.
- Post a five-minute onboarding video or annotated screenshot.
- Publish the exact cutover date in Discord and Relay.

### T-1 day

- Invite the cohort through the existing program channel.
- Ask participants to complete GitHub sign-in and send one message in `#general`.
- Keep Discord writable only for migration support.
- Move current deadlines, operator announcements, and canonical PM links into Relay.

### Cutover day

- Post the final Discord announcement with the Relay URL.
- Set Discord cohort channels to read-only where operator permissions allow.
- Route all new official communication, build coordination, and DMs through Relay.
- Keep one Discord message pointing to Relay and the support contact.

### T+7 days

- Review access requests, failed logins, reports, notification complaints, and channel noise.
- Archive redundant Relay channels rather than allowing sprawl.
- Export any records required by program policy before removing Discord access.

## What not to migrate

Avoid bulk-importing casual Discord history. Import only durable context that participants still need: current decisions, active blockers, deadlines, PM links, and operator instructions. This protects privacy, reduces noise, and gives Relay a clean information architecture.

## Success signals

- All enrolled participants can authenticate.
- Official announcements are posted only in Relay.
- Project discussions link back to canonical PM tasks.
- Participants can find recent decisions and asks through search.
- Discord receives no new cohort-operational messages after cutover.
