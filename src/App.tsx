import * as React from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { FaAws } from 'react-icons/fa6';
import { SiPearson, SiCisco, SiUpwork, SiFiverr } from 'react-icons/si';
import { playExternalLink, playNavTick, playTransition } from './lib/sound';
import { useSoundMuted } from './lib/useSoundMuted';
import { HarvestSnakeModal } from './components/HarvestSnake';
import { ServiceCardCanvas } from './components/ServiceCardCanvas';
import { InteractiveProfile } from './components/InteractiveProfile';
import { WalkingCat } from './components/WalkingCat';
import {
  GithubLogo,
  GithubLogo as Github,
  LinkedinLogo,
  LinkedinLogo as Linkedin,
  Envelope,
  Envelope as Mail,
  List,
  X,
  ArrowUpRight,
  ArrowUpRight as ExternalLink,
  ArrowRight,
  ArrowLeft,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  Sun,
  Moon,
  Eye,
  SquaresFour as LayoutGrid,
  Download,
  FileText,
  Printer,
  Calendar,
  Clock,
  CheckCircle,
  CheckCircle as CheckCircle2,
  Check,
  SpeakerHigh,
  SpeakerSlash,
  Video,
  User,
  Briefcase,
  Toolbox,
  Books,
  ChatText as MessageSquare,
  Sparkle as Sparkles,
  Plant as Sprout,
  GameController as Gamepad2,
  Stack as Layers,
  Cpu,
  Lightning as Zap,
  FigmaLogo,
} from '@phosphor-icons/react';

// --- Types ---
interface ProjectScreenshot {
  url: string;
  caption: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
  screenshots: ProjectScreenshot[];
}

interface Service {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  verifyUrl: string;
  icon: React.ReactNode;
}

// --- Data ---
const CERTIFICATIONS: Certification[] = [
  {
    id: 'aws-cloud-foundation',
    title: 'AWS Cloud Foundation',
    issuer: 'AWS',
    verifyUrl: 'https://www.credly.com/badges/3f85a03a-b171-48bb-9a37-776bae850bda',
    icon: <FaAws size={17} />,
  },
  {
    id: 'it-database-specialist',
    title: 'IT Database Specialist',
    issuer: 'Pearson',
    verifyUrl: 'https://www.credly.com/badges/d17211de-6231-4497-af5e-ca3d724d34f3',
    icon: <SiPearson size={16} />,
  },
  {
    id: 'data-analytics-scalability',
    title: 'Data Analytics & Scalability',
    issuer: 'Cisco',
    verifyUrl: 'https://www.credly.com/badges/ce9f9917-d96e-4bc0-ae66-1039a57a1982',
    icon: <SiCisco size={16} />,
  },
];
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Yappr",
    description: "A small project called yappr a social website that lets you interact with other existing user and share moments and music with them.",
    tags: ["React", "Tailwind", "node.js", "Express, Supabase, Vite"],
    image: "/img/p3.PNG",
    link: "yapprr.vercel.app",
    screenshots: [
      {
        url: "/img/p1.PNG",
        caption: ""
      },
      {
        url: "/img/p2.PNG",
        caption: ""
      },
      {
        url: "/img/p3.PNG",
        caption: ""
      },
      {
        url: "/img/p4.PNG",
        caption: ""
      },
    ]
  },
  {
    id: 2,
    title: "Finance Tracker web application",
    description: "lets you track all of your finances in one place with ai chatbot integration",
    tags: ["Next.js", "Node.js", "Railway", "Express"],
    image: "/img/t3.PNG",
    link: "financetracker-blond-six.vercel.app",
    screenshots: [
      {
        url: "/img/t1.PNG",
        caption: ""
      },
      {
        url: "/img/t2.PNG",
        caption: ""
      },
      {
        url: "/img/t4.PNG",
        caption: ""
      },
      {
        url: "/img/t3.PNG",
        caption: ""
      },
      {
        url: "/img/t5.PNG",
        caption: ""
      }
    ]
  },
  {
    id: 3,
    title: "Burger restaurant website",
    description: "Experience artisan gourmet burgers with online ordering and live delivery tracking.",
    tags: ["React", "TypeScript", "D3.js", "Firebase"],
    image: "/img/h4.PNG",
    link: "https://www.holymeltburger.com/",
    screenshots: [
      {
        url: "/img/h1.PNG",
        caption: ""
      },
      {
        url: "/img/h2.PNG",
        caption: ""
      },
      {
        url: "/img/h3.PNG",
        caption: ""
      },
      {
        url: "/img/h4.PNG",
        caption: ""
      },
    ]
  },
  {
    id: 4,
    title: "fitness Ecommerce website",
    description: "ecommerce website focused on selling active wear",
    tags: ["React", "TypeScript", "tailwind", "Express"],
    image: "/img/q3.PNG",
    link: "https://qumpofficial.com",
    screenshots: [

      {
        url: "/img/q1.PNG",
        caption: ""
      },
      {
        url: "/img/q2.PNG",
        caption: ""
      },
      {
        url: "/img/q3.PNG",
        caption: ""
      },
      {
        url: "/img/q5.PNG",
        caption: ""
      },
    ]
  },
  {
    id: 5,
    title: "Mind compass",
    description: "simple search engine for psychology students that helps you understand human behavior.",
    tags: ["React", "TypeScript", "tailwind", "AI integration"],
    image: "/img/m3.PNG",
    link: "https://mindcomp.vercel.app/",
    screenshots: [

      {
        url: "/img/m1.PNG",
        caption: ""
      },
      {
        url: "/img/m2.PNG",
        caption: ""
      },
      {
        url: "/img/m3.PNG",
        caption: ""
      },
      {
        url: "/img/m4.PNG",
        caption: ""
      },
    ]
  },
  {
    id: 6,
    title: "Media Kit Website",
    description: "A premium, responsive media kit website designed to showcase brand metrics, creator statistics, and press assets with clean modern aesthetics.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Framer"],
    image: "/img/jnb.PNG",
    link: "https://issahmediakit.netlify.app",
    screenshots: [
      {
        url: "/img/jbn.PNG",
        caption: ""
      },
      {
        url: "/img/jnb.PNG",
        caption: ""
      },
    ]
  },
  {
    id: 7,
    title: "Climex dashboard ",
    description: "Crypto, weather, currency, and air quality updated in real time, in one view.",
    tags: ["Typescript", "NextJS", "Tailwind CSS", "WebSocket"],
    image: "/img/cl1.PNG",
    link: "https://climexx.vercel.app",
    screenshots: [
      {
        url: "/img/cl1.PNG",
        caption: ""
      },
      {
        url: "/img/cl2.PNG",
        caption: ""
      },
    ]
  },
  {
    id: 8,
    title: "Designarchive",
    description: "A design reference web app for exploring graphic design movements, color palettes, typography systems, and layout styles built for designers who want a curated, searchable archive instead of scattered inspiration boards.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    image: "/img/arc1.png",
    link: "https://designarchive.vercel.app",
    screenshots: [
      {
        url: "/img/arc1.png",
        caption: ""
      },
      {
        url: "/img/arc2.png",
        caption: ""
      },
      {
        url: "/img/arc3.png",
        caption: ""
      },
    ]
  },
];

const SKILLS = [
  "React", "Tailwind CSS", "Next.js", "Vercel", "Railway", "HTML", "Node.js", "TypeScript", "D3.js", "Framer Motion", "UI Design", "Claude AI", "OpenAI Codex"
];

const ClaudeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D97757" className="shrink-0">
    <path d="M4.53 18.27a.64.64 0 0 0 .86.23l2.87-1.66 1.34 2.89a.64.64 0 0 0 1.16-.01l1.32-2.9 2.88 1.66a.64.64 0 0 0 .86-.23l1.66-2.87 2.89-1.34a.64.64 0 0 0 .01-1.16l-2.9-1.32 1.66-2.88a.64.64 0 0 0-.23-.86l-2.87-1.66-1.34-2.89a.64.64 0 0 0-1.16.01L14.33 6.3 11.45 4.64a.64.64 0 0 0-.86.23L8.93 7.74 6.04 9.08a.64.64 0 0 0-.01 1.16l2.9 1.32-1.66 2.88a.64.64 0 0 0 .23.86l2.87 1.66z" />
  </svg>
);

const CodexIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#10A37F]">
    <path d="M22.28 9.82a6 6 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 6.07 6.07 0 0 0-4.93-1.2A6 6 0 0 0 4.48 5.03a6.05 6.05 0 0 0-2.53 2.9 6 6 0 0 0 .52 4.91 6.05 6.05 0 0 0 .86 1.25 6.07 6.07 0 0 0-1.12 6.28 6 6 0 0 0 4.48 3.52 6.05 6.05 0 0 0 6.51 2.9 6.07 6.07 0 0 0 4.93 1.2 6 6 0 0 0 5.84-4.23 6.05 6.05 0 0 0 2.53-2.9 6 6 0 0 0-.52-4.91zm-10.28 11.88a4.5 4.5 0 0 1-2.25-.6l3.15-1.82a.75.75 0 0 0 .38-.65v-4.43l1.32.76a.75.75 0 0 0 1.12-.65v-3.64l2.25 1.3a4.5 4.5 0 0 1-5.97 9.07zm-7.65-4.42a4.5 4.5 0 0 1-.6-2.25l3.15 1.82a.75.75 0 0 0 .75 0l3.84-2.22v1.52a.75.75 0 0 0 .38.65l3.15 1.82a4.5 4.5 0 0 1-10.67-1.34zm-1.35-7.65a4.5 4.5 0 0 1 1.65-1.65l0 3.64a.75.75 0 0 0 .38.65l3.84 2.22-1.32.76a.75.75 0 0 0-.38.65v3.64a4.5 4.5 0 0 1-4.17-9.91zm14.17-2.88a4.5 4.5 0 0 1 .6 2.25l-3.15-1.82a.75.75 0 0 0-.75 0l-3.84 2.22v-1.52a.75.75 0 0 0-.38-.65l-3.15-1.82a4.5 4.5 0 0 1 10.67 1.34zm1.35 7.65a4.5 4.5 0 0 1-1.65 1.65l0-3.64a.75.75 0 0 0-.38-.65l-3.84-2.22 1.32-.76a.75.75 0 0 0 .38-.65v-3.64a4.5 4.5 0 0 1 4.17 9.91zM12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
);

const GeminiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
      fill="url(#gemini-spark-grad)"
    />
    <defs>
      <linearGradient id="gemini-spark-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1A73E8" />
        <stop offset="0.5" stopColor="#8AB4F8" />
        <stop offset="1" stopColor="#A142F4" />
      </linearGradient>
    </defs>
  </svg>
);

interface TechStackTool {
  name: string;
  iconClass?: string;
  customIcon?: React.ReactNode;
}

interface TechStackGroup {
  category: string;
  tools: TechStackTool[];
}

const TECH_STACK_DATA: TechStackGroup[] = [
  {
    category: "FRONTEND",
    tools: [
      { name: "React", iconClass: "devicon-react-original colored" },
      { name: "TypeScript", iconClass: "devicon-typescript-plain colored" },
      { name: "Next.js", iconClass: "devicon-nextjs-plain" },
      { name: "Tailwind CSS", iconClass: "devicon-tailwindcss-plain colored" },
      { name: "HTML5 & CSS3", iconClass: "devicon-html5-plain colored" },
      { name: "Framer Motion", iconClass: "devicon-framermotion-original" },
      { name: "D3.js", iconClass: "devicon-d3js-plain colored" },
    ],
  },
  {
    category: "BACKEND",
    tools: [
      { name: "Node.js", iconClass: "devicon-nodejs-plain colored" },
      { name: "REST APIs & WebSockets", iconClass: "devicon-fastapi-plain colored" },
      { name: "Firebase & Firestore", iconClass: "devicon-firebase-plain colored" },
    ],
  },
  {
    category: "DEVOPS & TOOLS",
    tools: [
      { name: "Vercel", iconClass: "devicon-vercel-original" },
      { name: "Railway", iconClass: "devicon-railway-original" },
      { name: "Git & GitHub", iconClass: "devicon-git-plain colored" },
    ],
  },
  {
    category: "AI & DESIGN",
    tools: [
      { name: "Gemini & LLM APIs", customIcon: <GeminiIcon /> },
      { name: "Claude AI", customIcon: <ClaudeIcon /> },
      { name: "OpenAI Codex", customIcon: <CodexIcon /> },
      { name: "Figma & UI Systems", iconClass: "devicon-figma-plain colored" },
    ],
  },
];

const SERVICES: Service[] = [
  {
    title: "Portfolio websites",
    description: "personal and professional sites that showcase your work with fast, polished builds"
  },
  {
    title: "Ecommerce websites",
    description: "online stores with checkout, product catalogs, and payment integrations"
  },
  {
    title: "SEO optimization",
    description: "technical SEO and performance tuning to help sites rank and load faster"
  },
  {
    title: "Web applications",
    description: "custom dashboards and tools built with React, Next.js, and modern APIs"
  },
  {
    title: "Landing pages",
    description: "high-converting single pages for launches, products, and campaigns"
  },
  {
    title: "Website maintenance",
    description: "ongoing updates, bug fixes, and performance monitoring after launch"
  }
];

interface Resource {
  name: string;
  url: string;
  description: string;
}

interface ResourceGroup {
  category: string;
  /** Short label used by the filter pill row. */
  filter: string;
  items: Resource[];
}

