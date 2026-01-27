# Dadnoos Admin Panel – Bootstrap Notes

## Bootstrap the first superadmin

1. Set the following env vars before starting the server (already present in `.env` for local dev):

```
ADMIN_BOOTSTRAP_EMAIL=admin@dadnoos.local
ADMIN_BOOTSTRAP_PASSWORD=ChangeMeNow123!
ADMIN_SESSION_TTL_HOURS=24
```

2. On the first call to `/api/admin/login`, the backend runs `ensureBootstrapAdmin()` and creates the superadmin user if it does not exist yet. Update the password env variable after the first login or delete it to avoid accidental resets.

## Admin data model

- `AdminUser`: stores admin credentials + role (`SUPERADMIN`, `ADMIN`, `ANALYST`) and status.
- `AdminSession`: persistent HttpOnly cookie session with TTL support.

Regular app tables (User, ChatSession, Message) are **unchanged**.

## Auth & RBAC

- `/api/admin/login` issues a random 48-byte token stored in `AdminSession` and returned via an HttpOnly cookie (`dadnoos_admin_session`).
- `/api/admin/logout` revokes the session and clears the cookie.
- `/api/admin/me` exposes the logged-in admin identity and role (used by the `/admin` layout).
- RBAC helper (`requireAdminAuth`) ensures only admins with the required role can hit `/api/admin/*`.

## Admin UI shell

- `/admin/login` – premium login page using the existing design system.
- `/admin/*` – guarded via the `(protected)` layout. Server-side check redirects unauthenticated visitors back to `/admin/login`.
- `/admin` dashboard currently shows KPI cards based on existing tables. `/admin/users` و `/admin/usage` اکنون جداول زنده برای مدیریت سهمیه کاربران و پایش مصرف توکن دارند.

## Support inbox & audit logging

- `/admin/support` only lists flagged conversations by default. Viewing a transcript always prompts for a “reason”.
- Transcripts for unflagged conversations are blocked unless the operator first filters by an explicit `userId`. The backend enforces this rule and rejects other requests with HTTP 403.
- Every transcript read (and every quota/status change) writes an `AdminAuditLog` record with the operator’s IP/User-Agent and the supplied reason.
- `/admin/audit-logs` exposes these immutable entries with filtering by admin, action type, and date range for oversight.

## Analytics & events

- `/api/admin/dashboard/overview` powers the `/admin` dashboard with KPI cards, daily token/message charts, top-user bars, and module distribution pies (interactive via Recharts).
- Tracking events (chat_request/success/fail, router_decision, summarization_trigger, quota_block, admin_action) are persisted in `TrackingEvent`.
- `/admin/events` visualizes these operational events with filters and a JSON viewer for payload auditing.

## Tests

- Guard helpers ensure `/api/admin/me` rejects unauthenticated requests.
- Session cookie utilities enforce HttpOnly cookies and clearing behavior for logout.
- Quota/usage tests تضمین می‌کنند که نقش Analyst قادر به تغییر سهمیه یا وضعیت نیست، و لاگ مصرف توکن در فراخوانی‌های چت ثبت می‌شود.

## Next steps (future chunks)

- Flesh out Users/Usage/Support/Events/Audit Logs pages + APIs.
- Implement admin audit logging and quota controls.
- Add analytics widgets and support transcript viewers with audit reasons.
