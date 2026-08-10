# Ludwitt Learning Engineer docs (offline)

Fetched from `https://pitchrise.ludwitt.com/docs/le/`.

Re-fetch when Ludwitt ships updates (see `index.json` for sha256s):

```bash
mkdir -p .ludwitt
for f in llms.txt quickstart.md oauth.md credits.md security.md rate-limits.md errors.md openapi.yaml; do
  curl -sSfL "https://pitchrise.ludwitt.com/docs/le/$f" -o ".ludwitt/$f"
done
```

Start with `llms.txt`, then `oauth.md` + `credits.md` for this BYOB integration.
