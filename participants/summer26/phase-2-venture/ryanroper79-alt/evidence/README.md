# Metrics evidence

Commit only **production** snapshots exported after real external users complete the calculator.

## Do not commit

- Snapshots where `production_url` is `localhost`
- Snapshots with `aggregate_qualified_user_count` below 25 (target 30+ buffer)

## Export (production)

```bash
# .env.local must point to production Ludwitt + registered venture app_id
APP_PRODUCTION_URL=https://caribbeanenergyauditor.vercel.app
npm run export-metrics
npm run generate-pr-body
```

The JSON file and updated `SUBMISSION_PR.md` are safe to commit when counts and URLs are production values.
