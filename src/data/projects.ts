/**
 * Every project in "my works": the grid, the list view, the browse-all modal,
 * the résumé and each /work/:slug page all read from here. Order is display
 * order, and also the previous/next order on the detail pages.
 *
 * Optional fields render nothing when empty, so leave them out rather than
 * filling placeholders.
 */
export interface WorkProject {
  /** URL-safe; the page lives at /work/:slug. */
  slug: string;
  title: string;
  tags: string[];
  /** Thumbnail on the cards; hero image on the detail page. */
  cover: string;
  /** Deployed site. */
  liveUrl?: string;
  /** Code link. */
  repoUrl?: string;
  summary?: string;
  role?: string;
  year?: string;
  /** Extra screenshots for the detail page, beyond the cover. */
  gallery?: string[];
  /** Two-colour print palette for the dithered card thumbnail. */
  duotone?: Duotone;
  /** Dither pixel size at display, in CSS px (default 3). */
  ditherPixel?: number;
  /** Levels black / white points before dithering (defaults 40 / 215). */
  ditherBlack?: number;
  ditherWhite?: number;
  /** Swap ink and paper, for very dark screenshots. */
  invert?: boolean;
}

export interface Duotone {
  /** Dark pixels. */
  ink: string;
  /** Light pixels. */
  paper: string;
}

/** Charcoal on cream, for any project without its own pair. */
export const DEFAULT_DUOTONE: Duotone = { ink: '#1C1B18', paper: '#ECE8DF' };

// summary, liveUrl and gallery below are carried over from the project data the
// site already had. repoUrl, role and year never existed: add them when ready.
export const WORKS: WorkProject[] = [
  {
    slug: 'yappr',
    duotone: { ink: '#7A1F14', paper: '#8FC1DD' }, // oxblood / powder blue
    // Dark UI screenshot: levels fitted to its range, inverted to print as ink on paper.
    ditherBlack: 4,
    ditherWhite: 64,
    invert: true,
    title: 'Yappr',
    tags: ['React', 'Tailwind', 'node.js', 'Express, Supabase, Vite'],
    cover: '/img/p3.PNG',
    liveUrl: 'https://yapprr.kelas.site',
    // TODO: repoUrl, role, year
    summary: 'A small project called yappr a social website that lets you interact with other existing user and share moments and music with them.',
    gallery: ['/img/p1.PNG', '/img/p2.PNG', '/img/p4.PNG'],
  },
  {
    slug: 'burger-restaurant-website',
    duotone: { ink: '#B23A1E', paper: '#E8C35A' }, // tomato / mustard
    title: 'Burger restaurant website',
    tags: ['React', 'TypeScript', 'D3.js', 'Firebase'],
    cover: '/img/h4.PNG',
    liveUrl: 'https://www.holymeltburger.com/',
    // TODO: repoUrl, role, year
    summary: 'Experience artisan gourmet burgers with online ordering and live delivery tracking.',
    gallery: ['/img/h1.PNG', '/img/h2.PNG', '/img/h3.PNG'],
  },
  {
    slug: 'fitness-ecommerce-website',
    duotone: { ink: '#13283F', paper: '#C5DCA6' }, // navy / sage
    // Dark UI screenshot: levels fitted to its range, inverted to print as ink on paper.
    ditherBlack: 4,
    ditherWhite: 110,
    invert: true,
    title: 'fitness Ecommerce website',
    tags: ['React', 'TypeScript', 'tailwind', 'Express'],
    cover: '/img/q3.PNG',
    liveUrl: 'https://qumpofficial.com',
    // TODO: repoUrl, role, year
    summary: 'ecommerce website focused on selling active wear',
    gallery: ['/img/q1.PNG', '/img/q2.PNG', '/img/q5.PNG'],
  },
  {
    slug: 'mind-compass',
    duotone: { ink: '#3B1F3A', paper: '#C9B8E3' }, // plum / lavender
    // Dark UI screenshot: levels fitted to its range, inverted to print as ink on paper.
    ditherBlack: 0,
    ditherWhite: 80,
    invert: true,
    title: 'Mind compass',
    tags: ['React', 'TypeScript', 'tailwind', 'AI integration'],
    cover: '/img/m3.PNG',
    liveUrl: 'https://mindcompass.kelas.site',
    // TODO: repoUrl, role, year
    summary: 'simple search engine for psychology students that helps you understand human behavior.',
    gallery: ['/img/m1.PNG', '/img/m2.PNG', '/img/m4.PNG'],
  },
  {
    slug: 'media-kit-website',
    duotone: { ink: '#1F3B2A', paper: '#F1C7B8' }, // forest / blush
    title: 'Media Kit Website',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Framer'],
    cover: '/img/jnb.PNG',
    liveUrl: 'https://issahmediakit.netlify.app',
    // TODO: repoUrl, role, year
    summary: 'A premium, responsive media kit website designed to showcase brand metrics, creator statistics, and press assets with clean modern aesthetics.',
    gallery: ['/img/jbn.PNG'],
  },
  {
    slug: 'climex-dashboard',
    duotone: { ink: '#0E3B3F', paper: '#A9D9D4' }, // deep teal / pale aqua
    title: 'Climex dashboard',
    tags: ['Typescript', 'NextJS', 'Tailwind CSS', 'WebSocket'],
    cover: '/img/cl1.PNG',
    liveUrl: 'https://climexx.kelas.site',
    // TODO: repoUrl, role, year
    summary: 'Crypto, weather, currency, and air quality updated in real time, in one view.',
    gallery: ['/img/cl2.PNG'],
  },
  {
    slug: 'designarchive',
    duotone: { ink: '#1C1B18', paper: '#ECE8DF' }, // charcoal / cream
    // Dark UI screenshot: levels fitted to its range, inverted to print as ink on paper.
    ditherBlack: 10,
    ditherWhite: 140,
    invert: true,
    title: 'Designarchive',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    cover: '/img/arc1.png',
    liveUrl: 'https://designarchi.online',
    // TODO: repoUrl, role, year
    summary: 'A design reference web app for exploring graphic design movements, color palettes, typography systems, and layout styles built for designers who want a curated, searchable archive instead of scattered inspiration boards.',
    gallery: ['/img/arc2.png', '/img/arc3.png'],
  },
  {
    slug: 'dual-finance',
    duotone: { ink: '#1E2A6B', paper: '#F2E3A0' }, // indigo / butter
    // Dark UI screenshot: levels fitted to its range, inverted to print as ink on paper.
    ditherBlack: 10,
    ditherWhite: 70,
    invert: true,
    title: 'dual finance',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    cover: '/img/b1.png',
    liveUrl: 'https://dualfinance.site',
    // TODO: repoUrl, role, year
    summary: 'Business and personal finance, in one place.',
    gallery: ['/img/b2.png'],
  },
];

export const workPath = (p: WorkProject) => `/work/${p.slug}`;

export const findWork = (slug: string | undefined) => WORKS.find((p) => p.slug === slug);

/** The tags the cards show: the first two, as before. */
export const cardTags = (p: WorkProject) => (p.tags.length ? p.tags.slice(0, 2) : ['web']);
