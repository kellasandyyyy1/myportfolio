/**
 * Vercel Serverless Function serving the GitHub contribution calendar.
 *
 * Vercel maps `api/github-contributions.ts` to `/api/github-contributions`
 * automatically, which is the path the client already calls — so the frontend
 * needs no change, and local dev keeps working through the Vite proxy to the
 * Express server in server/index.ts.
 *
 * Types are declared inline rather than importing from `@vercel/node`, to avoid
 * adding a dependency for two interfaces.
 */

interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionPayload {
  total: number;
  days: ContributionDay[];
}

/**
 * Warm-container cache. Serverless instances are ephemeral, so this only helps
 * while a container stays warm and must not be relied on — the durable layer is
 * the CDN cache headers set in `send()` below.
 */
let cache: { payload: ContributionPayload; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

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

async function fetchContributions(token: string, login: string): Promise<ContributionPayload> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-contribution-graph',
    },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login } }),
  });

  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

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

  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join('; '));

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error('Unexpected GitHub API response shape');

  const flattened: ContributionDay[] = calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount }))
  );

  // GitHub's first week is partial unless the range starts on a Sunday. Pad the
  // front so index % 7 is the weekday, keeping the client's rows aligned.
  const firstDate = calendar.weeks[0]?.contributionDays[0]?.date;
  const padCount = firstDate ? new Date(`${firstDate}T00:00:00Z`).getUTCDay() : 0;
  const days: ContributionDay[] = [
    ...Array.from({ length: padCount }, (_, i) => ({ date: `pad-start-${i}`, count: 0 })),
    ...flattened,
  ];

  // Pad the trailing week too: the client renders week-columns by slicing from
  // the END of this array, so its length must also be a multiple of 7 or every
  // column is offset and stops being a real week.
  while (days.length % 7 !== 0) {
    days.push({ date: `pad-end-${days.length}`, count: 0 });
  }

  return { total: calendar.totalContributions, days };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_USERNAME ?? 'kellasandyyyy1';

  const send = (payload: unknown, status: number, maxAge: number) => {
    // s-maxage is what Vercel's edge honours; that cache persists across
    // invocations and is what actually keeps us clear of GitHub's rate limit.
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=86400`
    );
    res.status(status).json(payload);
  };

  if (!token) {
    // Misconfiguration rather than a transient fault. The client falls back to
    // its placeholder pattern silently.
    return send({ error: 'GITHUB_TOKEN is not configured' }, 500, 60);
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return send(cache.payload, 200, 1800);
  }

  try {
    const payload = await fetchContributions(token, login);
    cache = { payload, fetchedAt: Date.now() };
    return send(payload, 200, 1800);
  } catch (err) {
    // Stale data beats no data if this container still holds any.
    if (cache) return send(cache.payload, 200, 300);
    console.error('[github-contributions]', err instanceof Error ? err.message : err);
    return send({ error: 'unavailable' }, 503, 60);
  }
}
