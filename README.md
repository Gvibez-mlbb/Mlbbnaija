# MLBB Naija — Website

A community website for Nigerian Mobile Legends: Bang Bang players: profiles, squads,
tournaments, a full 133-hero meta list, and news.

## 1. Set up Firebase (free, ~5 minutes)

This is what makes data real and shared between everyone who visits the site.

1. Go to https://console.firebase.google.com and sign in with Google.
2. Click **Add project**, name it (e.g. `mlbb-naija`), finish the wizard.
3. In the left sidebar: **Build > Firestore Database > Create database**. Choose a
   location close to Nigeria (e.g. `eur3` or `europe-west1`), start in **test mode**.
4. Click the gear icon (top left) > **Project settings > General**, scroll to
   "Your apps", click the `</>` (web) icon, register the app (nickname anything).
5. Firebase shows you a `firebaseConfig` object. Copy it into
   `src/firebase.js` in this project, replacing the placeholder values.
6. In Firestore > **Rules** tab, paste the contents of `firestore.rules` from this
   project and click Publish. (This keeps it open for friends testing — lock it down
   with real authentication before a public launch.)

## 2. Run it locally to check it works

```
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## 3. Deploy it for free (Vercel)

1. Push this folder to a GitHub repo (create one on github.com, then:
   `git init && git add . && git commit -m "init" && git remote add origin <your-repo-url> && git push -u origin main`)
2. Go to https://vercel.com, sign up with GitHub, click **Add New > Project**,
   import the repo. Vercel auto-detects Vite — just click **Deploy**.
3. You'll get a live URL like `mlbb-naija.vercel.app` within a minute. Share that
   with friends right away to test.

## 4. Connect mlbbnaija.com

1. Buy the domain from a registrar — Namecheap, GoDaddy, or Porkbun all work
   (roughly $10–15/year for a `.com`).
2. In your Vercel project: **Settings > Domains > Add**, type `mlbbnaija.com`.
3. Vercel shows you DNS records (usually an A record and/or CNAME) to add at your
   registrar. Add them in the registrar's DNS settings page.
4. DNS takes anywhere from a few minutes to ~24 hours to propagate. Once it does,
   `mlbbnaija.com` points straight at your live site.

## Notes for your redesign

- Colors/fonts live inline in each component in `src/App.jsx` — easiest to search
  for hex codes like `#00D9C0` (teal), `#FFB800` (gold), `#0B0E14` (background).
- Layout structure: `App` renders the header/nav + routes to one of five tab
  components (`ProfileTab`, `SquadsTab`, `TournamentsTab`, `MetaTab`, `NewsTab`).
- Shared UI pieces (`Section`, `Field`, `PrimaryButton`, `EmptyState`) are reused
  across tabs — restyle those once and it updates everywhere.
