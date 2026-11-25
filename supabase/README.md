# Supabase

The database schema, security rules and default categories for MDR.

## Set up a project

1. Create a project on [supabase.com](https://supabase.com/dashboard). Keep
   **Enable Data API** on. The migrations grant table access themselves, so
   automatic grants can stay off.
2. Copy `.env.example` to `.env.local` and fill in the project URL and the
   publishable key (`sb_publishable_...`). Never use the secret or
   `service_role` key.
3. Apply the schema with one of the two options below. Use the same option for
   later changes.

### Option A: Supabase CLI

Run these from the project folder, with version 3 of the CLI. The project ref
is the first part of the project URL. `login` opens the browser, and `link` and
`db push` may ask for the database password.

Database commands target a local stack unless they end in `--remote`. Before
changing the hosted project, `db push` asks for confirmation; answer `y`.

```powershell
npx supabase login
```

```powershell
npx supabase link --project-ref <project-ref>
```

```powershell
npx supabase db push --include-seed --remote
```

`supabase/config.jsonc` is committed, so `supabase init` isn't needed. Later
migrations need only `db push`.

### Option B: SQL editor

In the dashboard's **SQL Editor**, run each file in `supabase/migrations/` once,
in number order, then run `supabase/seed.sql`. The CLI does not know about
migrations applied this way, so a later `db push` would try to run them again.

## Check the result

Run this in the SQL editor. It should return 16 rows (15 names, with "Other"
once per type).

```sql
select type, name, color from public.categories order by type, sort_order;
```

## Database types

`src/types/database.ts` is hand-written to match the migrations. After linking
the project (Option A), replace it with generated types:

```powershell
npm run db:types
```

## Change the schema

Add a new numbered file in `supabase/migrations/`. Don't edit a file that has
already been applied.

## Keep-alive

Free projects pause when the database sees too little activity over a week.
`.github/workflows/keepalive.yml` queries it daily. Add two repository secrets
under **Settings → Secrets and variables → Actions**:

| Secret              | Value               |
| ------------------- | ------------------- |
| `SUPABASE_URL`      | The project URL     |
| `SUPABASE_ANON_KEY` | The publishable key |

The schedule runs only from the default branch. To test it, open **Actions →
Keep Supabase awake → Run workflow**. GitHub turns scheduled workflows off in a
public repository after 60 days without repository activity.

## Backups

The Free plan has no point-in-time recovery. Once a month, save a dump outside
the repository (the command needs Docker):

```powershell
npx supabase db dump -f ..\mdr-backup.sql --remote
```

This saves the schema. Add `--data-only` and a second file name for the rows.
