import * as React from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { FaAws } from 'react-icons/fa6';
import { SiPearson, SiCisco } from 'react-icons/si';
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
  CircleNotch,
  Video,
  User,
  Briefcase,
  Wrench,
  ChatText as MessageSquare,
  Sparkle as Sparkles,
  Plant as Sprout,
  GameController as Gamepad2,
  Code,
  Terminal,
  Layout,
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
    title: "Social Website",
    description: "A small project called Privy a social website that lets you interact with other existing user and share moments and music with them.",
    tags: ["React", "Tailwind", "node.js", "Express, Firebase, Vite"],
    image: "/img/p3.PNG",
    link: "privysocial.vercel.app",
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
  experience: string;
}

interface TechStackGroup {
  category: string;
  tools: TechStackTool[];
}

const TECH_STACK_DATA: TechStackGroup[] = [
  {
    category: "FRONTEND",
    tools: [
      { name: "React", iconClass: "devicon-react-original colored", experience: "2 yrs" },
      { name: "TypeScript", iconClass: "devicon-typescript-plain colored", experience: "2 yrs" },
      { name: "Next.js", iconClass: "devicon-nextjs-plain", experience: "1.5 yrs" },
      { name: "Tailwind CSS", iconClass: "devicon-tailwindcss-plain colored", experience: "2 yrs" },
      { name: "HTML5 & CSS3", iconClass: "devicon-html5-plain colored", experience: "2 yrs" },
      { name: "Framer Motion", iconClass: "devicon-framermotion-original", experience: "1 yr" },
      { name: "D3.js", iconClass: "devicon-d3js-plain colored", experience: "6 mos" },
    ],
  },
  {
    category: "BACKEND",
    tools: [
      { name: "Node.js", iconClass: "devicon-nodejs-plain colored", experience: "2 yrs" },
      { name: "REST APIs & WebSockets", iconClass: "devicon-fastapi-plain colored", experience: "1.5 yrs" },
      { name: "Firebase & Firestore", iconClass: "devicon-firebase-plain colored", experience: "1.5 yrs" },
    ],
  },
  {
    category: "DEVOPS & TOOLS",
    tools: [
      { name: "Vercel", iconClass: "devicon-vercel-original", experience: "1.5 yrs" },
      { name: "Railway", iconClass: "devicon-railway-original", experience: "1 yr" },
      { name: "Git & GitHub", iconClass: "devicon-git-plain colored", experience: "2 yrs" },
    ],
  },
  {
    category: "AI & DESIGN",
    tools: [
      { name: "Gemini & LLM APIs", customIcon: <GeminiIcon />, experience: "1 yr" },
      { name: "Claude AI", customIcon: <ClaudeIcon />, experience: "1.5 yrs" },
      { name: "OpenAI Codex", customIcon: <CodexIcon />, experience: "1 yr" },
      { name: "Figma & UI Systems", iconClass: "devicon-figma-plain colored", experience: "1.5 yrs" },
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

interface ExperienceEntry {
  id: string;
  initials: string;
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

  const group1Links = [
    { id: 'about', name: 'About', href: '#about', icon: <User weight="light" size={16} /> },
    { id: 'experience', name: 'Experience', href: '#experience', icon: <Layers weight="light" size={16} /> },
    { id: 'stack', name: 'Stack', href: '#stack', icon: <Cpu weight="light" size={16} /> },
    { id: 'certifications', name: 'Certifications', href: '#certifications', icon: <CheckCircle weight="light" size={16} /> },
  ];

  const group2Links = [
    { id: 'work', name: 'Work', href: '#projects', icon: <Briefcase weight="light" size={16} /> },
    { id: 'services', name: 'Services', href: '#services', icon: <Wrench weight="light" size={16} /> },
    { id: 'contact', name: 'Contact', href: '#contact', icon: <Envelope weight="light" size={16} /> },
  ];

  const navLinks = [...group1Links, ...group2Links];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'stack', 'certifications', 'projects', 'services', 'contact'];
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

  const renderDesktopNavLink = (link: { id: string; name: string; href: string; icon: React.ReactNode }) => {
    const isActive = activeSection === link.id;
    return (
      <a
        key={link.id}
        href={link.href}
        className={`relative py-[8px] px-[12px] rounded-[8px] flex items-center gap-2.5 text-[13px] font-mono tracking-[0.5px] transition-colors duration-150 w-full group cursor-pointer ${isActive
          ? theme === 'light'
            ? 'bg-[#f0f0f0] text-[#1a1a1a] font-medium'
            : 'bg-[#161616] text-[#f5f5f5] font-medium'
          : theme === 'light'
            ? 'text-[#8a8a85] hover:text-[#1a1a1a] hover:bg-[#f0f0f0] font-normal'
            : 'text-[#8a8a85] hover:text-[#c9c9c4] hover:bg-[#161616] font-normal'
          }`}
      >
        {isActive && (
          <span
            className={`absolute left-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[16px] rounded-full ${theme === 'light' ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f5]'
              }`}
          />
        )}
        <span
          className={`transition-colors duration-150 shrink-0 ${isActive
            ? theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#f5f5f5]'
            : theme === 'light'
              ? 'text-[#8a8a85] group-hover:text-[#1a1a1a]'
              : 'text-[#8a8a85] group-hover:text-[#c9c9c4]'
            }`}
        >
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
        <nav className="flex flex-col w-full my-auto space-y-1">
          {/* Group 1: Profile Info */}
          <div className="flex flex-col gap-0.5">
            {group1Links.map(renderDesktopNavLink)}
          </div>

          {/* Thin Horizontal Divider */}
          <div className={`my-2.5 border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1c1c1c]'}`} />

          {/* Group 2: Engagement */}
          <div className="flex flex-col gap-0.5">
            <span className={`px-3 pb-1 text-[10px] font-mono uppercase tracking-[1.5px] select-none ${theme === 'light' ? 'text-[#a0a0a0]' : 'text-[#4a4a46]'
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
              className={`w-[32px] h-[32px] rounded-[8px] border flex items-center justify-center transition-colors duration-150 cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a] hover:border-[#a0a0a0]'
                : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4] hover:border-[#3a3a3a]'
                }`}
              title="Email"
            >
              <Envelope weight="light" size={16} />
            </a>
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
              className={`text-xs font-mono uppercase tracking-[0.5px] transition-colors ${activeSection === link.id
                ? (theme === 'light' ? 'text-[#1a1a1a] font-medium' : 'text-white font-medium')
                : (theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a8a] hover:text-white')
                }`}
            >
              {link.name}
            </a>
          ))}

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
                    onClick={() => setIsOpen(false)}
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
                {onOpenResume && (
                  <button
                    onClick={() => { setIsOpen(false); onOpenResume(); }}
                    className={`text-left text-xs py-2 flex items-center gap-1.5 cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#a1a1aa] hover:text-white'
                      }`}
                  >
                    <FileText weight="light" size={15} />
                    <span>Resume</span>
                  </button>
                )}
                {onBookCall && (
                  <button
                    onClick={() => { setIsOpen(false); onBookCall(); }}
                    className={`text-left text-xs py-2 flex items-center gap-1.5 cursor-pointer ${theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#a1a1aa] hover:text-white'
                      }`}
                  >
                    <Calendar weight="light" size={15} />
                    <span>Book Call</span>
                  </button>
                )}
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
        {number} — 07
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
          className={`w-full max-h-[85vh] max-w-4xl flex flex-col rounded-3xl overflow-hidden border shadow-2xl ${theme === 'light'
            ? 'bg-white border-zinc-200 text-black'
            : 'bg-[#0a0a0c] border-zinc-800/80 text-white'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-5 md:p-6 flex items-center justify-between border-b gap-3 shrink-0 ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/50' : 'border-zinc-800/80 bg-zinc-900/40'
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
          <div className="p-6 overflow-y-auto flex-1 bg-black/20">
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

            {/* 5. Tag Row */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase tracking-[0.5px] border ${theme === 'light'
                      ? 'bg-[#f0f0f0] border-[#e0e0e0] text-[#5a5a5a]'
                      : 'bg-[#161618] border-[#2a2a2a] text-[#cccccc]'
                      }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
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

interface TerminalStep {
  name: string;
  desc: string;
  color: string;
}

const TERMINAL_STEPS: TerminalStep[] = [
  { name: "understand", desc: "read the problem first", color: "text-[#c084fc]" },
  { name: "plan", desc: "sketch the approach", color: "text-[#2dd4bf]" },
  { name: "build", desc: "write the code", color: "text-[#60a5fa]" },
  { name: "test", desc: "check it actually works", color: "text-[#fbbf24]" },
  { name: "refine", desc: "clean it up", color: "text-[#f472b6]" },
];

const HowIThinkSection = () => {
  const fullCommand = "start process";
  const [typedLength, setTypedLength] = useState(0);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setTypedLength(fullCommand.length);
      setIsTypingDone(true);
      setCompletedCount(TERMINAL_STEPS.length);
      setIsFinished(true);
      return;
    }

    let isMounted = true;

    const runAnimation = async () => {
      // 1. Type command character by character
      for (let i = 0; i <= fullCommand.length; i++) {
        if (!isMounted) return;
        setTypedLength(i);
        await new Promise((r) => setTimeout(r, 28));
      }

      if (!isMounted) return;
      await new Promise((r) => setTimeout(r, 300));
      setIsTypingDone(true);

      // 2. Process steps one by one
      const stepDelays = [380, 420, 360, 450, 400];
      for (let i = 0; i < TERMINAL_STEPS.length; i++) {
        if (!isMounted) return;
        setActiveStep(i);
        await new Promise((r) => setTimeout(r, stepDelays[i]));
        setCompletedCount(i + 1);
      }

      if (!isMounted) return;
      setActiveStep(null);
      setIsFinished(true);

      // 3. Pause 5s on completed state then restart
      await new Promise((r) => setTimeout(r, 5000));
      if (!isMounted) return;

      // Reset
      setTypedLength(0);
      setIsTypingDone(false);
      setActiveStep(null);
      setCompletedCount(0);
      setIsFinished(false);

      runAnimation();
    };

    runAnimation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full">
      {/* Terminal Window Container */}
      <div className="max-w-[540px] bg-[#0d0d0d] border border-[#1e1e1e] rounded-[10px] overflow-hidden select-none font-mono">
        {/* Terminal Header Bar */}
        <div className="py-[10px] px-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#333333]" />
            <div className="w-2 h-2 rounded-full bg-[#333333]" />
            <div className="w-2 h-2 rounded-full bg-[#333333]" />
          </div>
          <span className="text-[10px] text-[#555555] font-mono">process.sh</span>
        </div>

        {/* Log Body */}
        <div className="p-4 sm:px-6 sm:py-5 text-[12.5px] leading-[2.3] text-[#9a9a9a] min-h-[280px] flex flex-col justify-start">
          {/* Command Prompt Line */}
          <div className="flex items-center gap-2">
            <span className="text-[#e5e5e5]">$</span>
            <span className="text-[#e5e5e5]">{fullCommand.slice(0, typedLength)}</span>
            {!isTypingDone && (
              <span className="inline-block w-2 h-4 bg-[#e5e5e5] animate-pulse ml-0.5 align-middle" />
            )}
          </div>

          {/* Steps Output */}
          {isTypingDone && (
            <div className="mt-1 flex flex-col">
              {TERMINAL_STEPS.map((step, idx) => {
                const isCompleted = idx < completedCount;
                const isActive = idx === activeStep;

                if (!isCompleted && !isActive) return null;

                return (
                  <div key={step.name} className="flex items-center gap-2 text-[12.5px]">
                    {isCompleted ? (
                      <Check size={13} className="text-[#666666] shrink-0" />
                    ) : (
                      <CircleNotch size={13} className="text-[#888888] animate-spin shrink-0" />
                    )}
                    <span className={`${step.color} font-medium`}>{step.name}</span>
                    <span className="text-[#555555]">—</span>
                    <span className="text-[#9a9a9a]">{step.desc}</span>
                  </div>
                );
              })}

              {/* Completion Line */}
              {isFinished && (
                <div className="flex items-center gap-2 text-[12.5px] mt-1 text-[#22c55e]">
                  <Check size={13} className="text-[#22c55e] shrink-0" />
                  <span>done</span>
                  <span className="text-[#15803d]">—</span>
                  <span className="text-[#22c55e]/90">five steps, no shortcuts</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
          <section className="min-h-[calc(100vh-60px)] md:min-h-screen flex flex-col justify-center p-6 md:p-12 lg:p-16 max-w-7xl py-12 md:py-20 my-auto">
            {/* Bio Block: Photo + Name/Bio */}
            <div className="flex flex-col md:flex-row items-start gap-7 lg:gap-10">
              {/* Photo: 96x96 rounded-2xl */}
              <div
                className={`w-[96px] h-[96px] rounded-[14px] overflow-hidden shrink-0 shadow-lg border transition-colors hero-animate ${theme === 'light'
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
                    onClick={() => setShowBookCall(true)}
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
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-[1px] rounded-xl overflow-hidden border ${theme === 'light' ? 'bg-[#ececec] border-[#ececec]' : 'bg-[#1e1e1e] border-[#1e1e1e]'
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
          <section id="about" ref={aboutRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <SectionHeading number="01" theme={theme} isInView={aboutInView} baseDelay={0}>my approach</SectionHeading>

            <div className="max-w-3xl space-y-6">
              <p className={`text-[16px] sm:text-[18px] font-sans leading-[1.6] font-normal ${getAnimClass(aboutInView)} ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                }`}
                style={{ animationDelay: '160ms' }}
              >
                I build products end to end, from API design to pixel level UI polish  with a bias toward clean, maintainable code.
              </p>

              <div className="pt-2 space-y-4">
                <div
                  className={`flex items-start gap-3.5 ${getAnimClass(aboutInView)}`}
                  style={{ animationDelay: '240ms' }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${theme === 'light'
                    ? 'bg-[#f0f0f0] border-[#e0e0e0] text-[#1a1a1a]'
                    : 'bg-[#171717] border-[#262626] text-[#e5e5e5]'
                    }`}>
                    <Code weight="light" size={16} />
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-sans font-medium ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                      }`}>Frontend Architecture</h4>
                    <p className={`text-[13px] font-sans mt-0.5 ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                      }`}>Scalable React applications, state management, and responsive performance.</p>
                  </div>
                </div>

                <div
                  className={`flex items-start gap-3.5 ${getAnimClass(aboutInView)}`}
                  style={{ animationDelay: '300ms' }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${theme === 'light'
                    ? 'bg-[#f0f0f0] border-[#e0e0e0] text-[#1a1a1a]'
                    : 'bg-[#171717] border-[#262626] text-[#e5e5e5]'
                    }`}>
                    <Terminal weight="light" size={16} />
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-sans font-medium ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                      }`}>API and Backend Design</h4>
                    <p className={`text-[13px] font-sans mt-0.5 ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                      }`}>REST APIs, Node.js microservices, and cloud database integrations.</p>
                  </div>
                </div>

                <div
                  className={`flex items-start gap-3.5 ${getAnimClass(aboutInView)}`}
                  style={{ animationDelay: '360ms' }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${theme === 'light'
                    ? 'bg-[#f0f0f0] border-[#e0e0e0] text-[#1a1a1a]'
                    : 'bg-[#171717] border-[#262626] text-[#e5e5e5]'
                    }`}>
                    <Layout weight="light" size={16} />
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-sans font-medium ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                      }`}>UI and Interaction Design</h4>
                    <p className={`text-[13px] font-sans mt-0.5 ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#9a9a9a]'
                      }`}>Design systems, micro-interactions, and intuitive user interfaces.</p>
                  </div>
                </div>
              </div>
            </div>
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
                        {exp.initials}
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
                  onClick={() => setShowBookCall(true)}
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
                          className={`flex items-center justify-between py-[9px] transition-colors px-0.5 ${theme === 'light' ? 'hover:bg-black/[0.02]' : 'hover:bg-white/[0.015]'
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

                          {/* Right: Experience Value */}
                          <span className={`text-[10px] font-mono uppercase tracking-[0.5px] shrink-0 text-right ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                            }`}>
                            {tool.experience}
                          </span>
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
                05 - 07
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
                04 — 07
              </span>
              <h2 className={`text-[26px] font-mono font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                }`}>
                how i think
              </h2>
            </div>
            <HowIThinkSection />
          </section>

          {/* --- Projects Section --- */}
          <section id="projects" className={`py-12 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t select-none overflow-hidden ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="flex justify-between items-center mb-3 lg:mb-12">
              <SectionHeading number="05" className="mb-0" theme={theme}>my works</SectionHeading>
              <div className="hidden lg:block">
                <span className={`text-[10px] uppercase tracking-[0.4em] font-mono ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-zinc-700'
                  }`}> / 01-06</span>
              </div>
            </div>
            <div className="flex lg:grid lg:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[10px] lg:gap-[12px] overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
              {PROJECTS.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-none w-[140px] lg:w-auto snap-start cursor-pointer group flex flex-col"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Square thumbnail */}
                  <div className={`w-full aspect-square relative overflow-hidden rounded-lg transition-all duration-300 border ${theme === 'light'
                    ? 'bg-[#f0f0f0] border-[#e0e0e0] group-hover:border-[#1a1a1a]/30'
                    : 'bg-zinc-950 border-white/5 group-hover:border-white/20'
                    }`}>
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full ${theme === 'light' ? 'bg-gradient-to-br from-zinc-200 to-zinc-100' : 'bg-gradient-to-br from-zinc-900 to-black'
                        }`} />
                    )}
                  </div>

                  {/* Text Area below thumbnail */}
                  <div className="mt-2 flex flex-col gap-1 min-w-0">
                    <h5 className={`text-[12px] md:text-[13px] font-medium transition-colors truncate font-sans tracking-tight leading-snug ${theme === 'light' ? 'text-[#1a1a1a] group-hover:text-black' : 'text-zinc-300 group-hover:text-white'
                      }`}>
                      {project.title}
                    </h5>

                    <span className={`inline-flex self-start text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border leading-none ${theme === 'light'
                      ? 'bg-[#f0f0f0] border-[#e0e0e0] text-[#5a5a5a]'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                      }`}>
                      {project.tags?.[0]?.toLowerCase() || 'web'}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Optional "See all" Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex-none lg:hidden w-[140px] snap-start cursor-pointer group flex flex-col"
                onClick={() => setShowAllProjects(true)}
              >
                <div className={`w-full aspect-square relative overflow-hidden rounded-lg transition-all duration-300 border flex flex-col items-center justify-center gap-2 ${theme === 'light'
                  ? 'bg-[#f0f0f0] border-[#e0e0e0] group-hover:border-[#1a1a1a]/30'
                  : 'bg-zinc-900/40 border-zinc-800/80 group-hover:border-zinc-700/80'
                  }`}>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${theme === 'light' ? 'bg-white border-[#e0e0e0] group-hover:bg-zinc-100' : 'bg-zinc-900 border-zinc-800 group-hover:bg-zinc-800'
                    }`}>
                    <ArrowRight size={14} className={theme === 'light' ? 'text-[#5a5a5a] group-hover:text-[#1a1a1a]' : 'text-zinc-400 group-hover:text-white'} />
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${theme === 'light' ? 'text-[#5a5a5a] group-hover:text-[#1a1a1a]' : 'text-zinc-400 group-hover:text-white'
                    }`}>See All</span>
                </div>
                <div className="mt-2 flex flex-col gap-1 min-w-0">
                  <h5 className={`text-[12px] font-medium transition-colors truncate font-sans tracking-tight leading-snug ${theme === 'light' ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}>
                    Browse List
                  </h5>
                  <span className={`inline-flex self-start text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${theme === 'light' ? 'bg-[#f0f0f0] text-[#8a8a8a] border-[#e0e0e0]' : 'bg-zinc-950/40 text-zinc-500 border-zinc-900'
                    }`}>
                    Grid Layout
                  </span>
                </div>
              </motion.div>
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

          {/* --- Contact Section --- */}
          <section id="contact" className={`py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto border-t mb-16 ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-8">
              <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                07 — 07 / CONTACT
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
                  onClick={() => setShowBookCall(true)}
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