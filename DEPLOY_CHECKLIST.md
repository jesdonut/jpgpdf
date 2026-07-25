# Deploy & teardown checklist — `jessleaving` → production

This branch is the standalone, no-backend version (Leopalace / PDF / Builder).
It is meant to **replace everything on 17 August**.

**Order matters.** Doing these out of order takes the live site down.

---

## Before 17 August (do now, while the Supabase DB is still alive)

- [ ] **1. Export anything worth keeping.**
  Supabase Dashboard → **Table Editor** → pick a table → top-right **⋮** → **Export data as CSV**.
  Do it for each table: `workers`, `tenpo_master`, `municipalities`,
  `kyoryoku_submissions`, `interviews`, `interview_questions`,
  `interview_answers`, `worker_locations`, `worker_templates`, `team_notes`,
  `teams`, `profiles`.
  Save somewhere personal. **Unrecoverable once the project is deleted.**

- [ ] **2. Confirm ownership.**
  Supabase → Settings → General: project is under *your* account, not a
  company org. Same check for Vercel and GitHub. If any is company-owned you
  can't delete it after losing access — and they can.

---

## On 17 August — in this exact order

- [ ] **3. Deploy the new version first.**
  ```
  git checkout main
  git merge jessleaving
  git push origin main
  ```
  Wait for Vercel to go green. The site is now standalone and no longer
  touches Supabase.
  > ⚠️ Do NOT delete Supabase before this. Current production still calls it —
  > delete the DB first and the live site breaks until you merge.

- [ ] **4. Verify the live site.**
  Open it: Leopalace, PDF, Builder. No login screen, no errors.

- [ ] **5. Delete the Supabase project.**
  Supabase → Settings → General → bottom → **Delete project**. Type the name to
  confirm. Destroys the database, all data, and all auth accounts (teammates'
  logins die here too).

- [ ] **6. Remove dead env vars in Vercel.**
  Vercel → Settings → Environment Variables → delete
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `INVITE_CODE`.

- [ ] **7. Clean local `.env.local`.**
  Delete those same three lines. Keep `NEXT_PUBLIC_SITE_URL`.

---

## Optional, for a clean break

- [ ] **PostHog** — company analytics. Remove `NEXT_PUBLIC_POSTHOG_KEY` from
  Vercel + `.env.local` to stop data flowing there.
- [ ] **Vercel** — if the deployment should die too, Settings → Delete Project.
  Skip if you want to keep the tool for personal use.
- [ ] **GitHub** — old commits contain the company's data history. Consider
  making the repo **private** if it isn't already.