const RESOURCES: ResourceGroup[] = [
  {
    category: "LEARN AI / ML",
    filter: "AI/ML",
    items: [
      {
        name: "DeepLearning.AI",
        url: "https://www.deeplearning.ai/courses/",
        description: "structured courses on deep learning, from fundamentals to production"
      },
      {
        name: "fast.ai",
        url: "https://course.fast.ai/",
        description: "practical, code-first deep learning taught top down"
      },
      {
        name: "Hugging Face LLM Course",
        url: "https://huggingface.co/learn/llm-course",
        description: "transformers, tokenizers, and fine-tuning with real notebooks"
      },
      {
        name: "Google ML Crash Course",
        url: "https://developers.google.com/machine-learning/crash-course",
        description: "a fast introduction to core ml concepts and workflows"
      },
      {
        name: "Hugging Face Deep RL Course",
        url: "https://huggingface.co/learn/deep-rl-course",
        description: "reinforcement learning from q-learning through policy gradients"
      },
      {
        name: "Kaggle Learn",
        url: "https://www.kaggle.com/learn",
        description: "short hands-on modules you can finish in an afternoon"
      },
    ],
  },
  {
    category: "AI ENGINEERING & LLMS",
    filter: "Engineering",
    items: [
      {
        name: "Anthropic Prompt Engineering",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
        description: "the official guide to writing prompts that hold up in production"
      },
      {
        name: "Anthropic Cookbook",
        url: "https://github.com/anthropics/anthropic-cookbook",
        description: "runnable recipes for tool use, retrieval, and agent patterns"
      },
      {
        name: "OpenAI Cookbook",
        url: "https://cookbook.openai.com/",
        description: "practical examples for embeddings, function calling, and evals"
      },
      {
        name: "LangChain Docs",
        url: "https://python.langchain.com/docs/introduction/",
        description: "framework docs for chaining models, tools, and memory"
      },
      {
        name: "A Year of Building with LLMs",
        url: "https://applied-llms.org/",
        description: "hard-won lessons from teams shipping llm products for real"
      },
      {
        name: "Chip Huyen's Blog",
        url: "https://huyenchip.com/blog/",
        description: "deep essays on ml systems design and production infrastructure"
      },
    ],
  },
  {
    category: "DEVELOPER FUNDAMENTALS / CS",
    filter: "CS Fundamentals",
    items: [
      {
        name: "The Odin Project",
        url: "https://www.theodinproject.com/",
        description: "a full open-source path from html to full stack javascript"
      },
      {
        name: "freeCodeCamp",
        url: "https://www.freecodecamp.org/",
        description: "certification tracks built around writing code, not watching it"
      },
      {
        name: "Harvard CS50x",
        url: "https://cs50.harvard.edu/x/",
        description: "the computer science foundation everything else sits on"
      },
      {
        name: "MDN Web Docs",
        url: "https://developer.mozilla.org/",
        description: "the reference for html, css, and javascript worth trusting"
      },
    ],
  },
];

interface ExperienceEntry {
  id: string;
  initials: string;
  /** Official brand mark to render in the timeline tile instead of `initials`. */
  logo?: 'upwork' | 'fiverr';
  company: string;
  location: string;
  employmentType: string;
  role: string;
  period: string;
  description: string;
  skills: string[];
  moreSkillsCount?: number;
}

const EXPERIENCES: ExperienceEntry[] = [
  {
    id: 'freelance',
    initials: 'UP',
    logo: 'upwork',
    company: 'Upwork freelance',
    location: 'Houston, Texas',
    employmentType: 'Contract',
    role: 'Fullstack web developer',
    period: 'Jan 2026 — PRESENT ·  6 MOS',
    description: 'Developed SaaS and ecommerce website for clients with ai integrations , custom api and more.',
    skills: ['React', 'Express', 'TypeScript', 'Shopify'],
    moreSkillsCount: 4,
  },
  {
    id: 'tech-labs',
    initials: 'MVP',
    company: 'Mercantile ventures partner',
    location: 'Makati, Metro Manila',
    employmentType: 'Full-time',
    role: 'Frontend Developer',
    period: 'June 2025 — December 2025 · 6 MOS',
    description: 'Built scalable client-side web architectures, responsive design systems, and real-time dashboard analytics. Improved web performance scores by 35%.',
    skills: ['React', 'TypeScript', 'REST APIs', 'LLMs integration'],
    moreSkillsCount: 3,
  },
  {
    id: 'digital-corp',
    initials: 'FV',
    logo: 'fiverr',
    company: 'Fiverr Freelancing',
    location: 'London, United kingdom',
    employmentType: 'Full-time',
    role: 'Web Developer & UI Designer',
    period: 'October 2024 — may 2025 · 7 MOS',
    description: 'Crafted modern user interfaces, component libraries, and interactive media sites. Worked closely with design teams and backend engineers to deploy robust client sites.',
    skills: ['JavaScript', 'HTML/CSS', 'UI Design', 'Express', 'Figma'],
    moreSkillsCount: 2,
  },
];

// Official brand marks (Simple Icons paths) with their brand greens.
const EXPERIENCE_LOGOS = {
  upwork: { Icon: SiUpwork, color: '#14A800', label: 'Upwork', size: 24 },
  fiverr: { Icon: SiFiverr, color: '#1DBF73', label: 'Fiverr', size: 26 },
} as const;

const ExperienceLogo = ({ exp }: { exp: ExperienceEntry }) => {
  if (!exp.logo) return <>{exp.initials}</>;
  const { Icon, color, label, size } = EXPERIENCE_LOGOS[exp.logo];
  return <Icon size={size} color={color} title={label} aria-label={label} />;
};

// --- Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <div
      className={`custom-cursor hidden md:block ${isHovering ? 'hovering' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    />
  );
};

interface SidebarNavigationProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onBookCall?: () => void;
  onOpenResume?: () => void;
  onOpenGame?: () => void;
}

const SidebarNavigation = ({
  theme,
  toggleTheme,
  onBookCall,
  onOpenResume,
  onOpenGame,
}: SidebarNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [soundMuted, toggleSound] = useSoundMuted();

  const group1Links = [
    { id: 'about', name: 'About', href: '#about', icon: <User weight="light" size={16} /> },
    { id: 'experience', name: 'Experience', href: '#experience', icon: <Layers weight="light" size={16} /> },
    { id: 'stack', name: 'Stack', href: '#stack', icon: <Cpu weight="light" size={16} /> },
    { id: 'certifications', name: 'Certifications', href: '#certifications', icon: <CheckCircle weight="light" size={16} /> },
  ];

  const group2Links = [
    { id: 'work', name: 'Work', href: '#projects', icon: <Briefcase weight="light" size={16} /> },
    { id: 'services', name: 'Services', href: '#services', icon: <Toolbox weight="light" size={16} /> },
    { id: 'resources', name: 'Resources', href: '#resources', icon: <Books weight="light" size={16} /> },
    { id: 'contact', name: 'Contact', href: '#contact', icon: <Envelope weight="light" size={16} /> },
  ];

  const navLinks = [...group1Links, ...group2Links];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'stack', 'certifications', 'projects', 'services', 'resources', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId === 'projects' ? 'work' : sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Play a transition only on a genuine change. The ref seeds with the initial
  // section so nothing sounds on first paint.
  const previousSection = React.useRef(activeSection);
  useEffect(() => {
    if (previousSection.current === activeSection) return;
    previousSection.current = activeSection;
    playTransition();
  }, [activeSection]);

  const renderDesktopNavLink = (link: { id: string; name: string; href: string; icon: React.ReactNode }) => {
    const isActive = activeSection === link.id;
    return (
      <a
        key={link.id}
        href={link.href}
        onClick={playNavTick}
        className={`py-2 px-0 flex items-center gap-[9px] text-[12.5px] font-mono tracking-[0.5px] transition-colors duration-150 w-full group cursor-pointer ${isActive
          ? theme === 'light'
            ? 'text-[#1a1a1a]'
            : 'text-[#e0e0e0]'
          : theme === 'light'
            ? 'text-[#8a8a85] hover:text-[#1a1a1a]'
            : 'text-[#444444] hover:text-[#c9c9c4]'
          }`}
      >
        <span
          aria-hidden="true"
          className={`nav-arrow shrink-0 leading-none transition-colors duration-150 ${isActive
            ? theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e0e0e0]'
            : 'text-transparent'
            }`}
        >
          ›
        </span>
        <span className="shrink-0 transition-colors duration-150">
          {link.icon}
        </span>
        <span className="truncate">{link.name}</span>
      </a>
    );
  };

  return (
    <>
      {/* Desktop Fixed Left Sidebar (≥1024px) */}
      <aside className={`hidden lg:flex w-[210px] flex-shrink-0 h-screen sticky top-0 border-r flex-col p-4 z-40 select-none transition-colors overflow-y-auto ${theme === 'light' ? 'bg-[#fafafa] border-[#ececec]' : 'bg-[#0b0b0d] border-[#1e1e1e]'
        }`}>
        {/* Top: Identity Block */}
        <div className="pt-1 pb-2 px-1">
          <div className={`text-[15px] font-sans font-medium tracking-normal leading-tight truncate ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'
            }`}>
            Kellas Andrei
          </div>
        </div>

        {/* Vertical Nav Links (Grouped into Group 1 & Group 2 with divider) */}
        <nav className="flex flex-col w-full mt-6 mb-auto space-y-1">
          {/* Group 1: Profile Info */}
          <div className="flex flex-col gap-0">
            {group1Links.map(renderDesktopNavLink)}
          </div>

          {/* Thin Horizontal Divider */}
          <div className={`my-2.5 border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1c1c1c]'}`} />

          {/* Group 2: Engagement */}
          <div className="flex flex-col gap-0">
            <span className={`px-0 mt-6 pb-1 text-[10px] font-mono uppercase tracking-[1.5px] select-none ${theme === 'light' ? 'text-[#c4c4c0]' : 'text-[#2a2a2a]'
              }`}>
              ENGAGE
            </span>
            {group2Links.map(renderDesktopNavLink)}
          </div>
        </nav>

        {/* Bottom Area: Social Icons Row + Divider + Theme & Version */}
        <div className={`mt-auto space-y-3 pt-3 border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
          }`}>
          {/* Social Row: 32x32px buttons with 8px rounded corners & 0.5/1px border */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kellasandyyyy1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
              className={`w-[32px] h-[32px] rounded-[8px] border flex items-center justify-center transition-colors duration-150 cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a] hover:border-[#a0a0a0]'
                : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4] hover:border-[#3a3a3a]'
                }`}
              title="GitHub"
            >
              <GithubLogo weight="light" size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
              className={`w-[32px] h-[32px] rounded-[8px] border flex items-center justify-center transition-colors duration-150 cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a] hover:border-[#a0a0a0]'
                : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4] hover:border-[#3a3a3a]'
                }`}
              title="LinkedIn"
            >
              <LinkedinLogo weight="light" size={16} />
            </a>
            <a
              href="mailto:kellasandrei00@gmail.com"
              onClick={playExternalLink}
              className={`w-[32px] h-[32px] rounded-[8px] border flex items-center justify-center transition-colors duration-150 cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a] hover:border-[#a0a0a0]'
                : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4] hover:border-[#3a3a3a]'
                }`}
              title="Email"
            >
              <Envelope weight="light" size={16} />
            </a>
            <button
              type="button"
              onClick={() => {
                // Play the confirmation chirp only when unmuting, so muting is silent.
                const nowMuted = toggleSound();
                if (!nowMuted) playNavTick();
              }}
              aria-pressed={soundMuted}
              aria-label={soundMuted ? 'Unmute interface sounds' : 'Mute interface sounds'}
              className={`w-[32px] h-[32px] rounded-[8px] border flex items-center justify-center transition-colors duration-150 cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a] hover:border-[#a0a0a0]'
                : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4] hover:border-[#3a3a3a]'
                }`}
              title={soundMuted ? 'Sound off' : 'Sound on'}
            >
              {soundMuted
                ? <SpeakerSlash weight="light" size={16} />
                : <SpeakerHigh weight="light" size={16} />}
            </button>
          </div>

          {/* Divider & Theme Toggle */}
          <div className={`pt-2 border-t flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-[1px] ${theme === 'light' ? 'border-[#ececec] text-[#8a8a85]' : 'border-[#1c1c1c] text-[#777777]'
            }`}>
            <button
              onClick={toggleTheme}
              className={`transition-colors duration-150 flex items-center gap-1.5 cursor-pointer uppercase ${theme === 'light' ? 'hover:text-[#1a1a1a]' : 'hover:text-[#c9c9c4]'
                }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun weight="light" size={14} /> : <Moon weight="light" size={14} />}
              <span>{theme}</span>
            </button>
            <span></span>
          </div>
        </div>
      </aside>

      {/* Tablet Header (768px - 1023px) */}
      <header className={`hidden md:flex lg:hidden w-full border-b px-6 py-3.5 items-center justify-between sticky top-0 z-50 transition-colors ${theme === 'light' ? 'bg-[#fafafa] border-[#ececec]' : 'bg-[#0b0b0d] border-[#1e1e1e]'
        }`}>
        <div className="flex items-center gap-2.5">
          <span className={`text-[15px] font-sans font-medium ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
            }`}>Kellas Andrei</span>
        </div>

        <div className="flex items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={playNavTick}
              className={`text-xs font-mono uppercase tracking-[0.5px] transition-colors ${activeSection === link.id
                ? (theme === 'light' ? 'text-[#1a1a1a] font-medium' : 'text-white font-medium')
                : (theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a8a] hover:text-white')
                }`}
            >
              {link.name}
            </a>
          ))}

          <button
            onClick={() => {
              const nowMuted = toggleSound();
              if (!nowMuted) playNavTick();
            }}
            aria-pressed={soundMuted}
            aria-label={soundMuted ? 'Unmute interface sounds' : 'Mute interface sounds'}
            className={`p-1.5 transition-colors cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a8a] hover:text-white'
              }`}
          >
            {soundMuted
              ? <SpeakerSlash weight="light" size={16} />
              : <SpeakerHigh weight="light" size={16} />}
          </button>

          <button
            onClick={toggleTheme}
            className={`p-1.5 transition-colors cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a8a] hover:text-white'
              }`}
          >
            {theme === 'dark' ? <Sun weight="light" size={16} /> : <Moon weight="light" size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile Top Bar (<768px) */}
      <header className={`flex md:hidden w-full border-b px-4 py-3 items-center justify-between sticky top-0 z-50 transition-colors ${theme === 'light' ? 'bg-[#fafafa] border-[#ececec]' : 'bg-[#0b0b0d] border-[#1e1e1e]'
        }`}>
        <div className="flex items-center gap-2">
          <span className={`text-[15px] font-sans font-medium ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
            }`}>Kellas Andrei</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className={`p-2 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a8a] hover:text-white'
              }`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun weight="light" size={16} /> : <Moon weight="light" size={16} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer ${theme === 'light' ? 'text-[#1a1a1a] hover:text-black' : 'text-white hover:text-zinc-300'
              }`}
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X weight="light" size={18} /> : <List weight="light" size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay (<768px) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`fixed top-[49px] left-0 right-0 border-b p-5 z-50 flex flex-col gap-4 md:hidden ${theme === 'light' ? 'bg-[#fafafa] border-[#ececec]' : 'bg-[#0b0b0d] border-[#1e1e1e]'
                }`}
            >
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => { playNavTick(); setIsOpen(false); }}
                    className={`text-xs py-2 flex items-center gap-2.5 border-b ${theme === 'light'
                      ? 'text-[#5a5a5a] hover:text-[#1a1a1a] border-[#ececec]'
                      : 'text-[#a1a1aa] hover:text-white border-[#1e1e1e]/60'
                      }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {onBookCall && (
                  <button
                    onClick={() => { playExternalLink(); setIsOpen(false); onBookCall(); }}
                    className={`text-left text-xs py-2 flex items-center gap-1.5 cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#a1a1aa] hover:text-white'
                      }`}
                  >
                    <Calendar weight="light" size={15} />
                    <span>Book Call</span>
                  </button>
                )}

                {/* Stays open on toggle so the state change is visible */}
                <button
                  onClick={() => {
                    const nowMuted = toggleSound();
                    if (!nowMuted) playNavTick();
                  }}
                  aria-pressed={soundMuted}
                  className={`text-left text-xs py-2 flex items-center gap-1.5 cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#a1a1aa] hover:text-white'
                    }`}
                >
                  {soundMuted
                    ? <SpeakerSlash weight="light" size={15} />
                    : <SpeakerHigh weight="light" size={15} />}
                  <span>{soundMuted ? 'Sound Off' : 'Sound On'}</span>
                </button>
              </div>

              <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${theme === 'light' ? 'border-[#ececec] text-[#8a8a8a]' : 'border-[#1e1e1e] text-[#71717a]'
                }`}>
                <span>kellasandrei00@gmail.com</span>
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  available
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const SectionHeading = ({
  children,
  number,
  className = "mb-10",
  theme,
  isInView,
  baseDelay = 0
}: {
  children: React.ReactNode;
  number: string;
  className?: string;
  theme?: 'dark' | 'light';
  isInView?: boolean;
  baseDelay?: number;
}) => {
  const textVal = typeof children === 'string' ? children.toLowerCase() : children;
  const animClass = isInView !== undefined ? `scroll-animate-child ${isInView ? 'animated' : ''}` : '';
  return (
    <div className={className}>
      <span
        className={`text-[10px] font-mono tracking-[1.5px] uppercase block mb-1 ${animClass} ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
          }`}
        style={isInView !== undefined ? { animationDelay: `${baseDelay}ms` } : undefined}
      >
        {number} — 08
      </span>
      <h2
        className={`text-[26px] sm:text-[32px] font-mono font-medium leading-none tracking-normal lowercase ${animClass} ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
          }`}
        style={isInView !== undefined ? { animationDelay: `${baseDelay + 80}ms` } : undefined}
      >
        {textVal}
      </h2>
    </div>
  );
};

