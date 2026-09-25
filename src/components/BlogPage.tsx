import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from '@phosphor-icons/react';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  /** Each string is a paragraph. */
  body: string[];
}

const POSTS: BlogPost[] = [
  {
    slug: 'the-demo-always-works',
    title: 'the demo always works',
    date: 'September 2026',
    readTime: '2 min',
    tag: 'fullstack',
    body: [
      "Every project I've shipped has had a moment where the demo was flawless and the first real user broke it in under a minute.",
      "The gap is never the feature. It's the conditions. A demo runs on one machine, on fast wifi, with data you seeded yourself, clicked in the order you designed. Production runs on a four-year-old Android in a mall car park, against a row that has a null where you were certain there would be a string.",
      "So I build the ugly path first now. Empty state before the populated one. The 500 before the 200. A list with one item and a list with four hundred. If a layout only works with exactly three cards in it, it does not work.",
      "The other half is latency. Everything is instant on localhost and nothing is instant in production. Any interface that assumes a response arrives before the user's next action will feel broken the first time it doesn't. So every fetch gets a loading state, a failure state, and an honest answer to “what does someone see if this never comes back?”",
      "None of this is clever. It is just refusing to believe the happy path. The demo isn't a lie exactly. It's a claim about conditions that will never occur again.",
    ],
  },
  {
    slug: 'what-agents-actually-changed',
    title: 'what agents actually changed',
    date: 'September 2026',
    readTime: '2 min',
    tag: 'ai / workflow',
    body: [
      "I've been building with coding agents daily for about a year. The honest summary is that they did not make me faster at writing code. They made me faster at everything around it.",
      "Reading an unfamiliar codebase used to be an afternoon. Now it's a question. Wiring up a fourth integration that is structurally identical to the first three used to be an hour of careful tedium. Now it's a review.",
      "What didn't change is the part that was already hard. Deciding what to build. Noticing the requirement is wrong. Knowing a fix is papering over a design problem two layers down. An agent will implement a bad plan flawlessly and quickly, which is worse than implementing it slowly; you reach the wall with far more code to unwind.",
      "So the job shifted. Less typing, more specifying: being precise about what done means, which edge cases count, what must not be touched. The bottleneck moved from output to judgement, and judgement has no keyboard shortcut.",
      "The people getting the most out of this aren't the ones generating the most code. They're the ones who got good at describing problems.",
    ],
  },
  {
    slug: 'the-part-ai-still-cant-do',
    title: "the part ai still can't do",
    date: 'September 2026',
    readTime: '2 min',
    tag: 'ai',
    body: [
      "Ask a model to build you a dashboard and you'll get a dashboard. Ask it whether you need one, and it will still build you a dashboard.",
      'That gap is most of the job now.',
      "Much of what I actually get paid for isn't implementation. It's noticing that the client asking for a booking system has a scheduling problem their staff already solve by hand in ninety seconds, and that software would make it slower. It's cutting a feature list from twelve to four because eight of them exist to settle an internal argument nobody has had out loud.",
      'Models are strong in the middle of a problem and weak at both ends. The start, meaning what is worth building at all, needs context nobody wrote down. The end, meaning whether the thing is any good, needs taste. And taste is preference plus a hundred times you got it wrong.',
      "I'm not precious about this. I use these tools constantly and the work is better for it. But the leverage was never in generating more. It's in being the person who can tell whether what came out is right, and who is willing to throw it away when it isn't.",
      'That skill got more valuable, not less.',
    ],
  },
  {
    slug: 'design-was-never-the-artefact',
    title: 'design was never the artefact',
    date: 'September 2026',
    readTime: '2 min',
    tag: 'design / ai',
    body: [
      "A model can produce a clean landing page in twenty seconds. It can generate forty icon variants, six colour systems, and a component library that looks like it cost a team a month. If design is the artefact, design is finished.",
      'Design was never the artefact.',
      "The contradiction is that the visible part of the job is the automatable part. Designers get hired on portfolios full of surfaces, and surfaces are exactly what generation is good at. The part that actually holds a product together is invisible: deciding this screen does one thing instead of four, that the empty state matters more than the hero, that the real problem is a form being eleven fields long.",
      "What changes first is production. Mockup variants, marketing collateral, spec handoff, the hundredth version of a card component. That work compresses hard and it compresses soon, because it was always execution against a decision somebody else had already made.",
      "What holds is constraint work. Accessibility, information architecture, naming things so a team of nine stays consistent for two years. Those need context and consequences, and they get harder, not easier, the more you generate.",
      "So my guess is the middle hollows out. Pure execution gets absorbed, pure judgement gets more valuable, and the uncomfortable stretch is everyone currently sitting between the two.",
      "Cheap options did not make design easier. They made elimination the entire skill.",
    ],
  },
];

