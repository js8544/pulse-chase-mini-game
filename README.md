# Pulse Chase (Vite + React Mini-Game)

A lightweight single-player reflex game built with Vite + React.

## Game Rules

- Click **Start Round** to begin a 30-second run.
- Hit the glowing moving target as many times as possible.
- Each successful hit gives points; higher streaks increase points per hit.
- Clicking the arena and missing the target costs 1 point.
- When time reaches zero, your round ends and you can restart.

## Agentation Integration

The page includes a visible `Agentation` feedback card.

- Webhook URL: `https://api.consen.app/webhooks/agentation`
- Feedback payload top-level metadata fields:
  - `project_id`
  - `task_id`
  - `chat_id`
  - `workspace_id`
  - `url`

The `onSubmit` handler sends structured JSON to the webhook and includes game context under `feedback`.

## Local Development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production Build

```bash
npm run build
npm run preview
```

The built static output is generated in `dist/`.

## Railway Deployment Notes

This repo includes `railway.json` configured for static Vite build + preview serving:

- Build command: `npm ci && npm run build`
- Start command: `npm run start` (binds to Railway `PORT`)

For GitHub + Railway:

1. Initialize git and commit this repository.
2. Push to a GitHub repo.
3. Create a Railway project from that GitHub repo.
4. Railway will use `railway.json` and deploy automatically.