const RESOURCE_FILTERS = ['All', ...RESOURCES.map((g) => g.filter)];

/** Index of the group with the most items — it spans both columns in the unfiltered grid. */
const WIDEST_RESOURCE_INDEX = RESOURCES.reduce(
  (widest, group, index) => (group.items.length > RESOURCES[widest].items.length ? index : widest),
  0
);

const ResourceCard = ({
  group,
  theme,
  wide,
}: {
  group: ResourceGroup;
  theme: 'dark' | 'light';
  /** Renders 2 resources side by side on desktop; always stacked on mobile. */
  wide: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = group.items.slice(0, 2);
  const hiddenItems = group.items.slice(2);

  const isLight = theme === 'light';
  const dividerClass = isLight ? 'border-[#ececea]' : 'border-[#1c1c1a]';
  const itemsGridClass = wide
    ? 'grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-8 md:gap-y-6'
    : 'flex flex-col gap-4';

  const renderResource = (resource: Resource, index: number) => (
    <div
      key={resource.url}
      className={`flex flex-col gap-1.5 min-w-0 ${index > 0
        ? `pt-4 border-t ${dividerClass} ${wide ? 'md:pt-0 md:border-t-0' : ''}`
        : ''
        }`}
    >
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`transition-colors inline-flex items-center gap-2 text-[13.5px] md:text-[14px] font-sans font-medium tracking-tight w-fit max-w-full group cursor-pointer ${isLight ? 'text-[#1a1a1a] hover:text-black' : 'text-[#cccccc] hover:text-white'
          }`}
      >
        <span className="truncate min-w-0">{resource.name}</span>
        <ArrowUpRight
          weight="light"
          size={14}
          className={`shrink-0 transition-colors ${isLight ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
            }`}
        />
      </a>
      <p className={`text-[13px] font-sans leading-relaxed break-words ${isLight ? 'text-[#5a5a5a]' : 'text-[#888888]'
        }`}>
        {resource.description}
      </p>
    </div>
  );

  return (
    <div
      className={`group/card h-full flex flex-col rounded-[12px] border-[0.5px] bg-transparent p-4 md:p-5 transition-colors ${isLight
        ? 'border-[#e6e6e3] hover:border-[#c4c4c0]'
        : 'border-[#232320] hover:border-[#3d3d38]'
        }`}
    >
      <span className={`text-[10px] font-mono uppercase tracking-[1.5px] block mb-4 md:mb-5 select-none ${isLight ? 'text-[#a0a0a0]' : 'text-[#4a4a46]'
        }`}>
        {group.category}
      </span>

      <div className={itemsGridClass}>
        {visibleItems.map(renderResource)}
      </div>

      {hiddenItems.length > 0 && (
        <>
          <div
            className={`overflow-hidden [transition:max-height_0.3s_ease] ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'
              }`}
            aria-hidden={!isExpanded}
          >
            <div className={`${itemsGridClass} pt-4 md:pt-6`}>
              {hiddenItems.map((resource, index) => renderResource(resource, index + visibleItems.length))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev: boolean) => !prev)}
            aria-expanded={isExpanded}
            className={`mt-auto pt-4 self-start text-[10.5px] font-mono tracking-[0.06em] px-0 bg-transparent border-none cursor-pointer transition-colors ${isLight ? 'text-[#8a8a8a] hover:text-[#1a1a1a]' : 'text-[#777777] hover:text-[#e0e0e0]'
              }`}
          >
            {isExpanded ? '− show less' : `+ ${hiddenItems.length} more`}
          </button>
        </>
      )}
    </div>
  );
};

