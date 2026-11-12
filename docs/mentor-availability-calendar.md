# Mentor availability and booking calendar

## Workflow

- Mentors publish exact future start/end times in a selected IANA timezone. Calendar selection can fill the time form; the start and end can also be entered directly.
- Only students with an existing `TeacherStudent` link can see and request that mentor's open time.
- A request remains pending until the mentor approves or declines it. Multiple linked students may request the same open time; approval reserves the time and declines the other pending requests.
- Approval creates one `ClassSchedule` entry and, when the mentor has Google Calendar connected, one Google Calendar event with the student invited.
- Students may withdraw pending requests. Mentors may remove open time or cancel an approved session. Parents see only their own active children's request/booking status and cannot take actions.
- Administrators can inspect mentor slots and request/student details from the separate AES-Admin portal.

All slot instants are stored as UTC values, alongside the mentor timezone used to enter them. Local times skipped or repeated during daylight-saving transitions are rejected to avoid ambiguous bookings. Overlapping slots and conflicts with scheduled classes are rejected; approval checks for conflicts again to cover schedule changes after a request.

## Database deployment

The `MentorAvailabilitySlot` and `MentorSlotBooking` models and SQL migration exist only in AES. AES-Admin uses its own database and accesses this information through an admin-session-protected proxy that calls AES's read-only integration endpoint using a server-to-server bearer key.

Apply the migration only to the AES database and regenerate only the AES Prisma client:

```sh
cd AES
npx prisma migrate deploy
npx prisma generate
```

Do not apply the booking migration to AES-Admin's separate database. Do not use `db push` on production as a substitute for reviewing and applying the migration.

Configure `AES_ADMIN_CALENDAR_API_KEY` as the same high-entropy secret (at least 32 characters) in both server environments, and set `AES_API_BASE_URL` in AES-Admin to the AES server origin. Generate the shared key out of band, for example with `openssl rand -base64 32`. Never expose the key in a `NEXT_PUBLIC_` variable or send it to a browser. The AES integration endpoint and the AES-Admin proxy both require valid server-side configuration; the proxy also requires an authenticated allowed admin session.

## Notification and external sync behavior

AES sends request/decision emails to the student and mentor. If an email or Google Calendar operation fails after the booking change is saved, the API reports a warning instead of pretending the booking failed; Google sync failures are recorded on the booking and can be retried by the mentor. Google Calendar is optional: bookings remain valid AES schedule entries if a mentor has not connected it.
