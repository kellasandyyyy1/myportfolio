/**
 * Netlify Function serving the GitHub contribution calendar.
 *
 * Mirrors the local Express route in server/index.ts. Both exist on purpose:
 * `npm run server` + the Vite proxy handle local dev, this runs in production.
 * Keep the payload shape identical in both so the client never has to care.
 *
 * Uses Netlify Functions 2.0 (web-standard Request/Response) so no extra
 * dependency is needed and it typechecks against the existing DOM lib.
 */

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionPayload {
  total: number;
  days: ContributionDay[];
}

/**
 * Warm-container cache. Netlify Functions are ephemeral, so this only survives
 * while a container stays warm and must NOT be relied on. The durable layer is
 * the CDN cache headers set below.
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

  // Pad the trailing week too: the client slices week-columns from the END of
  // this array, so its length must also be a multiple of 7 or columns shift.
  while (days.length % 7 !== 0) {
    days.push({ date: `pad-end-${days.length}`, count: 0 });
  }

  return { total: calendar.totalContributions, days };
}

export default async (_req: Request): Promise<Response> => {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_USERNAME ?? 'kellasandyyyy1';

  const json = (payload: unknown, status: number, maxAge: number) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: {
        'Content-Type': 'application/json',
        // Browser cache.
        'Cache-Control': `public, max-age=${maxAge}`,
        // Netlify's edge CDN. This is the caching that actually persists across
        // invocations and keeps us far clear of GitHub's rate limit.
        'Netlify-CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
      },
    });

  if (!token) {
    // Missing config, not a transient fault — the client falls back silently.
    return json({ error: 'GITHUB_TOKEN is not configured' }, 500, 60);
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return json(cache.payload, 200, 1800);
  }

  try {
    const payload = await fetchContributions(token, login);
    cache = { payload, fetchedAt: Date.now() };
    return json(payload, 200, 1800);
  } catch (err) {
    // Stale data beats no data if this container still holds any.
    if (cache) return json(cache.payload, 200, 300);
    console.error('[github-contributions]', err instanceof Error ? err.message : err);
    return json({ error: 'unavailable' }, 503, 60);
  }
};
