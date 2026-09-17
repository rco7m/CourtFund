# Firebase setup

This app used to run on Supabase; it now runs on Firebase (Auth + Firestore), using the plain `firebase` JS SDK (not `@react-native-firebase`), configured entirely from `.env`.

## 1. Create the project pieces in the Firebase console

1. [Firebase console](https://console.firebase.google.com) → create or open your project.
2. **Project settings → General → Your apps → Add app → Web** (the `</>` icon — not Android/iOS; the JS SDK uses the web app config regardless of platform). Register it, then copy the config values it shows you (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) into `.env` (see `.env.example`).
3. **Build → Authentication → Sign-in method** → enable **Email/Password**.
4. **Build → Firestore Database → Create database** (production mode is fine — access is governed by `firestore.rules`, not this mode toggle).

## 2. Deploy security rules and indexes

`firestore.rules` and `firestore.indexes.json` at the repo root mirror the app's old Postgres RLS policies as closely as Firestore's model allows. Deploy them with the [Firebase CLI](https://firebase.google.com/docs/cli):

```sh
npm install -g firebase-tools
firebase login
firebase use --add   # pick this project
firebase deploy --only firestore:rules,firestore:indexes
```

Or paste `firestore.rules` into **Firestore → Rules** in the console by hand, and let the app hit the auto-generated index-creation links the first time each query runs in dev.

## 3. Known trade-off: cost-split creation is client-side

The old Postgres schema (`src/migrations/`) ran cost-splitting and stats-syncing behind `security definer` functions / triggers — fully server-trusted. That logic is now reimplemented client-side in `src/data/splits.ts` and `src/data/profiles.ts` (no Cloud Functions, staying on Firebase's free Spark plan), which means:

- `createCostSplit` has the *host's own client* write `expenses`, `cost_split_members`, and `app_notifications` documents on behalf of the teammates being split with. `firestore.rules` allows this only when the new doc is tagged `created_by == <host>` and carries a `split_id` — but a motivated user could still call it with fabricated amounts, since there's no server-side check of the math.
- If that risk matters later, move `createCostSplit` (and the stats recompute in `recomputeMyStats`) into a Cloud Function and tighten the rules to deny direct client writes to those collections.

## 4. `src/migrations/*.sql`

Left in place as a historical reference for the old schema/business logic — they no longer run against anything and aren't part of the Firebase setup.
