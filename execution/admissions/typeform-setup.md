# Typeform setup guide

> **Deprecated.** Applications are on-site at `/apply` and stored in **Firebase Firestore**. See [FIREBASE.md](../marketing/FIREBASE.md) and [application-form.md](application-form.md).

This file is kept for reference only if an external form is needed as fallback.

---

## Original Typeform instructions (archived)

Implement the application form from [application-form.md](application-form.md). Connect to landing page via `NEXT_PUBLIC_APPLY_URL`.

### Recommended: Typeform

1. Create form **Hult Cohort Summer Pilot 2026 Application**
2. Add fields in order (see application-form.md)
3. Settings → Self notifications → cohort@hult.edu
4. Integrations → Webhooks → optional Zapier/Google Sheets for roster
5. Copy share link → set as `NEXT_PUBLIC_APPLY_URL`

---

## Migration to Firebase

| Old (Typeform) | New (Firebase) |
|----------------|----------------|
| Typeform entries | `applications` collection |
| Google Sheets export | Firestore export / Console |
| Zapier auto-reply | Cloud Function or API route + email provider |
| `NEXT_PUBLIC_APPLY_URL` external link | `/apply` on cohort site |
