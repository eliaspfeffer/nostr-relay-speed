# Nostr Relay Speed

Web app that measures relay speed using **Nostr relay discovery (NIP-66)**:

1. Query **kind 30166** (relay metadata) events from a bootstrap relay.
2. Extract **21 relay URLs** from the `d` tags of those events.
3. Connect to each discovered relay, request **one event** (kind 1, limit 1), and measure **response time in ms**.
4. Show a **leaderboard** with fastest relays at the top and compare your measured RTT to **NIP-66 reported latencies** (rtt-open, rtt-read, rtt-write).

## Links

- **Source code:** [GitHub – nostr-relay-speed](https://github.com/YOUR_USERNAME/nostr-relay-speed) (replace with your repo URL)
- **Deployed app:** Set in Vercel project (e.g. `https://nostr-relay-speed.vercel.app`)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/YOUR_USERNAME/nostr-relay-speed.git
   cd nostr-relay-speed
   npm install
   ```

2. Configure the bootstrap relay (required; no default in code). Copy the example env and set the relay URL:

   ```bash
   cp .env.example .env.local
   ```

   In `.env.local` set:

   ```
   NEXT_PUBLIC_BOOTSTRAP_RELAY=wss://relay.damus.io
   ```

   Use any relay that has NIP-66 kind 30166 events. For Vercel, set the same variable in **Project → Settings → Environment Variables**.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app will discover relays from the bootstrap relay and then measure each one; the leaderboard updates as results come in.

## Deploy to Vercel

1. Push the repo to GitHub (or connect your Git provider in Vercel).
2. In [Vercel](https://vercel.com), **Add New Project** and import this repository.
3. Add environment variable:
   - **Name:** `NEXT_PUBLIC_BOOTSTRAP_RELAY`
   - **Value:** your bootstrap relay URL (e.g. `wss://relay.damus.io`)
4. Deploy. The app is a standard Next.js app; no extra config is required.

## Tech

- **Next.js 14** (App Router)
- **nostr-tools** (relay connection, pool, NIP-66 event parsing)
- **Tailwind CSS** for styling

## License

MIT
