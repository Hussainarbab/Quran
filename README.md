# Noor-e-Hidayat | Shia Islamic Library

An Expo + React Native app foundation for a Shia Ithna Ashari Islamic library. It includes browser/native routes, device-local preferences and Tasbeeh sessions, searchable sample metadata, and a Supabase schema with publication controls.

## Run the app

Requirements: Node.js LTS and npm.

```bash
npm install
npm run web
```

Expo prints the browser URL (usually `http://localhost:8081`). If that port is occupied, use:

```bash
npm run web -- --port 19007
```

Android development:

```bash
npm run android
```

Validation:

```bash
npm run lint
npm run typecheck
npm run web -- --port 19007
```

## Included in this build

- Expo Router routes for Home, Quran, Duas & Ziyarat, Guides, Calendar, Saved items, Tasbeeh, Search, and Settings.
- Quran and dua/ziyarat search across the included sample metadata.
- On-device bookmarks, recent items, display preferences, Tasbeeh count, and saved sessions.
- Confirmation before resetting the current Tasbeeh count.
- Source/verification status messaging; missing sacred text is not filled with generated content.
- Supabase schema with authenticated user-owned data, public read access limited to approved content, admin-only content writes, and content-change audit records.

## Religious content status

This repository does **not** contain the complete Quran, verified translations, dua/ziyarat texts, reviewed prayer instructions, audio, or a verified Islamic date source. Surah and dua rows in the UI are sample metadata only. These resources must be imported from documented, appropriately licensed editions and independently verified before publication.

The app intentionally does not mark calendar dates as confirmed, present sample records as sacred text, or claim scholar review. The schema is a backend starting point; no Supabase project, authentication session, remote sync, admin UI, notifications, or offline content packages are configured in this local build.

## Supabase setup

1. Create a Supabase project.
2. Apply `supabase/schema.sql` once in the Supabase SQL Editor or through a reviewed migration.
3. Copy `.env.example` to `.env` and configure only the project URL and public anon/publishable key used by the client.
4. Never put a Supabase service-role key in an `EXPO_PUBLIC_*` variable, the app bundle, or source control. Use it only in a trusted server environment.
5. Seed administrator membership through a trusted administrative process. Do not expose admin membership writes to ordinary clients.
6. Add and verify licensed content before setting its status to `approved_for_publication` or `published`.

## Project structure

- `App.tsx` — shared routed screen UI.
- `src/app/` — Expo Router route files and root layout.
- `src/state/AppState.tsx` — persistent device-local state.
- `src/data/libraryData.ts` — sample metadata and verification labels.
- `supabase/schema.sql` — PostgreSQL tables, RLS policies, and audit trigger.
- `.env.example` — public configuration placeholders; contains no service-role secret.
