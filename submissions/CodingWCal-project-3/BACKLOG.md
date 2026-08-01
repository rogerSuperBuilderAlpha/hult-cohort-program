# Backlog

## High Priority

- [ ] **Rotate Turso `DATABASE_AUTH_TOKEN`** — the token in `.env.local` is a live read-write credential. Rotate immediately and store via Vercel env vars only.
- [ ] **Add success feedback** after admin project create/update — the form redirects silently with no confirmation banner or toast.

## Medium Priority

- [ ] **Migrate `<img>` to `<Image />`** across all components (6 instances) for automatic optimization, lazy loading, and layout shift prevention.
- [ ] **Add aria associations** to form validation errors in `ProjectForm.tsx` — connect error `<p>` to inputs via `aria-describedby` for screen reader announcements.
- [ ] **Add skip-to-content link** in the root layout for keyboard users.

## Low Priority

- [ ] **Swap `confirm()` dialog** in `DeleteButton.tsx` for a custom `<dialog>` component for consistent cross-browser styling and accessibility.
- [ ] **Handle header nav overflow** on very small viewports (<360px) with a responsive menu.
- [ ] **Add tech stack input validation** — warn if a tech name contains a comma (current split logic can't handle it).
- [ ] **Consider darkening `--color-vibe-muted`** slightly for better WCAG AA contrast margin.
- [ ] **Return structured error states** from server actions instead of silent `null` on auth failures.

## Completed (this session)

- [x] **`focus-visible` ring styles** — added globally in `globals.css`
- [x] **`aria-label` on nav** — added `aria-label="Primary"` to `Header.tsx`
- [x] **"Featured Project" label** — conditionally renders based on `project.featured`
- [x] **Truncate auto-generated slugs** to 120 chars in `actions/project.ts`
- [x] **`aria-hidden` on decorative gradients** — added to `ProjectCard.tsx`
- [x] **Zod max-length constraints** — `.max()` on `description` and `techStack`
- [x] **`JSON.parse` safety** — wrapped in try/catch in `ProjectForm.tsx`
- [x] **Lint errors** — all 3 fixed (ThemeToggle, signout links, error.tsx)
- [x] **Per-segment loading.tsx** — added for `/projects`, `/members`, `/admin`
- [x] **Slug pages confirmed** — `members/[slug]` and `projects/[slug]` all build correctly
