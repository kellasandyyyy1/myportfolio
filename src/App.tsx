import * as React from 'react';
import { flushSync } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { FaAws } from 'react-icons/fa6';
import { SiPearson, SiCisco, SiUpwork, SiFiverr, SiRakuten } from 'react-icons/si';
import { playExternalLink, playNavTick, playTransition } from './lib/sound';
import { useSoundMuted } from './lib/useSoundMuted';
import BlogPage from './components/BlogPage';
import { HarvestSnakeModal } from './components/HarvestSnake';
import { ServiceCardCanvas } from './components/ServiceCardCanvas';
import { InteractiveProfile } from './components/InteractiveProfile';
import { WalkingCat } from './components/WalkingCat';
import { VisorOrbMascot } from './components/VisorOrbMascot';
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
// Stroke-based set for the nav, so the hover draw-in can animate each outline.
import {
  User as NavUser,
  Layers as NavLayers,
  Cpu as NavCpu,
  CircleCheck as NavCheck,
  Briefcase as NavBriefcase,
  Wrench as NavWrench,
  Library as NavLibrary,
  Mail as NavMail,
} from 'lucide-react';

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
  /** Brand mark component, rendered small as the seal and large as the watermark. */
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

// --- Data ---
const CERTIFICATIONS: Certification[] = [
  {
    id: 'aws-cloud-foundation',
    title: 'AWS Cloud Foundation',
    issuer: 'AWS',
    verifyUrl: 'https://www.credly.com/badges/3f85a03a-b171-48bb-9a37-776bae850bda',
    Icon: FaAws,
  },
  {
    id: 'it-database-specialist',
    title: 'IT Database Specialist',
    issuer: 'Pearson',
    verifyUrl: 'https://www.credly.com/badges/d17211de-6231-4497-af5e-ca3d724d34f3',
    Icon: SiPearson,
  },
  {
    id: 'data-analytics-scalability',
    title: 'Data Analytics & Scalability',
    issuer: 'Cisco',
    verifyUrl: 'https://www.credly.com/badges/ce9f9917-d96e-4bc0-ae66-1039a57a1982',
    Icon: SiCisco,
  },
];
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Yappr",
    description: "A small project called yappr a social website that lets you interact with other existing user and share moments and music with them.",
    tags: ["React", "Tailwind", "node.js", "Express, Supabase, Vite"],
    image: "/img/p3.PNG",
    link: "yapprr.kelas.site",
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
    link: "https://mindcompass.kelas.site",
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
    link: "https://climexx.kelas.site",
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
    link: "https://designarchi.online",
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
  {
    id: 9,
    title: "dual finance",
    description: "Business and personal finance, in one place.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    image: "/img/b1.png",
    link: "https://dualfinance.site",
    screenshots: [
      {
        url: "/img/b1.png",
        caption: ""
      },
      {
        url: "/img/b2.png",
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

// Google Stitch app icon, redrawn from its official 512px favicon: a white pill
// with two button holes on a dark tile with a teal-to-indigo glow at the base.
const StitchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 512 512" className="shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="stitch-glow-hue" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3b3fb8" />
        <stop offset="0.4" stopColor="#5fc6e0" />
        <stop offset="1" stopColor="#6a5ce0" />
      </linearGradient>
      <linearGradient id="stitch-glow-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.5" stopColor="#000" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#stitch-glow-hue)" />
    <rect width="512" height="512" rx="112" fill="url(#stitch-glow-fade)" />
    <rect x="76" y="183" width="360" height="146" rx="73" fill="#f2f3f5" />
    <circle cx="218" cy="257" r="19" fill="#000" />
    <circle cx="292" cy="257" r="19" fill="#000" />
  </svg>
);

// Official AWS wordmark (Devicon SVG). The "aws" text takes its theme colour
// from CSS (.aws-logo-text): white on dark, navy #252f3e on light, per AWS's
// own dark-background variant. The smile stays AWS orange in both.
const AwsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 128 128" className="shrink-0" aria-hidden="true">
    <path className="aws-logo-text" d="M36.379 53.64c0 1.56.168 2.825.465 3.75.336.926.758 1.938 1.347 3.032.207.336.293.672.293.969 0 .418-.254.84-.8 1.261l-2.653 1.77c-.379.25-.758.379-1.093.379-.422 0-.844-.211-1.266-.59a13.28 13.28 0 0 1-1.516-1.98 34.153 34.153 0 0 1-1.304-2.485c-3.282 3.875-7.41 5.813-12.38 5.813-3.535 0-6.355-1.012-8.421-3.032-2.063-2.023-3.114-4.718-3.114-8.086 0-3.578 1.262-6.484 3.833-8.671 2.566-2.192 5.976-3.286 10.316-3.286 1.43 0 2.902.125 4.46.336 1.56.211 3.161.547 4.845.926v-3.074c0-3.2-.676-5.43-1.98-6.734C26.061 32.633 23.788 32 20.546 32c-1.473 0-2.988.168-4.547.547a33.416 33.416 0 0 0-4.547 1.433c-.676.293-1.18.461-1.473.547-.296.082-.507.125-.675.125-.59 0-.883-.422-.883-1.304v-2.063c0-.676.082-1.18.293-1.476.21-.293.59-.586 1.18-.883 1.472-.758 3.242-1.39 5.304-1.895 2.063-.547 4.254-.8 6.57-.8 5.008 0 8.672 1.136 11.032 3.41 2.316 2.273 3.492 5.726 3.492 10.359v13.64Zm-17.094 6.403c1.387 0 2.82-.254 4.336-.758 1.516-.508 2.863-1.433 4-2.695.672-.8 1.18-1.684 1.43-2.695.254-1.012.422-2.23.422-3.665v-1.765a34.401 34.401 0 0 0-3.871-.719 31.816 31.816 0 0 0-3.961-.25c-2.82 0-4.883.547-6.274 1.684-1.387 1.136-2.062 2.734-2.062 4.84 0 1.98.504 3.453 1.558 4.464 1.012 1.051 2.485 1.559 4.422 1.559Zm33.809 4.547c-.758 0-1.262-.125-1.598-.422-.34-.254-.633-.84-.887-1.64L40.715 29.98c-.25-.843-.38-1.39-.38-1.687 0-.672.337-1.05 1.013-1.05h4.125c.8 0 1.347.124 1.644.421.336.25.59.84.84 1.64l7.074 27.876 6.57-27.875c.208-.84.462-1.39.797-1.64.34-.255.93-.423 1.688-.423h3.367c.8 0 1.348.125 1.684.422.336.25.633.84.8 1.64l6.653 28.212 7.285-28.211c.25-.84.547-1.39.84-1.64.336-.255.887-.423 1.644-.423h3.914c.676 0 1.055.336 1.055 1.051 0 .21-.043.422-.086.676-.043.254-.125.59-.293 1.05L80.801 62.57c-.254.84-.547 1.387-.887 1.64-.336.255-.883.423-1.598.423h-3.62c-.801 0-1.348-.13-1.684-.422-.34-.297-.633-.844-.801-1.684l-6.527-27.16-6.485 27.117c-.21.844-.46 1.391-.8 1.684-.337.297-.926.422-1.684.422Zm54.105 1.137c-2.187 0-4.379-.254-6.484-.758-2.106-.504-3.746-1.055-4.84-1.684-.676-.379-1.137-.8-1.305-1.18a2.919 2.919 0 0 1-.254-1.18v-2.148c0-.882.336-1.304.97-1.304.25 0 .503.043.757.129.25.082.629.25 1.05.418a23.102 23.102 0 0 0 4.634 1.476c1.683.336 3.324.504 5.011.504 2.653 0 4.715-.465 6.145-1.39 1.433-.926 2.191-2.274 2.191-4 0-1.18-.379-2.145-1.136-2.946-.758-.8-2.192-1.516-4.254-2.191l-6.106-1.895c-3.074-.969-5.348-2.398-6.734-4.293-1.39-1.855-2.106-3.918-2.106-6.105 0-1.77.38-3.328 1.137-4.676a10.829 10.829 0 0 1 3.031-3.453c1.262-.965 2.696-1.684 4.38-2.188 1.683-.504 3.452-.715 5.304-.715.926 0 1.894.043 2.82.168.969.125 1.852.293 2.738.461.84.211 1.641.422 2.399.676.758.254 1.348.504 1.77.758.59.336 1.011.672 1.261 1.05.254.34.379.802.379 1.391v1.98c0 .884-.336 1.348-.969 1.348-.336 0-.883-.171-1.597-.507-2.403-1.094-5.098-1.641-8.086-1.641-2.399 0-4.293.379-5.598 1.18-1.309.797-1.98 2.02-1.98 3.746 0 1.18.421 2.191 1.261 2.988.844.8 2.403 1.602 4.633 2.316l5.98 1.895c3.032.969 5.22 2.316 6.524 4.043 1.305 1.727 1.938 3.707 1.938 5.895 0 1.812-.38 3.453-1.094 4.882-.758 1.434-1.77 2.696-3.074 3.707-1.305 1.051-2.864 1.809-4.672 2.36-1.895.586-3.875.883-6.024.883Zm0 0" />
    <path fill="#FF9900" d="M118 73.348c-4.432.063-9.664 1.052-13.621 3.832-1.223.883-1.012 2.062.336 1.894 4.508-.547 14.44-1.726 16.21.547 1.77 2.23-1.976 11.62-3.663 15.79-.504 1.26.59 1.769 1.726.8 7.41-6.231 9.348-19.242 7.832-21.137-.757-.925-4.388-1.79-8.82-1.726zM1.63 75.859c-.927.116-1.347 1.236-.368 2.121 16.508 14.902 38.359 23.872 62.613 23.872 17.305 0 37.43-5.43 51.281-15.66 2.273-1.688.297-4.254-2.02-3.204-15.534 6.57-32.421 9.77-47.788 9.77-22.778 0-44.8-6.273-62.653-16.633-.39-.231-.755-.304-1.064-.266z" />
  </svg>
);

// Official two-tone logos (from Devicon's SVGs). The Devicon font versions
// flatten Python to one blue and punch JS's letters out of the square, so
// they'd pick up the page background instead of staying black.
const PythonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 128 128" className="shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="python-logo-blue" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
        <stop offset="0" stopColor="#5A9FD4" />
        <stop offset="1" stopColor="#306998" />
      </linearGradient>
      <linearGradient id="python-logo-yellow" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
        <stop offset="0" stopColor="#FFD43B" />
        <stop offset="1" stopColor="#FFE873" />
      </linearGradient>
    </defs>
    <g transform="translate(0 -1)">
      <path fill="url(#python-logo-blue)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)" />
      <path fill="url(#python-logo-yellow)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)" />
    </g>
  </svg>
);