const BlogPage = ({
  theme,
  toggleTheme,
}: {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen font-sans text-[15px] ${isLight ? 'bg-[#fafafa] text-[#5a5a5a]' : 'bg-[#0b0b0d] text-[#a1a1aa]'
      }`}>
      {/* Standalone chrome: this route deliberately has no sidebar nav. */}
      <header className={`sticky top-0 z-50 border-b px-5 md:px-12 py-3.5 flex items-center justify-between gap-4 ${isLight ? 'bg-[#fafafa] border-[#ececec]' : 'bg-[#0b0b0d] border-[#1e1e1e]'
        }`}>
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-[12px] font-geist transition-colors ${isLight ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a85] hover:text-[#e5e5e5]'
            }`}
        >
          <ArrowLeft weight="light" size={14} className="shrink-0" />
          <span>back to portfolio</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`w-[32px] h-[32px] rounded-[8px] border-[0.5px] flex items-center justify-center shrink-0 transition-colors cursor-pointer ${isLight
            ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a]'
            : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4]'
            }`}
        >
          {theme === 'dark' ? <Sun weight="light" size={14} /> : <Moon weight="light" size={14} />}
        </button>
      </header>

      <main className="px-5 md:px-12 py-14 md:py-20 max-w-[720px] mx-auto">
        <h1 className={`text-[26px] sm:text-[32px] font-geist font-medium leading-none lowercase ${isLight ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
          }`}>
          notes
        </h1>
        <p className={`text-[14px] md:text-[15px] font-sans leading-[1.6] max-w-[480px] mt-3 ${isLight ? 'text-[#5a5a5a]' : 'text-[#888888]'
          }`}>
          short pieces on building things end to end, and on what actually changed once agents got good.
        </p>

        <div className="mt-12 md:mt-16 space-y-14 md:space-y-20">
          {POSTS.map((post, i) => (
            <article
              key={post.slug}
              className={i > 0 ? `pt-14 md:pt-20 border-t-[0.5px] ${isLight ? 'border-[#ececec]' : 'border-[#1e1e1e]'}` : ''}
            >
              <div className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-[1.5px] ${isLight ? 'text-[#a0a0a0]' : 'text-[#666666]'
                }`}>
                <span>{post.date}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readTime}</span>
                <span aria-hidden="true">·</span>
                <span>{post.tag}</span>
              </div>

              <h2 className={`text-[22px] md:text-[26px] font-geist font-medium leading-tight lowercase mt-2 ${isLight ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                }`}>
                {post.title}
              </h2>

              <div className="mt-5 space-y-4">
                {post.body.map((para, k) => (
                  <p
                    key={k}
                    className={`text-[14px] md:text-[15px] font-sans leading-[1.75] ${isLight ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                      }`}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className={`px-5 md:px-12 py-10 border-t max-w-[720px] mx-auto ${isLight ? 'border-[#ececec]' : 'border-[#1e1e1e]'
        }`}>
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-[12px] font-geist transition-colors ${isLight ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a85] hover:text-[#e5e5e5]'
            }`}
        >
          <ArrowLeft weight="light" size={14} className="shrink-0" />
          <span>back to portfolio</span>
        </Link>
      </footer>
    </div>
  );
};

export default BlogPage;
