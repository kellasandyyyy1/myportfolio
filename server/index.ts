import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// dotenv's default target is '.env'. This project keeps its secrets in
// '.env.local' (Vite's convention, already gitignored), so load that first.
// dotenv never overrides an already-set var, which makes '.env' a fallback.
dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT ?? 8787);
const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? 'kellasandyyyy1';

/** Cache window — contributions change slowly, so this only needs to be fresh, not live. */
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionPayload {
  total: number;
  days: ContributionDay[];
}

let cache: { payload: ContributionPayload; fetchedAt: number } | null = null;
let inFlight: Promise<ContributionPayload> | null = null;

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

async function fetchContributions(): Promise<ContributionPayload> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-contribution-graph',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: GITHUB_USERNAME },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status}`);
  }

  const body = await res.json() as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions: number;
            weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
          };
        };
      };
    };
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error('Unexpected GitHub API response shape');

  // Flatten week columns into a chronological list of days.
  const flattened: ContributionDay[] = calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount }))
  );

  // GitHub's first week is partial unless the range happens to start on a Sunday.
  // Pad it so index % 7 is always the weekday, keeping the client's rows aligned.
  const firstDate = calendar.weeks[0]?.contributionDays[0]?.date;
  const padCount = firstDate ? new Date(`${firstDate}T00:00:00Z`).getUTCDay() : 0;
  const days: ContributionDay[] = [
    ...Array.from({ length: padCount }, (_, i) => ({ date: `pad-start-${i}`, count: 0 })),
    ...flattened,
  ];

  // Pad the trailing partial week as well. The client renders week-columns by
  // slicing from the END of this array, so its length must also be a multiple
  // of 7 — otherwise every column is offset and stops being a real week.
  while (days.length % 7 !== 0) {
    days.push({ date: `pad-end-${days.length}`, count: 0 });
  }

  return { total: calendar.totalContributions, days };
}

/**
 * Returns only the daily counts and the total — the token never leaves the server.
 * Serves stale cache on upstream failure so a rate limit can't blank the section.
 */
app.get('/api/github-contributions', async (_req, res) => {
  const isFresh = cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (isFresh) {
    res.set('Cache-Control', 'public, max-age=1800');
    res.json(cache!.payload);
    return;
  }

  try {
    // Collapse concurrent misses into one upstream request.
    inFlight ??= fetchContributions();
    const payload = await inFlight;
    cache = { payload, fetchedAt: Date.now() };
    res.set('Cache-Control', 'public, max-age=1800');
    res.json(payload);
  } catch (err) {
    if (cache) {
      // Stale data beats no data.
      res.set('Cache-Control', 'public, max-age=300');
      res.json(cache.payload);
      return;
    }
    console.error('[github-contributions]', err instanceof Error ? err.message : err);
    res.status(503).json({ error: 'unavailable' });
  } finally {
    inFlight = null;
  }
});

// Serve the built SPA when a build exists. In dev, Vite serves the app on :3000
// and proxies /api here, so this simply stays inactive until `npm run build` runs.
const dist = path.resolve(__dirname, '../dist');
if (existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
