# Blueprint — Interactive Event Projection

A full-screen projection web app for the **Blueprint** event. Features an animated blueprint grid background with floating particles, star graphics, and real-time audience interaction via QR code — attendees send messages and drawings that float across the projection.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` on the projection screen.

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run:

```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  created_at timestamptz default now()
);

create table drawings (
  id uuid default gen_random_uuid() primary key,
  image_data text not null,
  created_at timestamptz default now()
);

-- Enable Realtime for both tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table drawings;
```

3. Copy your project URL and anon key from **Settings → API**
4. Update `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Two Views

### Projection Display (`/`)

The main screen to display on a projector. Two phases:

- **Pre-event:** Event title, QR code (centered), logo branding, star graphics in corners, floating particles
- **During event:** Title moves to top-left, QR code shrinks to bottom-right, logos shift to bottom-left, audience messages and drawings float across

### Audience Interact Page (`/interact`)

Mobile-friendly page attendees access by scanning the QR code:

- **Message tab:** Type a message (up to 140 chars) that floats across the projection
- **Draw tab:** Finger-draw on a canvas, pick colors/sizes, and send it to the big screen

## Keyboard Controls (Projection)

| Key               | Action                                    |
| ----------------- | ----------------------------------------- |
| `Space` / `Enter` | Toggle between pre-event and during phase |
| `1`               | Jump to pre-event phase                   |
| `2`               | Jump to during-event phase                |
| `F`               | Toggle fullscreen                         |

## Customizing

Edit `src/lib/config.ts` to change event details, timing, and asset paths:

```ts
export const EVENT_CONFIG = {
  title: "Blueprint",
  venue: "VROOM",
  messageDurationMs: 10_000,
  drawingDurationMs: 15_000,
  assets: { ... },
  projection: { ... },
};
```

Drop PNG/SVG files into `public/assets/` and reference them in the config.

## Deploying

Deploy to [Vercel](https://vercel.com) (zero-config for Next.js):

```bash
npx vercel
```

Set the environment variables in Vercel's dashboard. The QR code automatically points to your deployed URL.

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** Realtime (Postgres changes)
- **Framer Motion** (animations)
- **Tailwind CSS** (styling)
- **react-qrcode-logo** (QR code)