const JavaScriptIcon = () => (
  <svg width="14" height="14" viewBox="0 0 128 128" className="shrink-0" aria-hidden="true">
    <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z" />
    <path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.540 6.545 18.873 11.531 1.297 6.104-4.486 8.080-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.630 4.260 5.795 9.068 9.198 31.760 8.746 35.830-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.340-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.520 5.830c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.070-17.444.06-10.735.001-21.468.001-32.237z" />
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
      { name: "JavaScript", customIcon: <JavaScriptIcon /> },
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
      { name: "Python", customIcon: <PythonIcon /> },
      { name: "Node.js", iconClass: "devicon-nodejs-plain colored" },
      { name: "FastAPI", iconClass: "devicon-fastapi-plain colored" },
      { name: "Firebase & Firestore", iconClass: "devicon-firebase-plain colored" },
    ],
  },
  {
    category: "DEVOPS & TOOLS",
    tools: [
      { name: "Vercel", iconClass: "devicon-vercel-original" },
      { name: "Railway", iconClass: "devicon-railway-original" },
      { name: "AWS", customIcon: <AwsIcon /> },
      { name: "Git & GitHub", iconClass: "devicon-git-plain colored" },
    ],
  },
  {
    category: "AI & DESIGN",
    tools: [
      { name: "Gemini & LLM APIs", customIcon: <GeminiIcon /> },
      { name: "Claude AI", customIcon: <ClaudeIcon /> },
      { name: "OpenAI Codex", customIcon: <CodexIcon /> },
      { name: "Google Stitch", customIcon: <StitchIcon /> },
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
  logo?: 'upwork' | 'fiverr' | 'rakuten';
  /**
   * Path to a logo image for companies with no Simple Icons mark (most brands
   * outside tech). Takes precedence over `initials`; `logo` wins over both.
   */
  logoSrc?: string;
  /**
   * For opaque black-on-white artwork (a JPG with no alpha). Inverting gives
   * white-on-black, then `screen` drops the black to transparent — so the mark
   * reads white on the dark tile instead of sitting in a white box.
   */
  logoInvertOnDark?: boolean;
  /**
   * Box size in px for `logoSrc` (default 26). Artwork with baked-in padding
   * or a wide aspect renders small under object-contain, so it needs a larger
   * box to reach the same optical size as the others.
   */
  logoSize?: number;
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
    id: 'broadheader',
    initials: 'BH',
    logoSrc: '/img/broadheaderlogo.jpg',
    // Opaque black-on-white JPG — knocked out to white on the dark theme.
    logoInvertOnDark: true,
    company: 'Broadheader',
    location: 'Remote',
    employmentType: 'Full-time',
    role: 'Fullstack Engineer Lead',
    period: 'August 2026 — PRESENT · 2 MOS',
    description: 'Leading engineering across the stack — setting architecture direction, running code review, and taking products from API design through to interface polish. Mentoring the team and keeping delivery predictable as the codebase grows.',
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
    moreSkillsCount: 3,
  },
  {
    id: 'png',
    initials: 'P&G',
    logoSrc: '/img/pglogo.webp',
    // 600x300 artwork: a 44px box renders the sphere at ~22px, matching the others.
    logoSize: 44,
    company: 'P&G',
    location: 'BGC, Taguig',
    employmentType: 'Contract',
    role: 'Fullstack web developer',
    period: 'February 2026 — July 2026 · 6 MOS',
    description: 'Developed SaaS and ecommerce website for clients with ai integrations , custom api and more.',
    skills: ['React', 'Express', 'TypeScript', 'Shopify'],
    moreSkillsCount: 4,
  },
  {
    id: 'rcbc',
    initials: 'RCBC',
    logoSrc: '/img/rcbclogo.svg',
    company: 'RCBC',
    location: 'Makati, Metro Manila',
    employmentType: 'Full-time',
    role: 'Frontend Developer Intern',
    period: 'June 2025 — December 2025 · 6 MOS',
    description: 'Built reusable React components and responsive Tailwind layouts, wired them to internal REST endpoints, and helped migrate legacy pages into a typed, accessible component library alongside the design team.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
  },
  {
    id: 'rakuten',
    initials: 'RK',
    logo: 'rakuten',
    company: 'Rakuten',
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
  rakuten: { Icon: SiRakuten, color: '#BF0000', label: 'Rakuten', size: 24 },
} as const;

const ExperienceLogo = ({ exp, theme }: { exp: ExperienceEntry; theme: 'dark' | 'light' }) => {
  if (exp.logo) {
    const { Icon, color, label, size } = EXPERIENCE_LOGOS[exp.logo];
    return <Icon size={size} color={color} title={label} aria-label={label} />;
  }

  if (exp.logoSrc) {
    const knockOut = theme === 'dark' && exp.logoInvertOnDark;
    return (
      <img
        src={exp.logoSrc}
        alt={exp.company}
        // Contain, so a logo of any aspect ratio fits the 44px tile uncropped.
        className="object-contain"
        style={{
          width: exp.logoSize ?? 26,
          height: exp.logoSize ?? 26,
          ...(knockOut ? { filter: 'invert(1)', mixBlendMode: 'screen' as const } : {}),
        }}
      />
    );
  }

  // Falls back to initials — 4 characters still fit the tile at 12px mono.
  return <>{exp.initials}</>;
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

/**
 * Sun and moon stacked in a single grid cell so neither affects layout. Only
 * `data-state` changes on theme flip; all motion lives in CSS (.theme-icon),
 * which keeps rapid clicks interruptible instead of restarting a keyframe.
 * The glyphs are wrapped in spans because Phosphor's IconBase doesn't accept
 * arbitrary data-* props.
 */
const ThemeToggleIcon = ({ theme, size }: { theme: 'dark' | 'light'; size: number }) => (
  <span className="grid place-items-center" style={{ width: size, height: size }}>
    <span
      className="theme-icon theme-icon-sun"
      data-state={theme === 'dark' ? 'visible' : 'hidden'}
    >
      <Sun weight="light" size={size} />
    </span>
    <span
      className="theme-icon theme-icon-moon"
      data-state={theme === 'light' ? 'visible' : 'hidden'}
    >
      <Moon weight="light" size={size} />
    </span>
  </span>
);

/**
 * Route path -> section element id. Every route renders the same continuous
 * page and resolves to a scroll position; "work" is the one place where the
 * nav key and the DOM id disagree (`/work` -> `#projects`).
 */
const NAV_SECTION_IDS: Record<string, string> = {
  about: 'about',
  experience: 'experience',
  stack: 'stack',
  certifications: 'certifications',
  work: 'projects',
  services: 'services',
  resources: 'resources',
  contact: 'contact',
};

/** Sticky header height to clear below lg, where the header overlays content. */
const scrollOffsetForViewport = () =>
  window.matchMedia('(min-width: 1024px)').matches ? 0 : 56;

/**
 * Scrolls to a section, retrying across frames until the element has a stable
 * position. On a cold load the sections exist immediately but fonts and images
 * are still settling, so a single early call lands at the wrong offset.
 */
function scrollToSection(sectionId: string, behavior: ScrollBehavior) {
  let frames = 0;
  const attempt = () => {
    const el = document.getElementById(sectionId);
    if (!el) {
      // Give up rather than loop forever on an unknown id.
      if (frames++ < 30) requestAnimationFrame(attempt);
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffsetForViewport();
    window.scrollTo({ top, behavior });
    // Re-measure once more after layout settles on first paint.
    if (frames++ < 2) requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}

type ToggleTheme = (event?: React.MouseEvent<HTMLButtonElement>) => void;

/**
 * Two-way dark/light switch. The thumb only reflects `theme`; every change goes
 * through `toggleTheme`, so the view-transition reveal and persistence behave
 * exactly as they do for the other theme toggles.
 */
const ThemePill = ({ theme, toggleTheme }: { theme: 'dark' | 'light'; toggleTheme: ToggleTheme }) => {
  const optionRefs = React.useRef<Record<'dark' | 'light', HTMLButtonElement | null>>({ dark: null, light: null });
  const options = [
    { value: 'dark' as const, label: 'Dark', icon: <Moon weight="light" size={12} /> },
    { value: 'light' as const, label: 'Light', icon: <Sun weight="light" size={12} /> },
  ];

  // Radio-group keyboard pattern: arrows move the selection, and focus follows it.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    optionRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      data-theme={theme}
      onKeyDown={handleKeyDown}
      className="theme-pill font-geist"
    >
      <span aria-hidden="true" className="theme-pill-thumb" />
      {options.map((option) => {
        const checked = theme === option.value;
        return (
          <button
            key={option.value}
            ref={(el) => { optionRefs.current[option.value] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={(event) => { if (!checked) toggleTheme(event); }}
            className="theme-pill-option"
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  toggleTheme: ToggleTheme;
  links: { id: string; name: string }[];
  activeSection: string;
  onNavigate: (id: string) => void;
  onBookCall?: () => void;
  soundMuted: boolean;
  toggleSound: () => boolean;
  /** The hamburger; focus goes back to it when the menu closes. */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Full-screen index-style menu for <768px. */
const MobileMenu = ({
  open,
  onClose,
  theme,
  toggleTheme,
  links,
  activeSection,
  onNavigate,
  onBookCall,
  soundMuted,
  toggleSound,
  returnFocusRef,
}: MobileMenuProps) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Scroll lock, Escape, focus trap, and focus return, all scoped to `open`.
  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable: HTMLElement[] = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // preventScroll so a nav tap's smooth scroll isn't yanked back to the header.
      returnTo?.focus({ preventScroll: true });
    };
  }, [open, onClose, returnFocusRef]);

  const listVariants = {
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.03, delayChildren: reduceMotion ? 0 : 0.05 } },
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="mobile-menu md:hidden"
        >
          <div className="mobile-menu-header">
            <span className="mobile-menu-name font-sans">Kellas Andrei</span>
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
                className="mobile-menu-icon-btn"
              >
                <ThemeToggleIcon theme={theme} size={16} />
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                title="Close menu"
                className="mobile-menu-icon-btn"
              >
                <X weight="light" size={18} />
              </button>
            </div>
          </div>

          <motion.ul
            className="mobile-menu-list"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {links.map((link) => {
              const active = activeSection === link.id;
              return (
                <motion.li key={link.id} variants={itemVariants}>
                  <NavLink
                    to={`/${link.id}`}
                    onClick={() => onNavigate(link.id)}
                    aria-current={active ? 'true' : undefined}
                    className="mobile-menu-item font-geist"
                  >
                    <span aria-hidden="true" className="mobile-menu-arrow">
                      <ArrowRight weight="light" size={14} />
                    </span>
                    <span>{link.name}</span>
                  </NavLink>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className="mobile-menu-footer font-geist">
            <div className="flex items-center gap-2">
              {onBookCall && (
                <button
                  type="button"
                  onClick={() => { playExternalLink(); onClose(); onBookCall(); }}
                  className="mobile-menu-book"
                >
                  <Calendar weight="light" size={16} />
                  <span>Book Call</span>
                </button>
              )}
              {/* Stays open on toggle so the state change is visible */}
              <button
                type="button"
                onClick={() => {
                  const nowMuted = toggleSound();
                  if (!nowMuted) playNavTick();
                }}
                aria-pressed={!soundMuted}
                aria-label={soundMuted ? 'Sound Off' : 'Sound On'}
                title={soundMuted ? 'Sound Off' : 'Sound On'}
                className="mobile-menu-sound"
              >
                {soundMuted
                  ? <SpeakerSlash weight="light" size={16} />
                  : <SpeakerHigh weight="light" size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <a href="mailto:kellasandrei00@gmail.com" onClick={playExternalLink} className="mobile-menu-email">
                kellasandrei00@gmail.com
              </a>
              <span className="mobile-menu-status">
                <span aria-hidden="true" className="mobile-menu-status-dot" />
                available
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SidebarNavigationProps {
  theme: 'dark' | 'light';
  toggleTheme: ToggleTheme;
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
  const location = useLocation();
  const navigate = useNavigate();
  // A deep link should land instantly; later navigations animate.
  const isFirstRouteRef = React.useRef(true);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  // Stable so the menu's lock/trap effect doesn't re-run on every render.
  const closeMenu = React.useCallback(() => setIsOpen(false), []);
  const handleMobileNavigate = (id: string) => {
    playNavTick();
    setIsOpen(false);
    // Tapping the section you're already on doesn't change the route, so the
    // URL -> scroll effect never fires; scroll directly instead.
    if (location.pathname === `/${id}`) scrollToSection(NAV_SECTION_IDS[id], 'smooth');
  };

  const group1Links = [
    { id: 'about', name: 'About', href: '#about', icon: <NavUser strokeWidth={1.25} size={16} /> },
    { id: 'experience', name: 'Experience', href: '#experience', icon: <NavLayers strokeWidth={1.25} size={16} /> },
    { id: 'stack', name: 'Stack', href: '#stack', icon: <NavCpu strokeWidth={1.25} size={16} /> },
    { id: 'certifications', name: 'Certifications', href: '#certifications', icon: <NavCheck strokeWidth={1.25} size={16} /> },
  ];

  const group2Links = [
    { id: 'work', name: 'Work', href: '#projects', icon: <NavBriefcase strokeWidth={1.25} size={16} /> },
    { id: 'services', name: 'Services', href: '#services', icon: <NavWrench strokeWidth={1.25} size={16} /> },
    { id: 'resources', name: 'Resources', href: '#resources', icon: <NavLibrary strokeWidth={1.25} size={16} /> },
    { id: 'contact', name: 'Contact', href: '#contact', icon: <NavMail strokeWidth={1.25} size={16} /> },
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

  // --- Routing <-> scroll, kept in sync in both directions ---
  //
  // Marks a URL change that the scroll spy wrote, so the route effect below
  // doesn't treat it as a navigation request and scroll-jack the user.
  const urlFromScrollRef = React.useRef(false);
  // Last section the spy published. Comparing against this is what makes the
  // spy effect fire on SCROLL changes only — depending on location.pathname
  // made it fire on clicks too, where it would navigate straight back to the
  // section you were leaving and cancel the scroll.
  const lastSyncedSectionRef = React.useRef(activeSection);
  // A click starts a smooth scroll that sweeps past intermediate sections. Muting
  // the spy for that window stops the URL churning through every section on the way.
  const muteSpyUntilRef = React.useRef(0);

  // URL -> scroll: clicks, deep links, back/forward. Declared first so a deep
  // link is handled on mount before anything else can overwrite it.
  useEffect(() => {
    if (urlFromScrollRef.current) {
      urlFromScrollRef.current = false;
      return;
    }
    const sectionId = NAV_SECTION_IDS[location.pathname.replace(/^\//, '')];
    const isFirst = isFirstRouteRef.current;
    isFirstRouteRef.current = false;
    if (!sectionId) return;

    muteSpyUntilRef.current = Date.now() + 1200;
    // Instant on first paint so a deep link doesn't animate down from the top.
    scrollToSection(sectionId, isFirst ? 'auto' : 'smooth');
  }, [location.pathname]);

  // Scroll spy -> URL. Depends on activeSection ONLY. `replace` so scrolling
  // never floods the back button.
  useEffect(() => {
    if (lastSyncedSectionRef.current === activeSection) return; // also skips mount
    lastSyncedSectionRef.current = activeSection;
    if (Date.now() < muteSpyUntilRef.current) return;

    const path = `/${activeSection}`;
    // Read live rather than from the closure, which may be a render behind.
    if (window.location.pathname === path) return;
    urlFromScrollRef.current = true;
    navigate(path, { replace: true });
  }, [activeSection, navigate]);

  // Play a transition only on a genuine change. The ref seeds with the initial
  // section so nothing sounds on first paint.
  const previousSection = React.useRef(activeSection);
  useEffect(() => {
    if (previousSection.current === activeSection) return;
    previousSection.current = activeSection;
    playTransition();
  }, [activeSection]);

  const renderDesktopNavLink = (link: { id: string; name: string; href: string; icon: React.ReactNode }) => (
    <NavLink
      key={link.id}
      to={`/${link.id}`}
      onClick={playNavTick}
      // Router match drives the active state. `/` has no match, so About takes
      // it — that's where the page opens.
      className={({ isActive }) => {
        const active = isActive || (location.pathname === '/' && link.id === 'about');
        return `py-2 px-0 flex items-center gap-[9px] text-[12.5px] font-geist tracking-[0.5px] transition-colors duration-150 w-full group cursor-pointer ${active
          ? theme === 'light'
            ? 'text-[#1a1a1a]'
            : 'text-[#e0e0e0]'
          : theme === 'light'
            ? 'text-[#8a8a85] hover:text-[#1a1a1a]'
            : 'text-[#444444] hover:text-[#c9c9c4]'
          }`;
      }}
    >
      {({ isActive }) => {
        const active = isActive || (location.pathname === '/' && link.id === 'about');
        return (
          <>
            <span
              aria-hidden="true"
              className={`nav-arrow shrink-0 leading-none transition-colors duration-150 ${active
                ? theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e0e0e0]'
                : 'text-transparent'
                }`}
            >
              ›
            </span>
            <span className="nav-icon shrink-0 transition-colors duration-150">
              {link.icon}
            </span>
            <span className="truncate">{link.name}</span>
          </>
        );
      }}
    </NavLink>
  );

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
            <span className={`px-0 mt-6 pb-1 text-[10px] font-geist uppercase tracking-[1.5px] select-none ${theme === 'light' ? 'text-[#c4c4c0]' : 'text-[#2a2a2a]'
              }`}>
              ENGAGE
            </span>
            {group2Links.map(renderDesktopNavLink)}
          </div>
        </nav>

        {/* Bottom Area: borderless icon row + divider + theme pill */}
        <div className={`sidebar-footer mt-auto space-y-3 pt-3 border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
          }`}>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kellasandyyyy1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
              aria-label="GitHub"
              title="GitHub"
              className="sidebar-icon-btn cursor-pointer"
            >
              <GithubLogo weight="light" size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playExternalLink}
              aria-label="LinkedIn"
              title="LinkedIn"
              className="sidebar-icon-btn cursor-pointer"
            >
              <LinkedinLogo weight="light" size={16} />
            </a>
            <a
              href="mailto:kellasandrei00@gmail.com"
              onClick={playExternalLink}
              aria-label="Email"
              title="Email"
              className="sidebar-icon-btn cursor-pointer"
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
              // Pressed means sound is on, so the static label reads correctly.
              aria-pressed={!soundMuted}
              aria-label="Toggle sound"
              title={soundMuted ? 'Sound off' : 'Sound on'}
              className="sidebar-icon-btn cursor-pointer"
            >
              {soundMuted
                ? <SpeakerSlash weight="light" size={16} />
                : <SpeakerHigh weight="light" size={16} />}
            </button>
          </div>

          <div className={`pt-3 border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1c1c1c]'}`}>
            <ThemePill theme={theme} toggleTheme={toggleTheme} />
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
            <NavLink
              key={link.id}
              to={`/${link.id}`}
              onClick={playNavTick}
              className={({ isActive }) => {
                const active = isActive || (location.pathname === '/' && link.id === 'about');
                return `text-xs font-geist uppercase tracking-[0.5px] transition-colors ${active
                  ? (theme === 'light' ? 'text-[#1a1a1a] font-medium' : 'text-white font-medium')
                  : (theme === 'light' ? 'text-[#5a5a5a] hover:text-[#1a1a1a]' : 'text-[#8a8a8a] hover:text-white')
                  }`;
              }}
            >
              {link.name}
            </NavLink>
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
            <ThemeToggleIcon theme={theme} size={16} />
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
            <ThemeToggleIcon theme={theme} size={16} />
          </button>

          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(true)}
            className={`p-2 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer ${theme === 'light' ? 'text-[#1a1a1a] hover:text-black' : 'text-white hover:text-zinc-300'
              }`}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <List weight="light" size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay (<768px) */}
      <MobileMenu
        open={isOpen}
        onClose={closeMenu}
        theme={theme}
        toggleTheme={toggleTheme}
        links={navLinks}
        activeSection={activeSection}
        onNavigate={handleMobileNavigate}
        onBookCall={onBookCall}
        soundMuted={soundMuted}
        toggleSound={toggleSound}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
};

const SectionHeading = ({
  children,
  className = "mb-10",
  theme,
  isInView,
  baseDelay = 0
}: {
  children: React.ReactNode;
  className?: string;
  theme?: 'dark' | 'light';
  isInView?: boolean;
  baseDelay?: number;
}) => {
  const textVal = typeof children === 'string' ? children.toLowerCase() : children;
  const animClass = isInView !== undefined ? `scroll-animate-child ${isInView ? 'animated' : ''}` : '';
  return (
    <div className={className}>
      <h2
        className={`text-[26px] sm:text-[32px] font-geist font-medium leading-none tracking-normal lowercase ${animClass} ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
          }`}
        style={isInView !== undefined ? { animationDelay: `${baseDelay}ms` } : undefined}
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
      className={`group/card h-full flex flex-col rounded-[12px] p-4 md:p-5 transition-[box-shadow,background-color] duration-200 ${isLight
        ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.13)]'
        : 'bg-[#0e0e12] shadow-[0_2px_10px_rgba(0,0,0,0.55)] hover:bg-[#131318] hover:shadow-[0_10px_28px_rgba(0,0,0,0.75)]'
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

type WorksView = 'grid' | 'list';
const WORKS_VIEW_KEY = 'works-view-mode';

/**
 * Grid/list switch for the mobile works section. Desktop (md+) already renders
 * a grid unconditionally, so 'grid' is the default here to match it.
 */
const WorksViewToggle: React.FC<{
  view: WorksView;
  onChange: (next: WorksView) => void;
  theme: 'dark' | 'light';
  className?: string;
}> = ({ view, onChange, theme, className = '' }) => {
  const isLight = theme === 'light';

  const button = (mode: WorksView, label: string, icon: React.ReactNode) => {
    const active = view === mode;
    return (
      <button
        type="button"
        onClick={() => onChange(mode)}
        aria-label={label}
        aria-pressed={active}
        className={`w-[26px] h-[26px] md:w-[32px] md:h-[32px] rounded-[5px] md:rounded-[6px] flex items-center justify-center transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 ${active
          ? isLight
            ? 'bg-[#1a1a1a] text-[#fafafa]'
            : 'bg-[#f2f2ef] text-[#0b0b0d]'
          : isLight
            // Raised from the near-invisible original so the inactive state
            // reads clearly against pure black / pure white.
            ? 'bg-transparent text-[#8a8a8a] hover:text-[#1a1a1a]'
            : 'bg-transparent text-[#8a8a86] hover:text-[#e5e5e5]'
          } ${isLight ? 'focus-visible:ring-[#1a1a1a]' : 'focus-visible:ring-[#c9c9c4]'}`}
      >
        {icon}
      </button>
    );
  };

  // Tailwind sizing overrides the icon's width/height attributes, which is how
  // one <LayoutGrid size={16}/> serves both breakpoints.
  const iconClass = 'w-[13px] h-[13px] md:w-4 md:h-4';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Desktop-only affordance — unlabelled icon pairs are easy to miss,
          which is exactly how this control went unnoticed. */}
      <span className={`hidden md:inline text-[10px] font-mono lowercase tracking-[0.06em] ${isLight ? 'text-[#8a8a8a]' : 'text-[#666666]'
        }`}>
        view:
      </span>

      <span
        className={`inline-flex items-center gap-[2px] p-[3px] md:p-[4px] rounded-[8px] md:rounded-[9px] border-[0.5px] ${isLight ? 'border-[#e6e6e3]' : 'border-[#232320]'
          }`}
      >
        {button('grid', 'Grid view', <LayoutGrid weight="light" size={16} className={iconClass} />)}
        {button('list', 'List view', <List weight="light" size={16} className={iconClass} />)}
      </span>
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
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          // ease-out, no spring — the rest of the site never overshoots.
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={`w-full max-h-[85vh] max-w-4xl flex flex-col rounded-[10px] overflow-hidden border-[0.5px] ${theme === 'light'
            ? 'bg-[#fafafa] border-[#e6e6e3] text-[#1a1a1a]'
            : 'bg-[#0b0b0d] border-[#232320] text-[#e5e5e5]'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* One header for every width, built like the site's section headers:
              muted mono eyebrow over a lowercase mono heading. */}
          <div className={`px-4 md:px-6 py-3 md:py-4 flex items-start justify-between gap-3 shrink-0 border-b-[0.5px] ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="min-w-0">
              <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                projects
              </span>
              <h3 className={`text-[18px] md:text-[22px] font-geist font-normal leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                }`}>
                all projects
              </h3>
            </div>

            {/* Matches the sidebar's 32px icon-button language. */}
            <button
              onClick={onClose}
              aria-label="Close"
              className={`w-[32px] h-[32px] rounded-[8px] border-[0.5px] flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer ${theme === 'light'
                ? 'border-[#e0e0e0] text-[#8a8a85] hover:text-[#1a1a1a] hover:border-[#a0a0a0]'
                : 'border-[#262626] text-[#8a8a85] hover:text-[#c9c9c4] hover:border-[#3a3a3a]'
                }`}
            >
              <X weight="light" size={14} />
            </button>
          </div>

          {/* Mobile (<md): compact numbered rows */}
          <div className="md:hidden px-4 overflow-y-auto flex-1 min-h-0 pb-4">
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
                  <span className={`w-[18px] shrink-0 text-[9px] font-mono ${theme === 'light' ? 'text-[#c4c4c0]' : 'text-[#333333]'
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
                    : 'border-[#1e1e1e] text-[#5a5a57]'
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
              </div>
            ))}
          </div>

          {/* Desktop (md+): same card as the works section grid — hairline
              border, 16:10 thumbnail, mono title, lowercase tag. No fills,
              no shadows, no hover scale. */}
          <div className="hidden md:block px-6 py-5 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-3 gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project);
                    onClose();
                  }}
                  className={`cursor-pointer group rounded-[10px] overflow-hidden min-w-0 transition-[box-shadow,background-color] duration-200 ${theme === 'light'
                    ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.13)]'
                    : 'bg-[#0e0e12] shadow-[0_2px_10px_rgba(0,0,0,0.55)] hover:bg-[#131318] hover:shadow-[0_10px_28px_rgba(0,0,0,0.75)]'
                    }`}
                >
                  <div className={`aspect-[16/10] w-full overflow-hidden flex items-center justify-center ${theme === 'light' ? 'bg-[#f0f0f0]' : 'bg-[#141414]'
                    }`}>
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      // Flat block, not a gradient — matches the works grid.
                      <div className={`w-1/2 h-1/2 rounded-[4px] ${theme === 'light' ? 'bg-[#e8e8e8]' : 'bg-[#1c1c1c]'
                        }`} />
                    )}
                  </div>

                  <div className="px-[9px] py-[8px] flex flex-col gap-1.5 min-w-0">
                    <div className={`text-[11px] font-mono truncate ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#e5e5e5]'
                      }`}>
                      {project.title}
                    </div>
                    <span className={`self-start inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] max-w-full truncate ${theme === 'light'
                      ? 'border-[#ececec] text-[#a0a0a0]'
                      : 'border-[#1e1e1e] text-[#5a5a57]'
                      }`}>
                      {project.tags?.[0]?.toLowerCase() || 'web'}
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

  // The mascot follows direct interaction with the log (hover, focus, click),
  // not scroll position, so the default "plan" step holds until someone engages.
  const activate = () => onActivate(index);

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
    <div
      ref={ref}
      tabIndex={0}
      onMouseEnter={activate}
      onFocus={activate}
      onClick={activate}
      className={`relative flex cursor-pointer rounded-sm outline-none focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-4 ${isLight ? 'focus-visible:outline-[#a0a0a0]' : 'focus-visible:outline-[#44444a]'} ${isLast ? '' : 'pb-[1.125rem] md:pb-[1.375rem]'}`}
    >
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
  // Opens on "plan"; log interaction moves it from there.
  const [activeIndex, setActiveIndex] = useState(1);
  // Bumped on every log interaction so the mascot counts it as activity
  // (resets its sleep timer / wakes it), even when the step doesn't change.
  const [logActivity, setLogActivity] = useState(0);

  const handleActivate = React.useCallback((index: number) => {
    setActiveIndex(index);
    setLogActivity((n) => n + 1);
  }, []);

  return (
    // Left-anchored and capped, so leftover page width can't open a dead zone
    // between the log and the mascot. The 64px gap is measured from the log's
    // real content edge now that the log column hugs its content.
    <div className="flex flex-col md:flex-row md:gap-24 md:items-start md:max-w-[860px]">
      {/* Mascot: above the log on mobile, beside it on desktop. Not sticky —
          self-center parks it at the vertical midpoint of the log and it simply
          scrolls with the page rather than tracking the viewport. */}
      <div className="w-full max-w-[240px] mx-auto mb-7 md:mb-0 md:order-2 md:flex-none md:mr-0 md:ml-auto md:w-[300px] md:max-w-[320px] md:self-center flex flex-col items-center">
        <VisorOrbMascot
          step={activeIndex}
          accent={mascotAccent(activeIndex)}
          activity={logActivity}
          theme={theme}
        />
      </div>

      {/* Git log — structure unchanged. md:w-auto is load-bearing: w-full would
          stretch this column across the whole row and push the mascot to the
          far edge, reopening the dead zone the gap-16 is meant to control. */}
      <div
        className="w-full md:w-auto min-w-0 md:order-1 md:flex-initial select-none [--seg:1rem] [--dot:0.875rem] [--rail:1.25rem] md:[--seg:1.375rem] md:[--dot:1.0625rem] md:[--rail:1.75rem]"
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

/**
 * Layer stack, bottom to top — the order mirrors the real dependency chain:
 * backend underpins everything, UI sits above it, frontend renders on top.
 * Colours are the section's existing stage colours so the left-column dots and
 * the layer borders stay in step.
 */
const ISO_LAYERS = [
  { id: 'api', label: 'api / backend', color: '#2dd4bf', zRest: 0, zOut: 0, zStatic: 0, delay: 0 },
  { id: 'ui', label: 'ui / interaction', color: '#f472b6', zRest: 12, zOut: 54, zStatic: 24, delay: 100 },
  { id: 'frontend', label: 'frontend', color: '#60a5fa', zRest: 24, zOut: 108, zStatic: 48, delay: 200 },
];

/** Left-column reading order, which is not the stack order. */
const STAGE_LIST_ORDER = ['frontend', 'api', 'ui'] as const;

/** Stage colour at an arbitrary alpha. currentColor can't carry one, and the
 *  hologram shading needs the same hue at several strengths. */
const stageRgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const IsoLayerStack: React.FC<{ reduced: boolean; play: boolean }> = ({ reduced, play }) => {
  // Bumping this remounts the stack, which is what restarts the CSS animation.
  const [playToken, setPlayToken] = useState(0);

  useEffect(() => {
    if (play && !reduced) setPlayToken((n) => n + 1);
  }, [play, reduced]);

  return (
    // Decorative: every stage name and its order is real text in the left column.
    <div
      className="iso-stage"
      aria-hidden="true"
      onMouseEnter={() => {
        if (!reduced) setPlayToken((n) => n + 1);
      }}
    >
      <div
        key={playToken}
        className={`iso-stack ${playToken > 0 && !reduced ? 'is-playing' : ''}`}
      >
        {ISO_LAYERS.map((layer, i) => (
          <div
            key={layer.id}
            className="iso-layer"
            style={{
              color: layer.color,
              '--c-lit': stageRgba(layer.color, 0.26),
              '--c-mid': stageRgba(layer.color, 0.1),
              '--c-edge': stageRgba(layer.color, 0.72),
              '--c-seam': stageRgba(layer.color, 0.42),
              '--c-glow': stageRgba(layer.color, 0.55),
              zIndex: i,
              '--z-rest': `${layer.zRest}px`,
              '--z-out': `${layer.zOut}px`,
              '--z-static': `${layer.zStatic}px`,
              '--delay': `${layer.delay}ms`,
            } as React.CSSProperties}
          >
            <span className="iso-label font-mono">{layer.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ApproachSection: React.FC<{ theme: 'dark' | 'light'; isInView: boolean }> = ({
  theme,
  isInView,
}) => {
  const { ref, revealed, reduced } = useRevealOnce();
  const isLight = theme === 'light';
  const animClass = `scroll-animate-child ${isInView ? 'animated' : ''}`;

  const stages = STAGE_LIST_ORDER.map(
    (id) => APPROACH_STAGES.find((s) => s.id === id)!
  );

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
      {/* Left column — the accessible source of truth for stages and order. */}
      <div className="min-w-0">
        <SectionHeading theme={theme} isInView={isInView} baseDelay={0}>
          my approach
        </SectionHeading>

        <p
          className={`text-[14px] md:text-[15px] font-sans leading-[1.6] max-w-[480px] mb-8 ${animClass} ${isLight ? 'text-[#5a5a5a]' : 'text-[#888888]'
            }`}
          style={{ animationDelay: '160ms' }}
        >
          I build products end to end, from API design to pixel-level UI polish, with a bias toward clean, maintainable code.
        </p>

        <ul className="space-y-3.5 md:space-y-4">
          {stages.map((stage, i) => (
            <li
              key={stage.id}
              className={`flex items-start gap-3 ${animClass}`}
              style={{ animationDelay: `${240 + i * 60}ms` }}
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-[7px] h-[7px] rounded-full mt-[6px] md:mt-[7px]"
                style={{ backgroundColor: stage.color }}
              />
              <div className="min-w-0">
                <h3 className={`text-[14px] md:text-[15px] font-sans font-semibold tracking-tight ${isLight ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                  }`}>
                  {stage.detailLabel}
                </h3>
                <p className={`text-[12px] md:text-[13px] font-sans leading-relaxed mt-0.5 max-w-[420px] break-words ${isLight ? 'text-[#5a5a5a]' : 'text-[#888888]'
                  }`}>
                  {stage.detailDesc}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p
          className={`text-[10px] md:text-[10.5px] font-mono tracking-[0.04em] mt-7 ${animClass} ${isLight ? 'text-[#a0a0a0]' : 'text-[#666666]'
            }`}
          style={{ animationDelay: '440ms' }}
        >
          design → build → ship, in that order
        </p>
      </div>

      {/* Right column — stack sits beside the text on desktop, below and centred on mobile. */}
      <div className="flex justify-center md:justify-end">
        <IsoLayerStack reduced={reduced} play={revealed} />
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
  { min: 0, r: 1, fill: 'var(--gh-0)' },
  { min: 1, r: 1.4, fill: 'var(--gh-1)' },
  { min: 3, r: 2, fill: 'var(--gh-2)' },
  { min: 6, r: 2.6, fill: 'var(--gh-3)' },
  { min: 10, r: 3.4, fill: 'var(--gh-4)' },
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
                  fill={bucket.fill}
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

  // Mirrors desktop, which is grid-only, unless the visitor chose otherwise.
  const [worksView, setWorksViewState] = useState<WorksView>(() => {
    try {
      return localStorage.getItem(WORKS_VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });

  const setWorksView = (next: WorksView) => {
    setWorksViewState(next);
    try {
      localStorage.setItem(WORKS_VIEW_KEY, next);
    } catch {
      // Storage blocked — choice still applies for this session.
    }
  };
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

  const blogLocation = useLocation();
  const getAnimClass = (inView: boolean) => `scroll-animate-child ${inView ? 'animated' : ''}`;

  /** Writes the theme to the DOM and storage. Must be synchronous so it can run
   *  inside a view transition's update callback. */
  const applyTheme = (next: 'dark' | 'light') => {
    const root = document.documentElement;
    root.setAttribute('data-mode', next);
    root.classList.toggle('light-mode', next === 'light');
    document.body.classList.toggle('light-mode', next === 'light');
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage blocked (private mode) — theme still applies for this session.
    }
  };

  const toggleTheme = (event?: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === 'dark' ? 'light' : 'dark';

    // flushSync forces React to commit the 195 className ternaries *inside* the
    // callback. Without it React would still be batching when the browser takes
    // its "after" snapshot, and the transition would capture the old colours.
    const commit = () => {
      flushSync(() => setTheme(next));
      applyTheme(next);
    };

    const startViewTransition = (
      document as Document & { startViewTransition?: (cb: () => void) => unknown }
    ).startViewTransition;

    // Firefox and older browsers have no View Transitions — instant swap is the
    // intended graceful degradation, not a bug.
    if (!startViewTransition || prefersReducedMotion()) {
      commit();
      return;
    }

    // Origin for the circular reveal: the toggle that was actually clicked.
    // Falls back to viewport centre for keyboard activation, where the event
    // reports 0,0. The radius is the distance to the furthest corner.
    const root = document.documentElement;
    const x = event?.clientX || window.innerWidth / 2;
    const y = event?.clientY || window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${radius}px`);

    // No debounce needed: calling this again mid-transition makes the browser
    // skip the in-flight one cleanly rather than stacking animations.
    startViewTransition.call(document, commit);
  };

  // Keeps the DOM in step on mount and on any theme change that didn't come
  // from the toggle. Idempotent, so re-running after applyTheme is a no-op.
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // /blog is a standalone route: its own shell, no sidebar nav, and therefore
  // none of the scroll-spy <-> URL syncing that drives the portfolio page.
  if (blogLocation.pathname.startsWith('/blog')) {
    return <BlogPage theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`min-h-screen font-sans text-[15px] selection:bg-zinc-800 selection:text-white lg:flex relative ${theme === 'light'
      ? 'bg-[#fafafa] text-[#5a5a5a] selection:bg-zinc-200 selection:text-black'
      : 'bg-[#0b0b0d] text-[#a1a1aa] selection:bg-zinc-800 selection:text-white'
      }`}>
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

                {/* Blog lives on its own route and is intentionally absent from the nav. */}
                <Link
                  to="/blog"
                  onClick={playNavTick}
                  className={`mt-5 inline-flex items-center gap-2 rounded-[8px] border-[0.5px] px-3.5 py-2 text-[12px] font-geist transition-colors duration-150 cursor-pointer group hero-animate ${theme === 'light'
                    ? 'border-[#e0e0e0] text-[#1a1a1a] hover:border-[#a0a0a0]'
                    : 'border-[#262626] text-[#e5e5e5] hover:border-[#3d3d38]'
                    }`}
                  style={{ animationDelay: '400ms' }}
                >
                  <span>see my blogs</span>
                  <ArrowRight
                    weight="light"
                    size={14}
                    className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </Link>
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
                  <div className={`text-[19px] sm:text-[20px] font-geist leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>1+ YRS</div>
                  <div className={`text-[10px] font-sans uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>SHIPPING</div>
                </div>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '530ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-geist leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>15+</div>
                  <div className={`text-[10px] font-sans uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>PROJECTS BUILT</div>
                </div>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '580ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-geist leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>12+</div>
                  <div className={`text-[10px] font-sans uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>technologies</div>
                </div>
                <div
                  className={`px-[18px] py-[16px] flex flex-col justify-center hero-animate ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'
                    }`}
                  style={{ animationDelay: '630ms' }}
                >
                  <div className={`text-[19px] sm:text-[20px] font-geist leading-tight ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}>Manila, PH</div>
                  <div className={`text-[10px] font-sans uppercase tracking-[1px] mt-1 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#777777]'
                    }`}>LOCATION</div>
                </div>
              </div>
            </div>
          </section>

          {/* --- 01 / Overview Section --- */}
          <section id="about" ref={aboutRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 md:pt-16 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <ApproachSection theme={theme} isInView={aboutInView} />
          </section>

          {/* --- 02 / Experience Section --- */}
          <section id="experience" ref={expRef as React.RefObject<HTMLDivElement>} className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-10">
              <SectionHeading className="mb-2" theme={theme} isInView={expInView} baseDelay={0}>Experience</SectionHeading>
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
                        <ExperienceLogo exp={exp} theme={theme} />
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
              <SectionHeading className="mb-2" theme={theme} isInView={stackInView} baseDelay={0}>My Tech Stack</SectionHeading>
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
            <div className="flex items-start justify-between gap-8">
              <div className="min-w-0">
                <h2
                  className={`text-[26px] font-geist font-medium leading-none tracking-normal lowercase ${getAnimClass(certInView)} ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                    }`}
                  style={{ animationDelay: '80ms' }}
                >
                  certifications
                </h2>
                <p
                  className={`text-[13px] font-sans mt-2.5 max-w-xl leading-relaxed ${getAnimClass(certInView)} ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#7a7a80]'
                    }`}
                  style={{ animationDelay: '160ms' }}
                >
                  verified industry certifications and technical credentials issued by official platforms.
                </p>
              </div>
            </div>

            {/* No outer border, no card fills: only the dividers between columns. */}
            <div className="grid grid-cols-1 md:grid-cols-3 mt-14 md:mt-20">
              {CERTIFICATIONS.map((cert, index) => (
                <a
                  key={cert.id}
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playExternalLink}
                  aria-label={`${cert.title}, issued by ${cert.issuer}`}
                  className={`group relative isolate overflow-hidden flex flex-col items-center text-center px-6 py-10 md:py-4 ${getAnimClass(certInView)} ${
                    // Divider between columns only: never on the outside, never when stacked.
                    index > 0
                      ? `md:border-l ${theme === 'light' ? 'md:border-[#ececec]' : 'md:border-[#232326]'}`
                      : ''
                    }`}
                  style={{ animationDelay: `${240 + index * 80}ms` }}
                >
                  {/* Brand watermark. Decorative, sits behind the cell's own
                      content and is clipped so it never crosses a divider. */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 -z-10 flex items-center justify-center ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                      }`}
                    style={{ opacity: theme === 'light' ? 0.04 : 0.06 }}
                  >
                    <cert.Icon size={190} />
                  </span>

                  <span
                    className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 border-[0.5px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${theme === 'light'
                      ? 'border-[#e6e6e3] text-[#1a1a1a]'
                      : 'border-[#232326] text-[#e5e5e5]'
                      }`}
                  >
                    <cert.Icon size={17} />
                  </span>

                  <h3 className={`text-[14px] md:text-[15px] font-sans font-medium tracking-tight mt-5 ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                    }`}>
                    {cert.title}
                  </h3>

                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono lowercase tracking-[0.06em] mt-2 transition-colors duration-200 ease-out ${theme === 'light'
                    ? 'text-[#8a8a8a] group-hover:text-[#1a1a1a]'
                    : 'text-[#7a7a80] group-hover:text-[#e5e5e5]'
                    }`}>
                    {cert.issuer}
                    <ArrowUpRight weight="light" size={11} className="shrink-0" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* --- How I Think Section --- */}
          <section id="process" className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="mb-8">
              <h2 className={`text-[26px] font-geist font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
                }`}>
                how i think
              </h2>
            </div>
            <HowIThinkSection theme={theme} />
          </section>

          {/* --- Projects Section --- */}
          <section id="projects" className={`py-12 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t select-none overflow-hidden ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div className="min-w-0">
                {/* The toggle sits on the heading's own line so it reads as
                    belonging to "my works". It is deliberately NOT grouped with
                    the 01—08 page indicator, which is unrelated and stays far
                    right on its own. */}
                <div className="flex items-center gap-3 md:gap-4 mt-1">
                  <h2 className={`text-[22px] font-geist font-normal leading-none tracking-normal lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
                    }`}>
                    my works
                  </h2>
                  <WorksViewToggle
                    view={worksView}
                    onChange={setWorksView}
                    theme={theme}
                    className="shrink-0"
                  />
                </div>
              </div>

              <span className={`shrink-0 flex items-center gap-1 text-[10px] font-mono ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-[#666666]'
                }`}>
                
                <ArrowUpRight weight="light" size={10} className="shrink-0" />
              </span>
            </div>

            {/* Works — ONE state-driven render for every breakpoint. The old
                separate `hidden md:grid` desktop block is gone, so the toggle is
                the single source of truth for which view is active. Horizontal
                padding comes from the <section> (px-6 md:px-12 max-w-7xl), the
                same container the other sections use. */}
            <div>
              {worksView === 'grid' && (
                <div
                  key="works-grid"
                  className="works-fade grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4"
                >
                  {PROJECTS.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`cursor-pointer group rounded-[10px] overflow-hidden min-w-0 transition-[box-shadow,background-color] duration-200 ${theme === 'light'
                        ? 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.13)]'
                        : 'bg-[#0e0e12] shadow-[0_2px_10px_rgba(0,0,0,0.55)] hover:bg-[#131318] hover:shadow-[0_10px_28px_rgba(0,0,0,0.75)]'
                        }`}
                    >
                      {/* Fixed height keeps mobile cards compact; above md an
                          aspect ratio lets the thumbnail scale with the column. */}
                      <div className={`h-[70px] md:h-auto md:aspect-[16/10] w-full overflow-hidden flex items-center justify-center ${theme === 'light' ? 'bg-[#f0f0f0]' : 'bg-[#141414]'
                        }`}>
                        {project.image ? (
                          <img
                            src={project.image}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          // Flat placeholder rather than a broken image
                          <div className={`w-1/2 h-1/2 rounded-[4px] ${theme === 'light' ? 'bg-[#e8e8e8]' : 'bg-[#1c1c1c]'
                            }`} />
                        )}
                      </div>

                      {/* Padding and type sizes stay constant across breakpoints
                          so card text never looks inconsistently scaled. */}
                      <div className="px-[9px] py-[8px] flex flex-col gap-1.5 min-w-0">
                        <div className={`text-[11px] font-mono truncate ${theme === 'light' ? 'text-[#5a5a5a]' : 'text-[#e5e5e5]'
                          }`}>
                          {project.title}
                        </div>
                        <span className={`self-start inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] max-w-full truncate ${theme === 'light'
                          ? 'border-[#ececec] text-[#a0a0a0]'
                          : 'border-[#1e1e1e] text-[#5a5a57]'
                          }`}>
                          {project.tags?.[0]?.toLowerCase() || 'web'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {worksView === 'list' && (
                // Capped so rows don't stretch to absurd line lengths on wide
                // screens; matches the max-width convention used elsewhere.
                <div key="works-list" className="works-fade">
                  {PROJECTS.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className={`flex items-center justify-between gap-3 py-[10px] lg:py-[16px] cursor-pointer group border-b-[0.5px] ${index === 0 ? 'border-t-[0.5px]' : ''
                        } ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1a1a1a]'}`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <span className={`text-[12px] lg:text-[17px] font-mono transition-colors truncate ${theme === 'light' ? 'text-[#8a8a8a] lg:text-[#5a5a5a]' : 'text-[#777777] lg:text-[#9a9a9a] group-hover:text-[#bbbbbb] lg:group-hover:text-[#e5e5e5]'
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
                </div>
              )}

              {/* Browse all row — shared by both views. In grid view it needs its
                  own top edge; in list view it inherits one from the row above. */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex items-center justify-between gap-3 py-[10px] lg:py-[16px] cursor-pointer group border-b-[0.5px] ${worksView === 'grid'
                  ? 'mt-2 md:mt-3 lg:mt-4 border-t-[0.5px]'
                  : ''
                  } ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1a1a1a]'}`}
                onClick={() => setShowAllProjects(true)}
              >
                <span className={`text-[12px] lg:text-[17px] font-mono transition-colors truncate ${theme === 'light' ? 'text-[#8a8a8a] lg:text-[#5a5a5a]' : 'text-[#777777] lg:text-[#9a9a9a] group-hover:text-[#bbbbbb] lg:group-hover:text-[#e5e5e5]'
                  }`}>
                  browse all
                </span>

                <span className="shrink-0 flex items-center gap-2">
                  <span className={`inline-flex text-[8px] font-mono uppercase leading-none px-[5px] py-[1px] rounded-[2px] border-[0.5px] ${theme === 'light'
                    ? 'border-[#ececec] text-[#a0a0a0]'
                    : 'border-[#1e1e1e] text-[#333333]'
                    }`}>
                    all
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
          </section>

          {/* --- Services Section --- */}
          <section id="services" className={`py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto border-t ${theme === 'light' ? 'border-[#ececec]' : 'border-[#1e1e1e]'
            }`}>
            <SectionHeading theme={theme}>Services</SectionHeading>

            <div className={`border-t mt-8 lg:mt-12 ${theme === 'light' ? 'border-[#ececec]' : 'border-zinc-900/30 dark:border-zinc-800/60'
              }`}>
              {SERVICES.map((service, index) => {
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
                        <ArrowRight
                          weight="light"
                          size={13}
                          className={`shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-zinc-500'
                            }`}
                        />
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
                      {/* Keeps the w-6 column so the titles stay aligned now that
                          the two-digit number is gone. */}
                      <span className={`w-6 shrink-0 flex items-center ${theme === 'light' ? 'text-[#8a8a8a]' : 'text-zinc-500'
                        }`}>
                        <ArrowRight
                          weight="light"
                          size={14}
                          className="transition-transform duration-150 group-hover:translate-x-0.5"
                        />
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
              <h2 className={`text-[26px] sm:text-[32px] font-geist font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-[#e5e5e5]'
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
                CONTACT
              </span>
              <h2 className={`text-[26px] font-geist font-medium leading-none tracking-normal mt-1 lowercase ${theme === 'light' ? 'text-[#1a1a1a]' : 'text-white'
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