const ResourcesGrid = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const isLight = theme === 'light';

  const visibleGroups = RESOURCES.map((group, index) => ({ group, index })).filter(
    ({ group }) => activeFilter === 'All' || group.filter === activeFilter
  );

  return (
    <>
      {/* Filter pills — wrap to multiple rows, never scroll horizontally */}
      <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
        {RESOURCE_FILTERS.map((filter) => {
          const isActive = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={isActive}
              className={`rounded-full border-[0.5px] px-3 py-1.5 text-[11px] font-mono lowercase tracking-[0.06em] cursor-pointer transition-colors ${isActive
                ? isLight
                  ? 'border-[#1a1a1a] bg-[#1a1a1a] text-[#fafafa]'
                  : 'border-[#e5e5e5] bg-[#e5e5e5] text-[#0a0a0a]'
                : isLight
                  ? 'border-[#e6e6e3] bg-transparent text-[#8a8a8a] hover:border-[#c4c4c0] hover:text-[#1a1a1a]'
                  : 'border-[#232320] bg-transparent text-[#777777] hover:border-[#3d3d38] hover:text-[#e0e0e0]'
                }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-5 items-start">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleGroups.map(({ group, index }) => {
            // A lone card always fills the row; otherwise only the largest category does.
            const wide = visibleGroups.length === 1 || index === WIDEST_RESOURCE_INDEX;
            return (
              <motion.div
                key={group.category}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`min-w-0 ${wide ? 'md:col-span-2' : ''}`}
              >
                <ResourceCard group={group} theme={theme} wide={wide} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

const AllProjectsModal = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  theme
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  theme: 'dark' | 'light';
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`w-full max-h-[85vh] max-w-4xl flex flex-col rounded-[8px] md:rounded-3xl overflow-hidden border-[0.5px] md:border shadow-2xl ${theme === 'light'
            ? 'bg-white border-[#e0e0e0] md:border-zinc-200 text-black'
            : 'bg-[#0d0d0d] md:bg-[#0a0a0c] border-[#1e1e1e] md:border-zinc-800/80 text-white'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile: numbered list rows (below md) */}
          <div className="md:hidden flex flex-col min-h-0">
            {/* Header row */}
            <div className={`px-4 py-[10px] flex items-center justify-between gap-3 shrink-0 border-b-[0.5px] ${theme === 'light' ? 'border-[#ececec]' : 'border-[#181818]'
              }`}>
              <span className={`text-[13px] font-mono font-normal ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#bbbbbb]'
                }`}>
                all projects
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className={`text-[11px] font-mono leading-none bg-transparent border-none cursor-pointer transition-colors ${theme === 'light' ? 'text-[#a0a0a0] hover:text-[#5a5a5a]' : 'text-[#333333] hover:text-[#888888]'
                  }`}
              >
                ✕
              </button>
            </div>

            {/* Subtext */}
            <div className={`px-4 pt-1 pb-2 text-[9px] font-mono shrink-0 ${theme === 'light' ? 'text-[#c4c4c0]' : 'text-[#2a2a2a]'
              }`}>
              {String(projects.length).padStart(2, '0')} projects
            </div>

            {/* List rows */}
            <div className="px-4 overflow-y-auto flex-1 min-h-0">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project);
                    onClose();
                  }}
                  className={`flex items-center justify-between gap-3 py-[10px] cursor-pointer group border-b-[0.5px] ${index === 0 ? 'border-t-[0.5px]' : ''
                    } ${theme === 'light' ? 'border-[#ececec]' : 'border-[#181818]'}`}
                >
                  <span className="flex items-center gap-[10px] min-w-0">
                    <span className={`w-[18px] shrink-0 text-[9px] font-mono ${theme === 'light' ? 'text-[#c4c4c0]' : 'text-[#222222]'
                      }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-[12px] font-mono truncate transition-colors ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#777777] group-hover:text-[#bbbbbb]'
                      }`}>
                      {project.title}
                    </span>
                  </span>

                  <span className="shrink-0 flex items-center gap-2">
                    <span className={`inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] ${theme === 'light'
                      ? 'border-[#ececec] text-[#a0a0a0]'
                      : 'border-[#1a1a1a] text-[#2a2a2a]'
                      }`}>
                      {project.tags?.[0]?.toLowerCase() || 'web'}
                    </span>
                    <ArrowUpRight
                      weight="light"
                      size={10}
                      className={`shrink-0 transition-colors ${theme === 'light' ? 'text-[#c4c4c0] group-hover:text-[#5a5a5a]' : 'text-[#252525] group-hover:text-[#666666]'
                        }`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className={`p-5 md:p-6 hidden md:flex items-center justify-between border-b gap-3 shrink-0 ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800/80 bg-zinc-900/40'
            }`}>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-brand-text/10 text-brand-text block mb-1">
                Portfolio
              </span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                All Projects
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2.5 rounded-full border transition-all shrink-0 ${theme === 'light'
                ? 'border-zinc-300 hover:bg-zinc-200 text-zinc-700'
                : 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid Area */}
          <div className="p-6 hidden md:block overflow-y-auto flex-1 bg-black/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project);
                    onClose();
                  }}
                  className="cursor-pointer group flex flex-col"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/5 group-hover:border-white/25 transition-all duration-300 relative">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-1 min-w-0">
                    <h4 className="text-[12px] md:text-[13px] font-medium text-zinc-300 group-hover:text-white transition-colors truncate tracking-tight leading-snug">
                      {project.title}
                    </h4>
                    <span className="inline-flex self-start text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-zinc-400 leading-none">
                      {project.tags?.[0] || 'Web'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProjectModal = ({
  project,
  onClose,
  theme
}: {
  project: Project | null;
  onClose: () => void;
  theme: 'dark' | 'light';
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [project]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (project) {
      lastActiveElementRef.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (!project || !project.screenshots) return;
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % project.screenshots.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + project.screenshots.length) % project.screenshots.length);
      }
    };

    if (project) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
      if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
        lastActiveElementRef.current.focus();
      }
    };
  }, [project, onClose]);

  if (!project) return null;

  const screenshots = project.screenshots || [];
  const currentScreenshot = screenshots[activeIndex] || { url: project.image, caption: project.title };

  const formatUrl = (url?: string) => {
    if (!url || url === '#') return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden select-none">
        {/* Dimmed Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={panelTransition}
          className="absolute inset-0 bg-black/55 backdrop-blur-[2px] cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer / Bottom Sheet Panel */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={isMobile ? { y: '100%' } : { x: '100%' }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: '100%' } : { x: '100%' }}
          transition={panelTransition}
          className={`fixed z-[101] flex flex-col p-6 shadow-2xl transition-colors ${isMobile
            ? 'inset-x-0 bottom-0 top-auto w-full max-h-[85vh] rounded-t-xl rounded-b-none border-t border-[#262626]'
            : 'top-0 bottom-0 right-0 h-full rounded-none border-l border-[#262626] w-[clamp(320px,60vw,400px)] lg:w-[340px]'
            } ${theme === 'light'
              ? 'bg-[#ffffff] border-[#e0e0e0] text-[#1a1a1a]'
              : 'bg-[#111113] border-[#262626] text-white'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle Bar */}
          {isMobile && (
            <div className="w-full flex justify-center pb-2 shrink-0">
              <div className="w-9 h-1 rounded-full bg-[#333333] dark:bg-[#333333] light:bg-[#d0d0d0]" />
            </div>
          )}

          {/* 1. Header Row */}
          <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
            <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] tracking-wider uppercase font-medium ${theme === 'light'
              ? 'bg-[#f0f0f0] text-[#5a5a5a] border border-[#e0e0e0]'
              : 'bg-[#1e1e1e] text-[#ccc] border border-[#2a2a2a]'
              }`}>
              PREVIEW
            </span>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={`w-[26px] h-[26px] rounded-full border flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#5a5a5a] hover:text-[#1a1a1a] hover:border-[#1a1a1a]'
                : 'border-[#2a2a2a] text-[#8a8a8a] hover:text-white hover:border-[#404040]'
                }`}
              aria-label="Close preview"
            >
              <X size={14} />
            </button>
          </div>

          {/* 2. Project Title */}
          <h3 className={`text-[19px] font-sans font-medium leading-tight mb-4 shrink-0 truncate ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
            }`}>
            {project.title}
          </h3>

          {/* Middle Scrollable Content (Image, Description, Tags) */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 min-h-0 custom-scrollbar">
            {/* 3. Image/Screenshot Area */}
            <div className={`relative w-full rounded-lg overflow-hidden border flex items-center justify-center bg-black/40 shrink-0 ${isMobile ? 'h-[120px]' : 'h-[150px]'
              } ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#2a2a2a]'}`}>
              {currentScreenshot.url ? (
                <img
                  src={currentScreenshot.url}
                  alt={currentScreenshot.caption || project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full ${theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-900'
                  }`} />
              )}

              {/* Counter Badge ("1 / 4") */}
              {screenshots.length > 0 && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-white font-mono text-[9px] tracking-wider uppercase font-medium select-none pointer-events-none">
                  {activeIndex + 1} / {screenshots.length}
                </div>
              )}

              {/* Screenshot Controls if multiple */}
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
                    }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/10 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev + 1) % screenshots.length);
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/10 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight size={12} />
                  </button>
                </>
              )}
            </div>

            {/* 4. Description */}
            <p className={`text-[12px] font-sans leading-[1.6] ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
              }`}>
              {project.description || "An intuitive web application showcasing clean modular architecture, interactive interfaces, and modern design standards."}
            </p>
          </div>

          {/* 6. Action Row Pinned to Bottom */}
          <div className="mt-auto pt-4 shrink-0 flex items-center gap-2.5 w-full">
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-lg border text-[12px] font-mono uppercase tracking-[0.5px] font-medium transition-all text-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] bg-transparent text-[#5a5a5a] hover:text-[#1a1a1a] hover:border-[#1a1a1a]'
                : 'border-[#2a2a2a] bg-transparent text-[#cccccc] hover:text-white hover:border-[#404040]'
                }`}
            >
              back
            </button>

            {project.link && project.link !== '#' ? (
              <a
                href={formatUrl(project.link)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-2.5 rounded-lg text-[12px] font-mono uppercase tracking-[0.5px] font-medium transition-all text-center flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer ${theme === 'light'
                  ? 'bg-[#1a1a1a] text-white hover:bg-black'
                  : 'bg-[#ffffff] text-black hover:bg-zinc-200'
                  }`}
              >
                <span>launch</span>
                <ArrowUpRight size={14} />
              </a>
            ) : (
              <button
                disabled
                className="flex-1 py-2.5 rounded-lg text-[12px] font-mono uppercase tracking-[0.5px] font-medium bg-[#222225] text-[#666666] border border-[#2a2a2a] cursor-not-allowed text-center"
              >
                soon
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ResumeModal = ({
  isOpen,
  onClose,
  theme
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-10 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl flex flex-col sm:rounded-3xl overflow-hidden border-0 sm:border shadow-2xl no-print-hide ${theme === 'light'
            ? 'bg-white sm:border-zinc-200 text-black'
            : 'bg-[#0a0a0c] sm:border-zinc-800 text-white'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-3 sm:p-5 md:p-6 flex items-center justify-between border-b shrink-0 print-hide ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800/80 bg-zinc-900/40'
            }`}>
            <div className="flex items-center gap-3">
              <FileText size={20} className="opacity-60" />
              <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase">Resume</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${theme === 'light'
                  ? 'border-zinc-300 hover:bg-zinc-100 text-zinc-700'
                  : 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  }`}
                title="Print or save as PDF"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-full border transition-all shrink-0 print-hide ${theme === 'light'
                  ? 'border-zinc-300 hover:bg-zinc-200 text-zinc-700'
                  : 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Resume Content — printable area */}
          <div id="resume-content" className="p-4 sm:p-8 md:p-10 overflow-y-auto flex-1 min-h-0">
            <div className="max-w-2xl mx-auto space-y-8 resume-printable">
              {/* Name & Title */}
              <div className="text-center border-b pb-6" style={{ borderColor: theme === 'light' ? '#e4e4e7' : '#27272a' }}>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-2">Kellas Andrei</h1>
                <p className="text-sm uppercase tracking-[0.3em] font-bold opacity-60 mb-3">Frontend Developer</p>
                <div className="flex flex-wrap justify-center gap-4 text-xs opacity-70">
                  <span className="flex items-center gap-1"><Mail size={12} /> kellasandrei00@gmail.com</span>
                  <span className="flex items-center gap-1"><Github size={12} /> github.com/kellasandyyyy1</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">Professional Summary</h2>
                <p className="text-sm leading-relaxed opacity-80">
                  Passionate frontend developer with a focus on creating high-performance, visually captivating web applications.
                  Experienced in React, Next.js, TypeScript, and modern UI frameworks. Driven by clean code, pixel-perfect design,
                  and building interfaces that prioritize user experience.
                </p>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">Technical Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-lg border ${theme === 'light' ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900/50'
                        }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">Selected Projects</h2>
                <div className="space-y-4">
                  {PROJECTS.map((project) => (
                    <div key={project.id} className={`p-4 rounded-xl border ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-900/30'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-sm uppercase tracking-tight mb-1">{project.title}</h3>
                          <p className="text-xs opacity-70 leading-relaxed">{project.description}</p>
                        </div>
                        {project.link && project.link !== '#' && (
                          <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noopener noreferrer" className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-mono opacity-50">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">Services</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SERVICES.map((service) => (
                    <div key={service.title} className={`p-4 rounded-xl border ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-900/30'}`}>
                      <h3 className="font-bold text-xs uppercase tracking-tight mb-1">{service.title}</h3>
                      <p className="text-[11px] opacity-60 leading-relaxed">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education / Info */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">Education</h2>
                <div className={`p-4 rounded-xl border ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800 bg-zinc-900/30'}`}>
                  <h3 className="font-bold text-sm uppercase tracking-tight">Information Technology</h3>
                  <p className="text-xs opacity-60 mt-1">Specialization in Web Development & UI/UX Design</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BookCallModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; theme?: 'dark' | 'light' }) => {
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowString());
  const [selectedTime, setSelectedTime] = useState<string>('02:00 PM');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [topic, setTopic] = useState<string>('frontend & web app discussion');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);

  const times = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '8:00 PM'];

  if (!isOpen) return null;

  const handleBookWithGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    const title = encodeURIComponent(`1-on-1 Call: ${name || 'Guest'} & Kellas Andrei`);
    const details = encodeURIComponent(`Meeting Date: ${selectedDate} at ${selectedTime}\nMeeting Topic: ${topic}\nContact Email: ${email || 'Not provided'}\n\nBooked via Kellas Andrei Portfolio.`);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gcalUrl, '_blank');
    setIsScheduled(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[420px] bg-[#0a0a0a] border border-[#2a2a2a] rounded-[2px] overflow-hidden shadow-none font-sans text-white select-none"
        >
          {/* Header Row */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#2a2a2a]">
            <div className="text-[11px] font-sans font-medium uppercase tracking-[1.5px] text-white">
              &nbsp;BOOK A CALL WITH ME
            </div>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-white transition-colors cursor-pointer p-1 -mr-1"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5">
            {!isScheduled ? (
              <form onSubmit={handleBookWithGoogle} className="space-y-4">
                {/* Date Field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans uppercase tracking-[1.5px] text-[#888888]">
                    SELECT DATE
                  </label>
                  <input
                    required
                    type="date"
                    min={getTodayString()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#0a0a0a] text-white border border-[#2a2a2a] rounded-[2px] px-3 py-2 text-[13px] font-sans outline-none focus:border-white transition-colors cursor-pointer [color-scheme:dark]"
                  />
                </div>

                {/* Time Slot Row */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans uppercase tracking-[1.5px] text-[#888888]">
                    TIME SLOT (EST)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {times.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-1.5 text-[12px] font-sans tracking-[0.5px] rounded-[2px] transition-colors border cursor-pointer ${isSelected
                            ? 'bg-white text-black border-white font-medium'
                            : 'bg-[#0a0a0a] text-[#888888] border-[#2a2a2a] hover:text-white hover:border-[#404040]'
                            }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Email Fields (Two-Column Layout, Underline Style) */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans uppercase tracking-[1.5px] text-[#888888]">
                      NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="alex rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-white border-b border-[#2a2a2a] border-t-0 border-l-0 border-r-0 rounded-none px-0 py-1.5 text-[13px] font-sans outline-none focus:border-white placeholder-[#555555] transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-sans uppercase tracking-[1.5px] text-[#888888]">
                      EMAIL
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-white border-b border-[#2a2a2a] border-t-0 border-l-0 border-r-0 rounded-none px-0 py-1.5 text-[13px] font-sans outline-none focus:border-white placeholder-[#555555] transition-colors"
                    />
                  </div>
                </div>

                {/* Topic Field */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-sans uppercase tracking-[1.5px] text-[#888888]">
                    TOPIC
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-transparent text-white border-b border-[#2a2a2a] border-t-0 border-l-0 border-r-0 rounded-none px-0 py-1.5 text-[13px] font-sans outline-none focus:border-white placeholder-[#555555] transition-colors"
                  />
                </div>

                {/* Confirm Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-[#e5e5e5] rounded-[2px] py-2.5 px-4 font-sans text-[13px] font-medium lowercase tracking-[0.05em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>confirm booking</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-4 text-center space-y-4 font-sans">
                <div className="w-10 h-10 rounded-[2px] border border-[#2a2a2a] bg-[#0a0a0a] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 size={18} />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-sans uppercase tracking-[1.5px] text-[#888888]">
                    INVITE READY
                  </div>
                  <h4 className="text-[14px] font-sans font-medium text-white">
                    call scheduled
                  </h4>
                  <p className="text-[12px] text-[#888888] leading-relaxed max-w-xs mx-auto">
                    Google Calendar invite created for <span className="text-white">{selectedDate}</span> at <span className="text-white">{selectedTime}</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsScheduled(false);
                      onClose();
                    }}
                    className="w-full bg-white text-black hover:bg-[#e5e5e5] rounded-[2px] py-2 px-4 font-sans text-[12px] font-medium lowercase tracking-[0.05em] transition-colors cursor-pointer"
                  >
                    close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const TypewriterIntro = ({ theme }: { theme: 'dark' | 'light' }) => {
  const fullText = "A developer passionate about building modern, responsive, and high-performance websites and web applications. I focus on creating scalable, user-friendly digital experiences with clean design, smooth functionality, and strong attention to performance.";
  const [charIndex, setCharIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return;
    if (charIndex >= fullText.length) {
      setIsCompleted(true);
      return;
    }
    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, 14);
    return () => clearTimeout(timer);
  }, [charIndex, isCompleted]);

  const displayedText = isCompleted ? fullText : fullText.slice(0, charIndex);

  const handleBoxClick = () => {
    if (!isCompleted) {
      setIsCompleted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      onClick={handleBoxClick}
      className={`border backdrop-blur-md rounded-xl p-3 sm:p-4 relative overflow-hidden group transition-all shadow-xl cursor-pointer ${theme === 'light'
        ? 'bg-white/90 border-zinc-200 hover:border-zinc-300 shadow-zinc-200/50'
        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700/80 shadow-black/40'
        }`}
    >
      {/* Typing Effect Content */}
      <div className={`font-mono text-[11px] sm:text-xs md:text-[13px] leading-relaxed min-h-[85px] sm:min-h-[75px] ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'
        }`}>
        <span className="text-cyan-400 font-bold select-none mr-1.5">&gt;</span>
        <span>{displayedText}</span>
        <span className="inline-block w-1.5 sm:w-2 h-3.5 sm:h-4 bg-cyan-400 ml-1 align-middle animate-pulse shadow-[0_0_8px_#00f0ff]" />
      </div>
    </motion.div>
  );
};

interface ProcessNode {
  hash: string;
  name: string;
  desc: string;
  color: string;
  /** Present-tense status shown on the mascot label while this node is active. */
  verb: string;
}

const PROCESS_NODES: ProcessNode[] = [
  { hash: "9f2c1ab", name: "understand", desc: "read the problem first", color: "#c084fc", verb: "understanding" },
  { hash: "4d7e05f", name: "plan", desc: "sketch the approach", color: "#2dd4bf", verb: "planning" },
  { hash: "b18a3c6", name: "build", desc: "write the code", color: "#60a5fa", verb: "building" },
  { hash: "6c0f92d", name: "test", desc: "check it actually works", color: "#fbbf24", verb: "testing" },
  { hash: "e35b7a4", name: "refine", desc: "clean it up", color: "#f472b6", verb: "refining" },
  { hash: "a07d4e1", name: "done", desc: "five steps, no shortcuts", color: "#22c55e", verb: "done" },
];

/**
 * Accent the mascot adopts per step. The final step uses the brighter green that
 * matches the checkmark, rather than the node ring's own #22c55e.
 */
const mascotAccent = (index: number) =>
  index === PROCESS_NODES.length - 1 ? '#4ade80' : PROCESS_NODES[index].color;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals once when the element scrolls into view, then disconnects its observer.
 * Each node owns an instance, so scroll position — not a fixed JS delay — paces the cascade.
 */
function useRevealOnce() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setReduced(true);
      setRevealed(true);
      return;
    }

    // Mobile viewports are shorter, so they get a smaller pre-trigger buffer.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: isMobile ? '0px 0px -5% 0px' : '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed, reduced };
}

/**
 * Pixel-art "curious boy" mascot drawn on canvas over a 16x24 design grid.
 *
 * The rAF loop drives bob, head-tilt and blink only; the active step is read
 * from a ref each frame so a step change recolors on the next frame rather than
 * tearing down and restarting the loop.
 */
const SPRITE_COLS = 16;
const SPRITE_ROWS = 24;

const CuriousBoyMascot: React.FC<{
  activeIndex: number;
  /** Rendered CSS width; height follows the 16:24 grid ratio. */
  width: number;
}> = ({ activeIndex, width }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const activeRef = React.useRef(activeIndex);
  const [failed, setFailed] = useState(false);
  activeRef.current = activeIndex;

  const height = Math.round((width * SPRITE_ROWS) / SPRITE_COLS);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = 0;
    let rafId = 0;
    const reduced = prefersReducedMotion();

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2d context unavailable');

      const dpr = window.devicePixelRatio || 1;
      const unit = (width * dpr) / SPRITE_COLS;
      canvas.width = Math.round(unit * SPRITE_COLS);
      canvas.height = Math.round(unit * SPRITE_ROWS);

      const SKIN = '#e0a878';
      const HAIR = '#2a2119';
      const HAIR_MID = '#4a3f33';
      const SHIRT = '#7db6f0';
      const SHIRT_DARK = '#5a8fc4';
      const PANTS = '#3a3a37';
      const SHOES = '#1a1a18';

      const draw = () => {
        const accent = mascotAccent(activeRef.current);

        // Three motions on independent timers so nothing feels mechanically synced.
        const bob = reduced ? 0 : Math.sin(frame * 0.05) * 0.25;
        // Slower than the bob — a thoughtful look-around, not a twitch.
        const tilt = reduced ? 0 : Math.round(Math.sin(frame * 0.02));
        const blinking = !reduced && frame % 88 < 6;
        const markAlpha = reduced
          ? 0.6
          : 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(frame * ((Math.PI * 2) / 210)));

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /** Fills a rect given in grid units, snapped to whole device pixels. */
        const px = (x: number, y: number, w: number, h: number, color: string) => {
          ctx.fillStyle = color;
          ctx.fillRect(
            Math.round(x * unit),
            Math.round((y + bob) * unit),
            Math.round(w * unit),
            Math.round(h * unit)
          );
        };

        // 1. Hair — rounded top block (two overlapping rects chamfer the corners)
        //    plus thin side strands framing the face.
        px(4.5, 2, 7, 3, HAIR);
        px(4, 2.5, 8, 2.5, HAIR);
        px(4, 5, 1, 3, HAIR);
        px(11, 5, 1, 3, HAIR);

        // 2. Face — skin block, with a hairline strip on top and 1px sideburns.
        px(4.5, 4.5, 7, 6.5, SKIN);
        px(4.5, 4.5, 7, 0.75, HAIR);
        px(4.5, 5, 0.75, 4, HAIR);
        px(10.75, 5, 0.75, 4, HAIR);

        // 3/4. Eyes — dots that drift with the head tilt, or closed lines on blink.
        const eyeY = 7.4;
        const leftEyeX = 6.25 + tilt * 0.25;
        const rightEyeX = 8.75 + tilt * 0.25;
        if (blinking) {
          px(leftEyeX - 0.15, eyeY + 0.25, 1.1, 0.4, HAIR_MID);
          px(rightEyeX - 0.15, eyeY + 0.25, 1.1, 0.4, HAIR_MID);
        } else {
          px(leftEyeX, eyeY, 0.8, 0.8, HAIR);
          px(rightEyeX, eyeY, 0.8, 0.8, HAIR);
        }

        // 5. Nose/mouth hint — deliberately just a mark, not a full mouth.
        px(7.5, 9.3, 1, 0.5, accent);

        // 6. Neck gap — dark strip between face and collar.
        px(5.75, 11, 4.5, 0.6, HAIR);

        // 7. Torso — shirt block, darker collar strip, chest patch.
        px(3.5, 11.6, 9, 6.4, SHIRT);
        px(3.5, 11.6, 9, 0.75, SHIRT_DARK);
        px(6.5, 14, 3, 2.5, SHIRT_DARK);

        // 8. Arms — thin, slightly shorter than the torso.
        px(2.5, 12.4, 1, 5, SKIN);
        px(12.5, 12.4, 1, 5, SKIN);

        // 9. Legs
        px(5, 18, 2.5, 4, PANTS);
        px(8.5, 18, 2.5, 4, PANTS);

        // 10. Shoes — slightly wider than the legs.
        px(4.5, 21.5, 3.5, 2, SHOES);
        px(8, 21.5, 3.5, 2, SHOES);

        // Thought mark — a "?" from blocks, upper-right of the head. Only this
        // group fades, on its own slow timer.
        ctx.globalAlpha = markAlpha;
        px(12.9, 1.6, 2.1, 0.7, accent);
        px(14.3, 2.2, 0.7, 1.4, accent);
        px(13.6, 3.5, 0.7, 1.1, accent);
        px(13.6, 5.2, 0.7, 0.7, accent);
        ctx.globalAlpha = 1;
      };

      if (reduced) {
        // Single static frame — neutral head, eyes open, mark at fixed alpha.
        draw();
        return;
      }

      const loop = () => {
        frame += 1;
        draw();
        rafId = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      // Hide the panel entirely; the git log stays fully functional.
      setFailed(true);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
    // activeIndex is deliberately absent — it is read via activeRef so the loop
    // is never torn down and restarted on a step change.
  }, [width]);

  if (failed) return null;

  const node = PROCESS_NODES[activeIndex];
  const accent = mascotAccent(activeIndex);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Mascot: currently ${node.verb}`}
        style={{ width, height, imageRendering: 'pixelated' }}
      />
      <span
        className="mt-2 text-[11px] font-mono tracking-[0.06em] lowercase"
        style={{ color: accent }}
      >
        {node.verb}
      </span>
    </div>
  );
};

const GitLogNode: React.FC<{
  node: ProcessNode;
  index: number;
  isLast: boolean;
  isActive: boolean;
  onActivate: (index: number) => void;
  theme: 'dark' | 'light';
}> = ({ node, index, isLast, isActive, onActivate, theme }) => {
  const { ref, revealed, reduced } = useRevealOnce();
  const isLight = theme === 'light';

  // Second, persistent observer: tracks which node is most centered so the
  // mascot can mirror scroll position. Unlike the entrance observer, this one
  // is never disconnected while the section is mounted.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onActivate(index);
      },
      // Narrowing the root to a band across the viewport middle is what makes
      // "most centered" meaningful — several small nodes clear 0.55 at once
      // against the full viewport.
      { threshold: 0.55, rootMargin: '-35% 0px -35% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onActivate, ref]);

  const railColor = isLight ? '#dcdcd8' : '#2a2a26';
  const restingBorder = isLight ? '#e6e6e3' : '#232320';

  // line (0ms) -> circle (150ms) -> text (650ms, i.e. 200ms after the circle settles)
  const lineTransition = reduced ? 'none' : 'transform 400ms ease-out';
  const circleTransition = reduced
    ? 'none'
    // The transform leg has no delay — the active-ring scale is a live scroll
    // response, not part of the staggered entrance.
    : 'border-color 300ms ease-out 150ms, background-color 300ms ease-out 150ms, transform 200ms ease-out';
  const textTransition = reduced
    ? 'none'
    : 'opacity 350ms ease-out 650ms, transform 350ms ease-out 650ms';

  return (
    <div ref={ref} className={`relative flex ${isLast ? '' : 'pb-[1.125rem] md:pb-[1.375rem]'}`}>
      {/* Branch rail: line draws downward through the node */}
      <div className="relative shrink-0 flex justify-center" style={{ width: 'var(--rail)' }}>
        <span
          aria-hidden="true"
          className={`absolute top-0 w-px origin-top ${isLast ? '' : 'bottom-0'}`}
          style={{
            height: isLast ? 'var(--seg)' : undefined,
            backgroundColor: railColor,
            transform: revealed ? 'scaleY(1)' : 'scaleY(0)',
            transition: lineTransition,
          }}
        />

        {/* Node circle */}
        <span
          className="absolute rounded-full box-border flex items-center justify-center"
          style={{
            top: 'var(--seg)',
            width: 'var(--dot)',
            height: 'var(--dot)',
            transform: `translateY(-50%) scale(${isActive ? 1.15 : 1})`,
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderColor: revealed ? node.color : restingBorder,
            backgroundColor: isLast && revealed ? node.color : 'transparent',
            transition: circleTransition,
          }}
        >
          {isLast && (
            <>
              {/* Soft looping ring — the only continuous animation in the section */}
              {revealed && (
                <span
                  aria-hidden="true"
                  className="git-node-pulse absolute inset-0 rounded-full"
                  style={{ border: `1.5px solid ${node.color}` }}
                />
              )}
              <Check
                weight="bold"
                size={9}
                style={{
                  color: isLight ? '#ffffff' : '#0b0b0d',
                  opacity: revealed ? 1 : 0,
                  transition: reduced ? 'none' : 'opacity 300ms ease-out 150ms',
                }}
              />
            </>
          )}
        </span>
      </div>

      {/* Commit content */}
      <div
        className="min-w-0 flex-1"
        style={{
          paddingTop: 'var(--seg)',
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(8px)',
          transition: textTransition,
        }}
      >
        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ lineHeight: 'var(--dot)' }}
        >
          <span className={`text-[11px] md:text-[11.5px] font-mono ${isLight ? 'text-[#a0a0a0]' : 'text-[#555555]'
            }`}>
            {node.hash}
          </span>
          <span className={`text-[14px] md:text-[15px] font-sans font-semibold tracking-tight ${isLight ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
            }`}>
            {node.name}
          </span>
          {isLast && (
            <span
              className="text-[10px] md:text-[10.5px] font-mono tracking-[0.04em] whitespace-nowrap"
              style={{ color: node.color }}
            >
              HEAD → main
            </span>
          )}
        </div>
        <p className={`text-[12px] md:text-[13px] font-sans leading-relaxed mt-1 max-w-[460px] break-words ${isLight ? 'text-[#5a5a5a]' : 'text-[#888888]'
          }`}>
          {node.desc}
        </p>
      </div>
    </div>
  );
};

const HowIThinkSection = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mascotWidth, setMascotWidth] = useState(85);

  // Distinct canvas sizes per breakpoint rather than CSS-scaling one canvas,
  // so the pixel grid stays crisp at both sizes. 85->128 and 64->96 both keep
  // the 16:24 grid ratio.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const apply = () => setMascotWidth(query.matches ? 85 : 64);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // Stable identity so the per-node tracking observers aren't rebuilt each render.
  const handleActivate = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    // Left-anchored and capped, so leftover page width can't open a dead zone
    // between the log and the mascot. The 64px gap is measured from the log's
    // real content edge now that the log column hugs its content.
    <div className="flex flex-col md:flex-row md:gap-16 md:items-start md:max-w-[700px]">
      {/* Mascot: above the log on mobile (static, centered), sticky beside it on desktop */}
      <div className="mb-7 md:mb-0 md:order-2 md:flex-none md:max-w-[140px] md:self-stretch flex flex-col items-center">
        {/* 50vh + a half-height shift centres the sprite on the same viewport band
            the tracking observer uses, so it settles beside the active node
            instead of pinning near the top. Sticky stays bounded by this
            column, which stretches to the log's height. */}
        <div className="md:sticky md:top-[50vh] md:-translate-y-1/2 flex flex-col items-center">
          <CuriousBoyMascot activeIndex={activeIndex} width={mascotWidth} />
        </div>
      </div>

      {/* Git log — structure unchanged */}
      <div
        className="w-full min-w-0 md:order-1 md:flex-initial select-none [--seg:1rem] [--dot:0.875rem] [--rail:1.25rem] md:[--seg:1.375rem] md:[--dot:1.0625rem] md:[--rail:1.75rem]"
      >
        {PROCESS_NODES.map((node, idx) => (
          <GitLogNode
            key={node.hash}
            node={node}
            index={idx}
            isLast={idx === PROCESS_NODES.length - 1}
            isActive={idx === activeIndex}
            onActivate={handleActivate}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

// --- 01 / My Approach pipeline ---

interface ApproachStage {
  id: string;
  label: string;
  sub: string;
  color: string;
  detailLabel: string;
  detailDesc: string;
}

const APPROACH_STAGES: ApproachStage[] = [
  {
    id: 'ui',
    label: 'UI / interaction',
    sub: 'design systems',
    color: '#f472b6',
    detailLabel: 'ui and interaction design',
    detailDesc: 'design systems, micro-interactions, intuitive interfaces',
  },
  {
    id: 'api',
    label: 'API / backend',
    sub: 'node, rest, db',
    color: '#2dd4bf',
    detailLabel: 'api and backend design',
    detailDesc: 'rest apis, node.js microservices, cloud db integrations',
  },
  {
    id: 'frontend',
    label: 'Frontend',
    sub: 'react, state',
    color: '#60a5fa',
    detailLabel: 'frontend architecture',
    detailDesc: 'scalable react apps, state management, responsive performance',
  },
];

interface PipelineGeometry {
  viewBox: string;
  boxes: { x: number; y: number; w: number; h: number }[];
  arrows: { x1: number; y1: number; x2: number; y2: number; head: string }[];
  labelSize: number;
  subSize: number;
}

/** Horizontal flow, arrows point right. */
const PIPELINE_DESKTOP: PipelineGeometry = {
  viewBox: '0 0 720 72',
  boxes: [
    { x: 1, y: 4, w: 198, h: 64 },
    { x: 261, y: 4, w: 198, h: 64 },
    { x: 521, y: 4, w: 198, h: 64 },
  ],
  arrows: [
    { x1: 209, y1: 36, x2: 249, y2: 36, head: 'M245,32 L251,36 L245,40' },
    { x1: 469, y1: 36, x2: 509, y2: 36, head: 'M505,32 L511,36 L505,40' },
  ],
  labelSize: 12.5,
  subSize: 9.5,
};

/** Distinct vertical layout for narrow screens — arrows point down. */
const PIPELINE_MOBILE: PipelineGeometry = {
  viewBox: '0 0 320 276',
  boxes: [
    { x: 1, y: 4, w: 318, h: 64 },
    { x: 1, y: 106, w: 318, h: 64 },
    { x: 1, y: 208, w: 318, h: 64 },
  ],
  arrows: [
    { x1: 160, y1: 78, x2: 160, y2: 94, head: 'M156,90 L160,96 L164,90' },
    { x1: 160, y1: 180, x2: 160, y2: 196, head: 'M156,192 L160,198 L164,192' },
  ],
  labelSize: 13,
  subSize: 10,
};

// Entrance choreography, in ms. Boxes cascade, each arrow starts as its
// preceding box lands, caption follows box 3, then the detail rows.
const BOX_DUR = 300;
const BOX_STAGGER = 120;
const ARROW_DUR = 250;
const CAPTION_DUR = 200;
const ROW_DUR = 250;
const ROW_STAGGER = 80;

const boxDelay = (i: number) => i * BOX_STAGGER;
const arrowDelay = (i: number) => boxDelay(i) + BOX_DUR;
const captionDelay = boxDelay(APPROACH_STAGES.length - 1) + BOX_DUR;
const DIAGRAM_END = Math.max(
  arrowDelay(APPROACH_STAGES.length - 2) + ARROW_DUR,
  captionDelay + CAPTION_DUR
);
const rowDelay = (i: number) => DIAGRAM_END + i * ROW_STAGGER;

const ApproachPipelineSvg: React.FC<{
  geometry: PipelineGeometry;
  revealed: boolean;
  reduced: boolean;
  theme: 'dark' | 'light';
  className?: string;
}> = ({ geometry, revealed, reduced, theme, className }) => {
  const isLight = theme === 'light';
  const labelColor = isLight ? '#1a1a1a' : '#e5e5e5';
  const subColor = isLight ? '#8a8a8a' : '#777777';
  const arrowColor = isLight ? '#b4b4b0' : '#3d3d38';

  return (
    <svg
      viewBox={geometry.viewBox}
      className={className}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Pipeline: UI and interaction, then API and backend, then frontend"
    >
      {geometry.arrows.map((arrow, i) => {
        const length = Math.hypot(arrow.x2 - arrow.x1, arrow.y2 - arrow.y1);
        return (
          <g key={`arrow-${i}`}>
            <line
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              stroke={arrowColor}
              strokeWidth={1}
              strokeDasharray={length}
              style={{
                strokeDashoffset: revealed ? 0 : length,
                transition: reduced
                  ? 'none'
                  : `stroke-dashoffset ${ARROW_DUR}ms ease-out ${arrowDelay(i)}ms`,
              }}
            />
            {/* Arrowhead is its own path, not a marker, so it can fade in with the line
                instead of sitting there fully drawn while the stroke is still hidden. */}
            <path
              d={arrow.head}
              fill="none"
              stroke={arrowColor}
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: revealed ? 1 : 0,
                transition: reduced
                  ? 'none'
                  : `opacity 120ms ease-out ${arrowDelay(i) + ARROW_DUR - 100}ms`,
              }}
            />
          </g>
        );
      })}

      {geometry.boxes.map((box, i) => {
        const stage = APPROACH_STAGES[i];
        const cx = box.x + box.w / 2;
        const cy = box.y + box.h / 2;
        return (
          <g
            key={stage.id}
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'scale(1)' : 'scale(0.96)',
              // Explicit user-space origin — SVG's default transform-box is view-box,
              // so `center` would pivot on the whole diagram, not this box.
              transformOrigin: `${cx}px ${cy}px`,
              transition: reduced
                ? 'none'
                : `opacity ${BOX_DUR}ms ease-out ${boxDelay(i)}ms, transform ${BOX_DUR}ms ease-out ${boxDelay(i)}ms`,
            }}
          >
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx={8}
              fill="none"
              stroke={stage.color}
              strokeWidth={1}
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill={labelColor}
              className="font-mono"
              style={{ fontSize: geometry.labelSize }}
            >
              {stage.label}
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              fill={subColor}
              className="font-mono"
              style={{ fontSize: geometry.subSize }}
            >
              {stage.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const ApproachSection: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const { ref, revealed, reduced } = useRevealOnce();
  const isLight = theme === 'light';

  return (
    <div ref={ref}>
      <div className="max-w-[720px]">
        <ApproachPipelineSvg
          geometry={PIPELINE_MOBILE}
          revealed={revealed}
          reduced={reduced}
          theme={theme}
          className="block md:hidden"
        />
        <ApproachPipelineSvg
          geometry={PIPELINE_DESKTOP}
          revealed={revealed}
          reduced={reduced}
          theme={theme}
          className="hidden md:block"
        />

        <p
          className={`text-[10px] md:text-[10.5px] font-mono tracking-[0.04em] mt-3 ${isLight ? 'text-[#a0a0a0]' : 'text-[#666666]'
            }`}
          style={{
            opacity: revealed ? 1 : 0,
            transition: reduced ? 'none' : `opacity ${CAPTION_DUR}ms ease-out ${captionDelay}ms`,
          }}
        >
          design → build → ship, in that order
        </p>
      </div>

      {/* Detail list — single column at every size */}
      <div className="mt-8 md:mt-10 space-y-3.5 md:space-y-4">
        {APPROACH_STAGES.map((stage, i) => (
          <div
            key={stage.id}
            className="flex items-start gap-3"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(6px)',
              transition: reduced
                ? 'none'
                : `opacity ${ROW_DUR}ms ease-out ${rowDelay(i)}ms, transform ${ROW_DUR}ms ease-out ${rowDelay(i)}ms`,
            }}
          >
            <span
              aria-hidden="true"
              className="shrink-0 w-[7px] h-[7px] rounded-full mt-[6px] md:mt-[7px]"
              style={{ backgroundColor: stage.color }}
            />
            <div className="min-w-0">
              <h4 className={`text-[14px] md:text-[15px] font-sans font-semibold tracking-tight ${isLight ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                }`}>
                {stage.detailLabel}
              </h4>
              <p className={`text-[12px] md:text-[13px] font-sans leading-relaxed mt-0.5 max-w-[480px] break-words ${isLight ? 'text-[#5a5a5a]' : 'text-[#888888]'
                }`}>
                {stage.detailDesc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- GitHub contribution dot matrix ---

const GITHUB_PROFILE_URL = 'https://github.com/kellasandyyyy1';
const MATRIX_ROWS = 7; // one row per weekday, matching GitHub's week-column layout

interface ContributionDay {
  date: string;
  count: number;
}

/** Size + brightness step per bucket. Flat fills only — no gradients or glow. */
const CONTRIBUTION_BUCKETS = [
  { min: 0, r: 1, dark: '#1a1a18', light: '#e8e8e5' },
  { min: 1, r: 1.4, dark: '#2a2a27', light: '#d2d2ce' },
  { min: 3, r: 2, dark: '#3a3a37', light: '#b0b0ab' },
  { min: 6, r: 2.6, dark: '#6b6b68', light: '#6b6b68' },
  { min: 10, r: 3.4, dark: '#f2f2ef', light: '#1a1a18' },
];

const bucketFor = (count: number) => {
  for (let i = CONTRIBUTION_BUCKETS.length - 1; i > 0; i--) {
    if (count >= CONTRIBUTION_BUCKETS[i].min) return CONTRIBUTION_BUCKETS[i];
  }
  return CONTRIBUTION_BUCKETS[0];
};

/**
 * Deterministic quiet pattern shown when the API is unavailable. Uses only the
 * three dimmest buckets so it reads as texture rather than as fake data.
 */
const placeholderDays = (count: number): ContributionDay[] =>
  Array.from({ length: count }, (_, i) => {
    const h = (i * 2654435761) % 101;
    return { date: `placeholder-${i}`, count: h < 55 ? 0 : h < 88 ? 1 : 3 };
  });

const GithubSection: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const isLight = theme === 'light';
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [spacing, setSpacing] = useState(10);
  const [columns, setColumns] = useState(53);
  const [data, setData] = useState<{ total: number; days: ContributionDay[] } | null>(null);
  const [failed, setFailed] = useState(false);

  // Fit as many week-columns as the measured container allows, rather than
  // hardcoding counts per breakpoint.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (!width) return;
      // 8px is the floor: the brightest bucket is 6.8px across, so tighter
      // spacing makes adjacent peak days visually collide.
      const gap = width < 768 ? 8 : 10;
      setSpacing(gap);
      setColumns(Math.max(12, Math.min(53, Math.floor(width / gap))));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/github-contributions')
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((payload: { total: number; days: ContributionDay[] }) => {
        if (!active) return;
        if (!Array.isArray(payload?.days)) throw new Error('bad shape');
        setData(payload);
      })
      .catch(() => {
        // Fail silently — a portfolio page should never surface an API error.
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalCells = columns * MATRIX_ROWS;
  const sourceDays = data?.days ?? (failed ? placeholderDays(totalCells) : null);
  // Keep the most recent weeks when the container can't fit the full year.
  const days = sourceDays ? sourceDays.slice(-totalCells) : null;

  const width = columns * spacing;
  const height = MATRIX_ROWS * spacing;

  return (
    <div>
      {/* Header row — stays on one line at every width */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[11px] md:text-[12px] font-mono tracking-[0.04em] whitespace-nowrap ${isLight ? 'text-[#8a8a8a]' : 'text-[#666666]'
            }`}>
            github
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span
              aria-hidden="true"
              className="w-[5px] h-[5px] rounded-full"
              style={{ backgroundColor: '#22c55e' }}
            />
            <span className="text-[9px] md:text-[10px] font-mono tracking-[0.06em] text-[#22c55e]">
              live
            </span>
          </span>
        </div>

        <a
          href={GITHUB_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={playExternalLink}
          className={`inline-flex items-center gap-1 text-[11px] md:text-[12px] font-mono transition-colors min-w-0 ${isLight ? 'text-[#8a8a8a] hover:text-[#1a1a1a]' : 'text-[#666666] hover:text-[#e0e0e0]'
            }`}
        >
          <span className="truncate">github.com/kellasandyyyy1</span>
          <ArrowUpRight weight="light" size={11} className="shrink-0" />
        </a>
      </div>

      {/* Dot matrix — no border or fill, sits directly on the page background */}
      <div ref={containerRef} className="w-full">
        {days && (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto' }}
            role="img"
            aria-label={
              data
                ? `${data.total.toLocaleString()} GitHub contributions in the last year`
                : 'GitHub contribution activity'
            }
          >
            {days.map((day, i) => {
              const bucket = bucketFor(day.count);
              const col = Math.floor(i / MATRIX_ROWS);
              const row = i % MATRIX_ROWS;
              return (
                <circle
                  key={`${day.date}-${i}`}
                  cx={col * spacing + spacing / 2}
                  cy={row * spacing + spacing / 2}
                  r={bucket.r}
                  fill={isLight ? bucket.light : bucket.dark}
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* Caption is omitted entirely on failure rather than showing a fabricated number */}
      {data && (
        <p className={`text-[10px] md:text-[11px] font-mono tracking-[0.04em] mt-4 ${isLight ? 'text-[#a0a0a0]' : 'text-[#666666]'
          }`}>
          {data.total.toLocaleString()} contributions in the last year
        </p>
      )}
    </div>
  );
};

const heroButtonContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 1.4,
    }
  }
};

const heroButtonVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

function useSectionInView() {
  const ref = React.useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return [ref, isInView] as const;
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showResume, setShowResume] = useState(false);
  const [showBookCall, setShowBookCall] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [aboutRef, aboutInView] = useSectionInView();
  const [expRef, expInView] = useSectionInView();
  const [stackRef, stackInView] = useSectionInView();
  const [certRef, certInView] = useSectionInView();

  const getAnimClass = (inView: boolean) => `scroll-animate-child ${inView ? 'animated' : ''}`;

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.setAttribute('data-mode', 'light');
      document.body.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
      root.setAttribute('data-mode', 'dark');
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen font-sans text-[15px] selection:bg-zinc-800 selection:text-white lg:flex relative transition-colors duration-300 ${theme === 'light'
      ? 'bg-[#fafafa] text-[#5a5a5a] selection:bg-zinc-200 selection:text-black'
      : 'bg-[#0b0b0d] text-[#a1a1aa] selection:bg-zinc-800 selection:text-white'
      }`}>
      {/* Creative Halftone Dot Overlay for editorial design aesthetic */}
      <div className="halftone-overlay" aria-hidden="true" />
      <CustomCursor />
      <SidebarNavigation
        theme={theme}
        toggleTheme={toggleTheme}
        onBookCall={() => setShowBookCall(true)}
        onOpenResume={() => setShowResume(true)}
        onOpenGame={() => setShowGame(true)}
      />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} theme={theme} />
      <AllProjectsModal isOpen={showAllProjects} onClose={() => setShowAllProjects(false)} projects={PROJECTS} onSelectProject={setSelectedProject} theme={theme} />
      <ResumeModal isOpen={showResume} onClose={() => setShowResume(false)} theme={theme} />
      <BookCallModal isOpen={showBookCall} onClose={() => setShowBookCall(false)} theme={theme} />
      <HarvestSnakeModal isOpen={showGame} onClose={() => setShowGame(false)} theme={theme} />

      {/* Progress Bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
        style={{ scaleX }}
      />

      <div className="flex-1 min-w-0">
        <main>
          {/* --- Hero Section --- */}
          <section className="min-h-[calc(100vh-60px)] md:min-h-0 lg:min-h-0 flex flex-col justify-center md:justify-start p-6 md:p-12 max-w-7xl mx-auto py-12 md:py-20 md:pt-[clamp(4rem,12vh,7rem)] md:pb-8 my-auto md:my-0">
            {/* Bio Block: Photo + Name/Bio */}
            <div className="flex flex-col md:flex-row items-start gap-7 lg:gap-10">
              {/* Photo: 96x96 rounded-2xl */}
              <div
                className={`w-[96px] h-[96px] md:w-28 md:h-28 rounded-[14px] overflow-hidden shrink-0 shadow-lg border transition-colors hero-animate ${theme === 'light'
                  ? 'bg-gradient-to-b from-[#e8e8e8] to-[#f5f5f5] border-[#e0e0e0]'
                  : 'bg-gradient-to-b from-[#2a2a2a] to-[#161616] border-[#2a2a2a]'
                  }`}
                style={{ animationDelay: '0ms' }}
              >
                <img
                  src="/img/drei.jpg"
                  alt="Kellas Andrei"
                  className="w-full h-full object-cover filter grayscale contrast-[1.25] brightness-[1.05]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Text block beside photo */}
              <div className="flex-1 space-y-3.5 w-full">
                <div>
                  <h1
                    className={`text-[36px] sm:text-[48px] font-sans font-medium tracking-[-0.5px] leading-tight hero-animate ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                      }`}
                    style={{ animationDelay: '80ms' }}
                  >
                    Kellas Andrei
                  </h1>
                  <p
                    className={`text-[14px] font-mono font-normal lowercase tracking-[1px] mt-1 hero-animate ${theme === 'light' ? 'text-[#4c5bc4]' : 'text-[#7c8ce0]'
                      }`}
                    style={{ animationDelay: '160ms' }}
                  >
                    Fullstack Web developer
                  </p>
                </div>

                <p
                  className={`text-[15px] font-sans leading-[1.6] max-w-[480px] hero-animate ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                    }`}
                  style={{ animationDelay: '240ms' }}
                >
                  I like software that's fast, honest, and doesn't waste anyone's time including mine. I care more about whether something works under real load than whether it looks good in a demo.
                  Currently obsessed with agentic dev workflows and what they change about how software gets built.
                </p>

                {/* Styled text links row below bio */}
                <div
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 hero-animate"
                  style={{ animationDelay: '320ms' }}
                >
                  <a
                    href="https://github.com/kellasandyyyy1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playExternalLink}
                    className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] whitespace-nowrap shrink-0 group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                      }`}
                  >
                    <GithubLogo weight="light" size={16} className={
                      theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                    } />
                    <span>github</span>
                    <ArrowUpRight weight="light" size={14} className={
                      theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                    } />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playExternalLink}
                    className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] whitespace-nowrap shrink-0 group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                      }`}
                  >
                    <LinkedinLogo weight="light" size={16} className={
                      theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                    } />
                    <span>linkedin</span>
                    <ArrowUpRight weight="light" size={14} className={
                      theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                    } />
                  </a>
                  <button
                    onClick={() => { playExternalLink(); setShowBookCall(true); }}
                    className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] whitespace-nowrap shrink-0 cursor-pointer group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                      }`}
                  >
                    <Calendar weight="light" size={16} className={
                      theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                    } />
                    <span>book call</span>
                    <ArrowUpRight weight="light" size={14} className={
                      theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                    } />
                  </button>
                </div>
              </div>
            </div>

            {/* Stat Grid */}
            <div
              className={`pt-6 mt-8 border-t hero-animate ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'}`}
              style={{ animationDelay: '400ms' }}
            >
              <div className={`grid grid-cols-2 md:grid-cols-4 md:w-full gap-[1px] rounded-xl overflow-hidden border ${theme === 'light' ? 'bg-[#ececec] border-[#ececec]' : 'bg-[#1e1e1e] border-[#1e1e1e]'
                }`}>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '480ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-pixel leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>1+ YRS</div>
                  <div className={`text-[10px] font-mono uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>EXPERIENCE</div>
                </div>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '530ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-pixel leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>15+</div>
                  <div className={`text-[10px] font-mono uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>PROJECTS BUILT</div>
                </div>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '580ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-pixel leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>12+</div>
                  <div className={`text-[10px] font-mono uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>technologies</div>
                </div>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '630ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-pixel leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>Manila, PH</div>
                  <div className={`text-[10px] font-mono uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>LOCATION</div>
                </div>
              </div>
            </div>
          </section>

          {/* --- 01 / Overview Section --- */}
          <section id="about" ref={aboutRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 md:pt-16 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <SectionHeading number="01" theme={theme} isInView={aboutInView} baseDelay={0}>my approach</SectionHeading>

            <p className={`text-[14px] md:text-[15px] font-sans leading-[1.6] max-w-[480px] mb-8 md:mb-10 ${getAnimClass(aboutInView)} ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#888888]'
              }`}
              style={{ animationDelay: '160ms' }}
            >
              I build products end to end, from API design to pixel-level UI polish, with a bias toward clean, maintainable code.
            </p>

            <ApproachSection theme={theme} />
          </section>

          {/* --- 02 / Experience Section --- */}
          <section id="experience" ref={expRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-10">
              <SectionHeading number="02" className="mb-2" theme={theme} isInView={expInView} baseDelay={0}>Experience</SectionHeading>
              <p
                className={`text-[15px] font-sans mt-2 max-w-xl ${getAnimClass(expInView)} ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                  }`}
                style={{ animationDelay: '160ms' }}
              >
                1+ years of building scalable full-stack applications, modern web interfaces, and digital products.
              </p>
            </div>

            <div className="space-y-0 relative">
              {EXPERIENCES.map((exp, index) => {
                const isLast = index === EXPERIENCES.length - 1;
                return (
                  <div
                    key={exp.id}
                    className={`flex gap-4 sm:gap-6 group ${getAnimClass(expInView)}`}
                    style={{ animationDelay: `${240 + index * 60}ms` }}
                  >
                    {/* Timeline left column */}
                    <div className="flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-[10px] border flex items-center justify-center text-[12px] font-mono font-medium shrink-0 shadow-sm ${theme === 'light'
                        ? 'border-[#e0e0e0] bg-[#ffffff] text-[#1a1a1a]'
                        : 'border-[#2a2a2a] bg-[#0a0a0a] text-[#e5e5e5]'
                        }`}>
                        <ExperienceLogo exp={exp} />
                      </div>
                      {!isLast && (
                        <div className={`w-[1px] flex-1 my-2 min-h-[40px] ${theme === 'light' ? 'bg-[#d8d8d8]' : 'bg-[#242424]'
                          }`} />
                      )}
                    </div>

                    {/* Timeline right column */}
                    <div className="pb-10 flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h3 className={`text-[16px] font-sans font-medium ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                          }`}>{exp.company}</h3>
                        <span className={`text-[11px] font-mono lowercase tracking-[1px] ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                          }`}>· {exp.employmentType} ({exp.location})</span>
                      </div>

                      <div className={`text-[15px] font-sans font-medium mt-0.5 ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                        }`}>
                        {exp.role}
                      </div>

                      <div className={`text-[11px] tracking-[1px] font-mono uppercase mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                        }`}>
                        {exp.period}
                      </div>

                      <p className={`text-[15px] font-sans leading-[1.6] mt-2.5 max-w-2xl ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                        }`}>
                        {exp.description}
                      </p>

                      {/* Skill tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-3.5">
                        {exp.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className={`border rounded-md px-2.5 py-1 text-[12px] font-mono lowercase tracking-[0.5px] ${theme === 'light'
                              ? 'border-[#e0e0e0] text-[#5a5a5a] bg-[#f0f0f0]'
                              : 'border-[#2a2a2a] text-[#cccccc] bg-[#111113]'
                              }`}
                          >
                            {skill.toLowerCase()}
                          </span>
                        ))}
                        {exp.moreSkillsCount && (
                          <span className={`border border-dashed rounded-md px-2.5 py-1 text-[11px] font-mono lowercase tracking-[1px] ${theme === 'light'
                            ? 'border-[#e0e0e0] text-[#8a8a8a]'
                            : 'border-[#2a2a2a] text-[#777777]'
                            }`}>
                            +{exp.moreSkillsCount} skills
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Experience bottom footer */}
            <div
              className={`border-t pt-6 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getAnimClass(expInView)} ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
                }`}
              style={{ animationDelay: `${240 + EXPERIENCES.length * 60}ms` }}
            >
              <div className={`text-[13px] font-sans ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#777777]'
                }`}>
                Interested in collaborating or discussing technical roles?
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="https://github.com/kellasandyyyy1"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playExternalLink}
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] whitespace-nowrap shrink-0 group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <GithubLogo weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>github</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </a>
                <a
                  href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playExternalLink}
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] whitespace-nowrap shrink-0 group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <LinkedinLogo weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>LINKEDIN</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </a>
                <button
                  onClick={() => { playExternalLink(); setShowBookCall(true); }}
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] whitespace-nowrap shrink-0 cursor-pointer group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <Calendar weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>BOOK CALL</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </button>
              </div>
            </div>
          </section>

          {/* --- 03 / Stack Section --- */}
          <section id="stack" ref={stackRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-10">
              <SectionHeading number="03" className="mb-2" theme={theme} isInView={stackInView} baseDelay={0}>My Tech Stack</SectionHeading>
              <p
                className={`text-[13px] font-sans mt-2 max-w-[480px] ${getAnimClass(stackInView)} ${theme === 'light' ? 'text-[#4c5bc4]' : 'text-[#7c8ce0]'
                  }`}
                style={{ animationDelay: '160ms' }}
              >
                Tools, ranked by how often I reach for them.
              </p>
            </div>

            {/* Multi-column Grid (3 columns on desktop, 1 on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 w-full max-w-6xl">
              {TECH_STACK_DATA.map((group, groupIdx) => (
                <div
                  key={group.category}
                  className={`flex flex-col ${getAnimClass(stackInView)}`}
                  style={{ animationDelay: `${240 + groupIdx * 60}ms` }}
                >
                  {/* Category Header */}
                  <div className={`text-[10px] font-mono uppercase tracking-[1.5px] mb-2.5 select-none border-b pb-1.5 ${theme === 'light' ? 'text-[#8a8a8a] border-[#e0e0e0]' : 'text-[#666666] border-[#222222]'
                    }`}>
                    {group.category}
                  </div>

                  {/* Tool rows within column */}
                  <div className="flex flex-col">
                    {group.tools.map((tool, idx) => {
                      const isLastInGroup = idx === group.tools.length - 1;
                      return (
                        <div
                          key={tool.name}
                          className={`flex items-center py-[9px] transition-colors px-0.5 ${theme === 'light' ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.015]'
                            } ${isLastInGroup ? '' : (theme === 'light' ? 'border-b border-[#ececec]' : 'border-b border-[#1a1a1a]')
                            }`}
                        >
                          {/* Left: Icon + Tool Name */}
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {tool.customIcon ? (
                              tool.customIcon
                            ) : tool.iconClass ? (
                              <i className={`${tool.iconClass} text-[14px] shrink-0 opacity-90`} />
                            ) : (
                              <Cpu size={14} className={`shrink-0 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#888888]'}`} />
                            )}
                            <span className={`text-[13px] font-sans font-normal truncate ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                              }`}>
                              {tool.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- Certifications Section --- */}
          <section id="certifications" ref={certRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-8">
              <span
                className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${getAnimClass(certInView)} ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                  }`}
                style={{ animationDelay: '0ms' }}
              >
                05 - 08
              </span>
              <h2
                className={`text-[26px] font-mono font-medium leading-none tracking-normal mt-1 lowercase ${getAnimClass(certInView)} ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                  }`}
                style={{ animationDelay: '80ms' }}
              >
                certifications
              </h2>
              <p
                className={`text-[13px] font-sans ${getAnimClass(certInView)} ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#888888]'} mt-2.5 max-w-xl leading-relaxed`}
                style={{ animationDelay: '160ms' }}
              >
                verified industry certifications and technical credentials issued by official platforms.
              </p>
            </div>

            <div className={`border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1C1C1A]'}`}>
              {CERTIFICATIONS.map((cert, index) => (
                <a
                  key={cert.id}
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between py-[15px] px-1 transition-colors group min-h-[44px] cursor-pointer ${getAnimClass(certInView)} ${index === CERTIFICATIONS.length - 1
                    ? ''
                    : theme === 'light'
                      ? 'border-b border-[#ececec]'
                      : 'border-b border-[#1C1C1A]'
                    }`}
                  style={{ animationDelay: `${240 + index * 50}ms` }}
                >
                  {/* Left: Brand Icon + Title */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className={`shrink-0 flex items-center justify-center text-[17px] ${theme === 'light' ? 'text-[#1a1a1a] group-hover:text-black' : 'text-[#E5E5E0] group-hover:text-white'
                      } transition-colors`}>
                      {cert.icon}
                    </span>
                    <span className={`text-[clamp(13px,3vw,14px)] font-sans font-normal leading-snug break-words ${theme === 'light' ? 'text-[#1a1a1a] group-hover:text-black' : 'text-[#E5E5E0] group-hover:text-white'
                      } transition-colors`}>
                      {cert.title}
                    </span>
                  </div>

                  {/* Right: Issuer + External Link Icon */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-[29px] sm:pl-0 mt-1.5 sm:mt-0 shrink-0">
                    <span className={`text-[11px] font-mono uppercase tracking-[1px] ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#5a5a5a]' : 'text-[#888888] group-hover:text-[#aaaaaa]'
                      } transition-colors`}>
                      {cert.issuer}
                    </span>
                    <ArrowUpRight size={14} className={`transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                      }`} />
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* --- How I Think Section --- */}
          <section id="process" className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-8">
              <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                04 — 08
              </span>
              <h2 className={`text-[26px] font-mono font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                }`}>
                how i think
              </h2>
            </div>
            <HowIThinkSection theme={theme} />
          </section>

          {/* --- Projects Section --- */}
          <section id="projects" className={`py-12 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t select-none overflow-hidden ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                  }`}>
                  05 — 08
                </span>
                <h2 className={`text-[22px] font-mono font-normal leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                  }`}>
                  my works
                </h2>
              </div>
              <span className={`shrink-0 flex items-center gap-1 text-[10px] font-mono ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                01—08
                <ArrowUpRight weight="light" size={10} className="shrink-0" />
              </span>
            </div>
            {/* Mobile: compact list rows, no thumbnails (below md) */}
            <div className="md:hidden px-4">
              {PROJECTS.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  className={`flex items-center justify-between gap-3 py-[10px] cursor-pointer group border-b-[0.5px] ${index === 0 ? 'border-t-[0.5px]' : ''
                    } ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1a1a1a]'}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <span className={`text-[12px] font-mono transition-colors truncate ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#777777] group-hover:text-[#bbbbbb]'
                    }`}>
                    {project.title}
                  </span>

                  <span className="shrink-0 flex items-center gap-2">
                    <span className={`inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] ${theme === 'light'
                      ? 'border-[#ececec] text-[#a0a0a0]'
                      : 'border-[#1e1e1e] text-[#333333]'
                      }`}>
                      {project.tags?.[0]?.toLowerCase() || 'web'}
                    </span>
                    <ArrowUpRight
                      weight="light"
                      size={10}
                      className={`shrink-0 transition-colors ${theme === 'light' ? 'text-[#c4c4c0] group-hover:text-[#5a5a5a]' : 'text-[#2a2a2a] group-hover:text-[#666666]'
                        }`}
                    />
                  </span>
                </motion.div>
              ))}

              {/* Browse all row — keeps the all-projects modal reachable on mobile */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex items-center justify-between gap-3 py-[10px] cursor-pointer group border-b-[0.5px] ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1a1a1a]'
                  }`}
                onClick={() => setShowAllProjects(true)}
              >
                <span className={`text-[12px] font-mono transition-colors truncate ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#777777] group-hover:text-[#bbbbbb]'
                  }`}>
                  browse all
                </span>

                <span className="shrink-0 flex items-center gap-2">
                  <span className={`inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] ${theme === 'light'
                    ? 'border-[#ececec] text-[#a0a0a0]'
                    : 'border-[#1e1e1e] text-[#333333]'
                    }`}>
                    grid
                  </span>
                  <ArrowUpRight
                    weight="light"
                    size={10}
                    className={`shrink-0 transition-colors ${theme === 'light' ? 'text-[#c4c4c0] group-hover:text-[#5a5a5a]' : 'text-[#2a2a2a] group-hover:text-[#666666]'
                      }`}
                  />
                </span>
              </motion.div>
            </div>

            {/* Tablet 2-col / Desktop 4-col grid (md and above) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-[1px] w-full rounded-[6px] overflow-hidden">
              {PROJECTS.map((project, index) => {
                const isFeatured = index === 0 || index === 5;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className={`cursor-pointer group flex flex-col min-w-0 transition-colors duration-200 ring-[0.5px] ${isFeatured ? 'lg:col-span-2' : ''
                      } ${theme === 'light' ? 'bg-[#ffffff] hover:bg-[#fafafa] ring-[#e0e0e0]' : 'bg-[#0d0d0d] hover:bg-[#111111] ring-[#1a1a1a]'}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    {/* Thumbnail */}
                    <div className={`w-full relative overflow-hidden flex items-center justify-center aspect-[16/10] ${isFeatured ? 'lg:aspect-[2/1]' : 'lg:aspect-[4/3]'
                      } ${theme === 'light' ? 'bg-[#f0f0f0]' : 'bg-[#141414]'}`}>
                      {project.image ? (
                        <img
                          src={project.image}
                          alt=""
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className={`w-1/2 h-1/2 transition-colors duration-300 ${theme === 'light'
                          ? 'bg-[#e8e8e8] group-hover:bg-[#e0e0e0]'
                          : 'bg-[#1c1c1c] group-hover:bg-[#202020]'
                          }`} />
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="px-[10px] py-[8px] flex flex-col gap-1.5 min-w-0">
                      <div className={`text-[11px] font-mono transition-colors truncate ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#777777] group-hover:text-[#bbbbbb]'
                        }`}>
                        {project.title}
                      </div>

                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className={`inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] truncate ${theme === 'light'
                          ? 'border-[#ececec] text-[#a0a0a0]'
                          : 'border-[#1e1e1e] text-[#333333]'
                          }`}>
                          {project.tags?.[0]?.toLowerCase() || 'web'}
                        </span>
                        <ArrowUpRight
                          weight="light"
                          size={10}
                          className={`shrink-0 transition-colors ${theme === 'light' ? 'text-[#c4c4c0] group-hover:text-[#5a5a5a]' : 'text-[#2a2a2a] group-hover:text-[#666666]'
                            }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* --- Services Section --- */}
          <section id="services" className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <SectionHeading number="06" theme={theme}>Services</SectionHeading>

            <div className={`border-t mt-8 lg:mt-12 ${theme === 'light' ? 'border-[#ececec]' : 'border-zinc-900/30 dark:border-zinc-800/60'
              }`}>
              {SERVICES.map((service, index) => {
                const numStr = String(index + 1).padStart(2, '0');
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                  >
                    {/* Mobile Layout (< 768px) */}
                    <div className={`flex flex-col gap-1.5 py-3.5 px-0 border-b relative group cursor-pointer transition-all duration-200 md:hidden ${theme === 'light'
                      ? 'border-[#ececec] hover:bg-[#f0f0f0]/60'
                      : 'border-zinc-900/30 dark:border-zinc-800/50 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20'
                      }`}>
                      <div className="flex items-center gap-2.5 pr-8">
                        <span className={`text-[11px] font-mono shrink-0 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-zinc-500'
                          }`}>{numStr}</span>
                        <h4 className={`text-[14px] font-medium uppercase font-sans tracking-tight break-words ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-zinc-900 dark:text-white'
                          }`}>
                          {service.title}
                        </h4>
                      </div>
                      <p className={`text-[12px] break-words pr-8 leading-relaxed ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>
                        {service.description}
                      </p>
                      <div className={`absolute right-0 top-3.5 transition-colors ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`}>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Tablet & Desktop Layout (>= 768px) */}
                    <div className={`hidden md:flex items-center gap-5 py-[18px] px-1 border-b group cursor-pointer transition-all duration-200 ${theme === 'light'
                      ? 'border-[#ececec] hover:bg-[#f0f0f0]/60'
                      : 'border-zinc-900/30 dark:border-zinc-800/50 hover:bg-zinc-900/20'
                      }`}>
                      <span className={`w-6 shrink-0 text-[13px] font-mono ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-zinc-500'
                        }`}>
                        {numStr}
                      </span>
                      <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-5">
                        <h4 className={`text-base font-medium font-sans uppercase tracking-tight lg:flex-1 truncate ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-zinc-900 dark:text-white'
                          }`}>
                          {service.title}
                        </h4>
                        <p className={`text-[12px] lg:text-[13px] lg:flex-1 break-words leading-relaxed ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-zinc-500 dark:text-zinc-400'
                          }`}>
                          {service.description}
                        </p>
                      </div>
                      <ArrowUpRight className={`w-5 h-5 transition-all duration-300 shrink-0 ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* --- Resources Section --- */}
          <section id="resources" className={`py-16 md:py-24 px-5 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-6 md:mb-8">
              <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                07 — 08
              </span>
              <h2 className={`text-[26px] sm:text-[32px] font-mono font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                }`}>
                resources
              </h2>
              <p className={`text-[13px] font-sans mt-2.5 max-w-xl leading-relaxed ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#888888]'
                }`}>
                the courses, docs, and writing i actually go back to. curated, not collected.
              </p>
            </div>

            <ResourcesGrid theme={theme} />
          </section>

          {/* --- GitHub Section --- */}
          <section id="github" className={`py-16 md:py-24 px-5 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="max-w-[640px]">
              <GithubSection theme={theme} />
            </div>
          </section>

          {/* --- Contact Section --- */}
          <section id="contact" className={`py-20 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t mb-16 ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-8">
              <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                08 — 08 / CONTACT
              </span>
              <h2 className={`text-[26px] font-mono font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                }`}>

              </h2>
            </div>

            <div className="max-w-[560px] space-y-7">
              <h3 className={`text-[32px] sm:text-[46px] font-sans font-medium leading-[1.15] tracking-[-0.5px] ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                }`}>
                Have a project in mind? Let's talk.
              </h3>

              <div>
                <a
                  href="mailto:kellasandrei00@gmail.com"
                  className={`inline-block text-[20px] sm:text-[22px] font-sans font-normal transition-colors border-b pb-2 ${theme === 'light'
                    ? 'text-[#1a1a1a] hover:text-black border-[#e0e0e0]'
                    : 'text-[#e5e5e5] hover:text-white border-[#2a2a2a]'
                    }`}
                >
                  kellasandrei00@gmail.com
                </a>
              </div>

              {/* Actions row: text links with icons on left & arrow on right */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 pt-3">
                <button
                  onClick={() => { playExternalLink(); setShowBookCall(true); }}
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] cursor-pointer group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <Calendar weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>BOOK A CALL</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </button>

                <a
                  href="/resume.pdf"
                  download="Kellas-Andrei-Resume.pdf"
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <Download weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>DOWNLOAD RESUME</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </a>

                <a
                  href="https://github.com/kellasandyyyy1"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playExternalLink}
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <GithubLogo weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>github</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </a>

                <a
                  href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playExternalLink}
                  className={`transition-colors inline-flex items-center gap-2 text-[13px] font-mono lowercase tracking-[0.5px] group ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#cccccc] hover:text-white'
                    }`}
                >
                  <LinkedinLogo weight="light" size={16} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                  <span>LINKEDIN</span>
                  <ArrowUpRight weight="light" size={14} className={
                    theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-[#888888] group-hover:text-white'
                  } />
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className={`py-12 px-12 border-t max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.3em] ${theme === 'light' ? 'border-[#ececec] text-[#8a8a8a]' : 'border-zinc-900 text-zinc-600'
          }`}>
          <div className="flex gap-8">
            <span></span>
            <span></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
