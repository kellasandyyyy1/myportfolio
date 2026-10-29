import * as React from 'react';
import { flushSync } from 'react-dom';
import { Link, NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { WORKS, findWork, workPath, type WorkProject } from './data/projects';
import { FaAws } from 'react-icons/fa6';
import { SiPearson, SiCisco, SiUpwork, SiFiverr, SiRakuten } from 'react-icons/si';
import { play } from './lib/sound';
import { initUiSounds } from './lib/uiSounds';
import { XeroxPortrait } from './components/XeroxPortrait';
import { DitherThumb } from './components/DitherThumb';
import { ServicesDiagram } from './components/ServicesDiagram';
import { BookCallModal } from './components/BookCallModal';
import { GithubSection } from './components/GithubPunchCard';
import { useSoundMuted } from './lib/useSoundMuted';
import BlogPage from './components/BlogPage';
import { HarvestSnakeModal } from './components/HarvestSnake';
import { ServiceCardCanvas } from './components/ServiceCardCanvas';
import { InteractiveProfile } from './components/InteractiveProfile';
import { WalkingCat } from './components/WalkingCat';
import { NavIcon3D, type NavIcon3DName } from './components/NavIcon3D';
import { IntroTour, replayIntroTour } from './components/IntroTour';
import { Hero } from './components/Hero';
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
  SidebarSimple,
  Clock,
  CheckCircle,
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
    icon: <NavIcon3D name="portfolio" size={30} />,
    title: "Portfolio websites",
    description: "personal and professional sites that showcase your work with fast, polished builds"
  },
  {
    icon: <NavIcon3D name="ecommerce" size={30} />,
    title: "Ecommerce websites",
    description: "online stores with checkout, product catalogs, and payment integrations"
  },
  {
    icon: <NavIcon3D name="seo" size={30} />,
    title: "SEO optimization",
    description: "technical SEO and performance tuning to help sites rank and load faster"
  },
  {
    icon: <NavIcon3D name="webapp" size={30} />,
    title: "Web applications",
    description: "custom dashboards and tools built with React, Next.js, and modern APIs"
  },
  {
    icon: <NavIcon3D name="landing" size={30} />,
    title: "Landing pages",
    description: "high-converting single pages for launches, products, and campaigns"
  },
  {
    icon: <NavIcon3D name="maintenance" size={30} />,
    title: "Website maintenance",
    description: "ongoing updates, bug fixes, and performance monitoring after launch"
  }
];

/** The services diagram's flow order; copy comes from SERVICES unchanged. */
const SERVICE_FLOW = [
  'Portfolio websites',
  'Landing pages',
  'Ecommerce websites',
  'Web applications',
  'SEO optimization',
  'Website maintenance',
].map((title) => SERVICES.find((s) => s.title === title)!);

/** Per-service print pair, same palette system as the project cards. */
const SERVICE_DUOTONES = [
  { ink: '#7A1F14', paper: '#8FC1DD' },
  { ink: '#B23A1E', paper: '#E8C35A' },
  { ink: '#13283F', paper: '#C5DCA6' },
  { ink: '#1E2A6B', paper: '#F2E3A0' },
  { ink: '#0E3B3F', paper: '#A9D9D4' },
  { ink: '#3B1F3A', paper: '#C9B8E3' },
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
  /** 'YYYY-MM'. Duration is derived from these, so it never goes stale. */
  start: string;
  /** 'YYYY-MM', or null while the role is ongoing. */
  end: string | null;
  /** One line: what the job was. */
  summary: string;
  /** What the work actually involved, a short line each. */
  highlights: string[];
  skills: string[];
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
    start: '2026-08',
    end: null,
    summary: 'Leading engineering across the stack, from API design through to interface polish.',
    highlights: [
      'Set architecture direction and run code review',
      'Mentor the team and keep delivery predictable as the codebase grows',
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
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
    role: 'Fullstack Web Developer',
    start: '2026-02',
    end: '2026-07',
    summary: 'Built SaaS and e-commerce websites for clients.',
    highlights: [
      'Integrated AI features into client products',
      'Designed and built custom APIs behind the storefronts',
    ],
    skills: ['React', 'Express', 'TypeScript', 'Shopify'],
  },
  {
    id: 'rcbc',
    initials: 'RCBC',
    logoSrc: '/img/rcbclogo.svg',
    company: 'RCBC',
    location: 'Makati, Metro Manila',
    employmentType: 'Internship',
    role: 'Frontend Developer Intern',
    start: '2025-06',
    end: '2025-12',
    summary: 'Built banking UI components alongside the design team.',
    highlights: [
      'Built reusable React components and responsive Tailwind layouts',
      'Wired the interface to internal REST endpoints',
      'Helped migrate legacy pages into a typed, accessible component library',
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
  },
  {
    id: 'rakuten',
    initials: 'RK',
    logo: 'rakuten',
    company: 'Rakuten',
    location: 'London, United Kingdom',
    employmentType: 'Full-time',
    role: 'Web Developer & UI Designer',
    start: '2024-10',
    end: '2025-05',
    summary: 'Designed and built interfaces for client sites.',
    highlights: [
      'Crafted UIs, component libraries and interactive media sites',
      'Worked with design and backend engineers to ship client sites',
    ],
    skills: ['JavaScript', 'HTML/CSS', 'UI Design', 'Express', 'Figma'],
  },
];

const XP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseYm = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return { y, m };
};

const formatYm = (ym: string) => {
  const { y, m } = parseYm(ym);
  return `${XP_MONTHS[m - 1]} ${y}`;
};

/** Inclusive month count, the way LinkedIn reports tenure: Feb–Jul is 6 mos. */
const formatTenure = (start: string, end: string | null) => {
  const s = parseYm(start);
  const now = new Date();
  const e = end ? parseYm(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  const total = Math.max(1, (e.y - s.y) * 12 + (e.m - s.m) + 1);
  const yrs = Math.floor(total / 12);
  const mos = total % 12;
  return [yrs && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos && `${mos} mo${mos > 1 ? 's' : ''}`]
    .filter(Boolean)
    .join(' ');
};

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

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div
      className="custom-cursor hidden md:block"
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
      <NavIcon3D name="sun" size={size + 2} />
    </span>
    <span
      className="theme-icon theme-icon-moon"
      data-state={theme === 'light' ? 'visible' : 'hidden'}
    >
      <NavIcon3D name="moon" size={size + 2} />
    </span>
  </span>
);

/**
 * Nav keys, each rendered as its own view rather than as a stop on one long
 * page. Value is the section's element id; "work" is the one place the nav key
 * and the DOM id disagree (`/work` -> `#projects`).
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

/**
 * View for a path. A nav key shows that section alone; "/" (and anything
 * unknown) is "home", the whole site as one scrollable page from the hero.
 */
const viewForPath = (pathname: string) => {
  const key = pathname.replace(/^\//, '').split('/')[0];
  return key in NAV_SECTION_IDS ? key : 'home';
};

/** Back to home atop every view but About. Outlined like the grid/list switch, so it reads as a button. */
const ViewBack = () => (
  <div className="vb">
    <Link to="/" className="vb-btn">
      <ArrowLeft size={15} weight="bold" aria-hidden="true" />
      back to home
    </Link>
  </div>
);

type ToggleTheme = () => void;

/** Outlined sun/moon button: shows the theme a click switches to. */
const ThemeToggle = ({ theme, toggleTheme }: { theme: 'dark' | 'light'; toggleTheme: ToggleTheme }) => {
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <button type="button" data-sound="switch" onClick={toggleTheme} aria-label={label} title={label} className="theme-toggle">
      <ThemeToggleIcon theme={theme} size={16} />
    </button>
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
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                data-tour="m-close"
                title="Close menu"
                className="mobile-menu-icon-btn"
              >
                <X weight="light" size={18} />
              </button>
            </div>
          </div>

          <div className="mobile-menu-body">
          <motion.ul
            className="mobile-menu-list"
            data-tour="m-nav"
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
                    <span>{link.name}</span>
                  </NavLink>
                </motion.li>
              );
            })}
          </motion.ul>

          <WorksCarousel onNavigate={onClose} />

          {/* The quieter details live at the end of the scroll, not in the
              pinned footer, so the projects get the room. */}
          <div className="mobile-menu-meta">
            {/* Socials as icons only; each keeps its name for screen readers. */}
            <span className="mobile-menu-socials">
              {[
                { label: 'GitHub', icon: 'github' as const, href: 'https://github.com/kellasandyyyy1', external: true },
                { label: 'LinkedIn', icon: 'linkedin' as const, href: 'https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4', external: true },
                { label: 'Email', icon: 'contact' as const, href: 'mailto:kellasandrei00@gmail.com', external: false },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="mobile-menu-social"
                  aria-label={link.label}
                  title={link.label}
                >
                  <NavIcon3D name={link.icon} size={22} />
                </a>
              ))}
            </span>
            <button
              type="button"
              className="mobile-menu-replay"
              onClick={() => { onClose(); replayIntroTour(); }}
            >
              replay intro
            </button>
          </div>
          </div>

          <div className="mobile-menu-footer font-geist">
            <div className="flex items-center gap-2">
              {onBookCall && (
                <button
                  type="button"
                  data-sound="primary" onClick={() => { onClose(); onBookCall(); }}
                  className="mobile-menu-book"
                  data-tour="m-book"
                >
                  <NavIcon3D name="calendar" size={18} />
                  <span>Book Call</span>
                </button>
              )}
              {/* Stays open on toggle so the state change is visible */}
              <button data-sound="mute-toggle"
                type="button"
                onClick={() => {
                  const nowMuted = toggleSound();
                  if (!nowMuted) play('switch');
                }}
                aria-pressed={!soundMuted}
                aria-label={soundMuted ? 'Sound Off' : 'Sound On'}
                title={soundMuted ? 'Sound Off' : 'Sound On'}
                className="mobile-menu-sound"
              >
                <NavIcon3D name={soundMuted ? 'mute' : 'sound'} size={18} />
              </button>
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
  const [soundMuted, toggleSound] = useSoundMuted();
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const activeSection = viewForPath(location.pathname);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  // Stable so the menu's lock/trap effect doesn't re-run on every render.
  const closeMenu = React.useCallback(() => setIsOpen(false), []);

  // Desktop rail mode. Read synchronously so a remembered choice paints
  // collapsed on first frame instead of animating shut on load.
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sb-collapsed') === '1'; } catch { return false; }
  });
  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((c) => !c);
  }, []);
  useEffect(() => {
    try { localStorage.setItem('sb-collapsed', collapsed ? '1' : '0'); } catch { /* private mode */ }
  }, [collapsed]);
  // "[" toggles the rail, as in Linear and Figma. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '[' || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return;
      toggleCollapsed();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);
  const handleMobileNavigate = (id: string) => {
    setIsOpen(false);
    // Tapping the view you're already on doesn't change the route; take it
    // back to the top instead.
    if (location.pathname === `/${id}`) window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goHome = () => {
    // Already home: no route change, so glide back up to the hero instead.
    if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const group1Links = [
    { id: 'about', name: 'About', href: '#about', icon: <NavIcon3D name="about" /> },
    { id: 'experience', name: 'Experience', href: '#experience', icon: <NavIcon3D name="experience" /> },
    { id: 'stack', name: 'Stack', href: '#stack', icon: <NavIcon3D name="stack" /> },
    { id: 'certifications', name: 'Certifications', href: '#certifications', icon: <NavIcon3D name="certifications" /> },
  ];

  const group2Links = [
    { id: 'work', name: 'Work', href: '#projects', icon: <NavIcon3D name="work" /> },
    { id: 'services', name: 'Services', href: '#services', icon: <NavIcon3D name="services" /> },
    { id: 'resources', name: 'Resources', href: '#resources', icon: <NavIcon3D name="resources" /> },
    { id: 'contact', name: 'Contact', href: '#contact', icon: <NavIcon3D name="contact" /> },
  ];

  const navLinks = [...group1Links, ...group2Links];

  // Every nav key is its own view, so a route change starts at the top. The
  // exception is coming back from a project page, which restores where the
  // visitor was in the work list. Effects can re-run without the URL changing
  // (hot reload, a remount); those must never scroll.
  const lastRoutedPathRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (lastRoutedPathRef.current === location.pathname) return;
    const isFirst = lastRoutedPathRef.current === null;
    lastRoutedPathRef.current = location.pathname;
    const returnY = takeWorksReturn(location.pathname);
    if (returnY !== null) {
      restoreScrollY(returnY);
      return;
    }
    if (!isFirst) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Router match drives the active state. On home (`/`) no section is active.
  const isLinkActive = (id: string, isActive: boolean) => isActive || activeSection === id;

  const renderDesktopNavLink = (link: { id: string; name: string; href: string; icon: React.ReactNode }) => (
    <NavLink
      key={link.id}
      to={`/${link.id}`}
      aria-label={link.name}
      title={collapsed ? link.name : undefined}
      data-tour={link.id === 'work' ? 'sb-work' : ['services', 'resources', 'contact'].includes(link.id) ? 'sb-more' : 'sb-top'}
      className={({ isActive }) => `sb-link group ${isLinkActive(link.id, isActive) ? 'is-active' : ''}`}
    >
      {({ isActive }) => (
        <>
          {/* One shared pill: layoutId slides it between rows as the active
              section changes, so scrolling visibly moves the nav. */}
          {isLinkActive(link.id, isActive) && (
            <motion.span
              layoutId="sb-active-pill"
              aria-hidden="true"
              className="sb-pill"
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 42 }}
            >
              <span className="sb-pill-bar" />
            </motion.span>
          )}
          <span className="sb-icon">{link.icon}</span>
          <span className="sb-label">{link.name}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar (≥1024px) */}
      <aside
        className={`sb hidden lg:flex flex-shrink-0 h-screen sticky top-0 border-r flex-col p-4 z-40 select-none overflow-y-auto bg-[var(--sidebar-bg)] border-[var(--sand-deep)]`}
        data-collapsed={collapsed}
      >
        {/* Top: Identity Block */}
        <div className="sb-identity">
          {/* Home: the full page from the hero down, scrollable through every section. */}
          <Link
            to="/"
            onClick={goHome}
            className="sb-home"
            aria-label="Kellas Andrei, home"
            aria-current={activeSection === 'home' ? 'page' : undefined}
            title={collapsed ? 'Home' : undefined}
          >
            <img src="/img/drei.png" alt="" className="sb-avatar" />
            <span className="sb-name min-w-0 t-small font-sans font-medium truncate c-primary">Kellas Andrei</span>
          </Link>
          {/* Collapsed, this sits over the avatar and fades in on hover. */}
          <button
            type="button"
            className="sb-toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={`${collapsed ? 'Expand' : 'Collapse'} sidebar  [`}
          >
            <SidebarSimple size={16} weight="regular" aria-hidden="true" />
          </button>
        </div>

        {/* Vertical Nav Links, two groups */}
        <nav className="flex flex-col w-full mt-7 mb-auto" aria-label="Sections">
          <div className="flex flex-col gap-0.5">
            {group1Links.map(renderDesktopNavLink)}
          </div>

          <span className="sb-group-label t-label font-mono uppercase c-tertiary">
            <span className="sb-group-text">ENGAGE</span>
          </span>
          <div className="flex flex-col gap-0.5">
            {group2Links.map(renderDesktopNavLink)}
          </div>
        </nav>

        {/* Footer: labelled links, then preferences with real controls, so
            nothing has to be guessed from an icon alone. */}
        <div className="sidebar-footer sf mt-auto pt-3 border-t border-[var(--sand-deep)]">
          <span className="sf-label">connect</span>
          <ul className="sf-links">
            {[
              { label: 'GitHub', icon: 'github' as const, href: 'https://github.com/kellasandyyyy1', external: true },
              { label: 'LinkedIn', icon: 'linkedin' as const, href: 'https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4', external: true },
              { label: 'Email', icon: 'contact' as const, href: 'mailto:kellasandrei00@gmail.com', external: false },
            ].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="sf-link"
                  data-tour="sb-social"
                  aria-label={link.label}
                  title={collapsed ? link.label : undefined}
                >
                  <NavIcon3D name={link.icon} size={16} />
                  <span className="sf-text">{link.label}</span>
                  <ArrowUpRight weight="light" size={11} className="sf-arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <span className="sf-label">preferences</span>
          <button data-sound="mute-toggle"
            type="button"
            role="switch"
            aria-checked={!soundMuted}
            onClick={() => {
              // Clack only when unmuting, so muting is silent. The delegated click sound
              // skips this button: at pointerdown the state hasn't flipped yet.
              const nowMuted = toggleSound();
              if (!nowMuted) play('switch');
            }}
            className="sf-row"
            aria-label="Sound"
            title={collapsed ? (soundMuted ? 'Sound off' : 'Sound on') : undefined}
          >
            <NavIcon3D name={soundMuted ? 'mute' : 'sound'} size={16} />
            <span className="sf-text">Sound</span>
            <span className="sf-switch" aria-hidden="true"><i /></span>
          </button>

          <div className="sf-theme" role="group" aria-label="Theme" data-mode-choice={theme} data-tour="theme">
            <span className="sf-theme-thumb" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={theme === 'light'}
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className="sf-theme-opt"
              data-sound="switch"
              aria-label="Light theme"
            >
              <NavIcon3D name="sun" size={14} />
              <span>light</span>
            </button>
            <button
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className="sf-theme-opt"
              data-sound="switch"
              aria-label="Dark theme"
            >
              <NavIcon3D name="moon" size={14} />
              <span>dark</span>
            </button>
          </div>

          <button type="button" className="sf-replay" onClick={replayIntroTour}>
            replay intro
          </button>
        </div>
      </aside>

      {/* Tablet Header (768px - 1023px) */}
      <header className={`hidden md:flex lg:hidden w-full border-b px-6 py-3.5 items-center justify-between sticky top-0 z-50 transition-colors bg-[var(--cream)] border-[var(--sand-deep)]`}>
        <div className="flex items-center gap-2.5">
          <Link to="/" onClick={goHome} className="t-h3 font-sans c-primary" aria-label="Kellas Andrei, home">Kellas Andrei</Link>
        </div>

        <div className="flex items-center gap-5" data-tour="tab-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              to={`/${link.id}`}
              className={({ isActive }) => {
                const active = isActive || (location.pathname === '/' && link.id === 'about');
                return `tab-link ${active ? 'is-active' : ''} t-label font-geist uppercase transition-colors ${active
                  ? ('text-[var(--ink)] font-medium')
                  : ('text-[var(--ink-body)] hover:text-[var(--accent-ink)]')
                  }`;
              }}
              aria-label={link.name}
              title={link.name}
            >
              <NavIcon3D name={link.id as NavIcon3DName} size={18} />
              <span className="tab-label">{link.name}</span>
            </NavLink>
          ))}

          <button data-sound="mute-toggle"
            onClick={() => {
              const nowMuted = toggleSound();
              if (!nowMuted) play('switch');
            }}
            aria-pressed={soundMuted}
            aria-label={soundMuted ? 'Unmute interface sounds' : 'Mute interface sounds'}
            className={`p-1.5 transition-colors cursor-pointer text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
          >
            <NavIcon3D name={soundMuted ? 'mute' : 'sound'} size={18} />
          </button>

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Mobile Top Bar (<768px) */}
      <header className={`flex md:hidden w-full border-b px-4 py-3 items-center justify-between sticky top-0 z-50 transition-colors bg-[var(--cream)] border-[var(--sand-deep)]`}>
        <div className="flex items-center gap-2">
          <Link to="/" onClick={goHome} className="t-h3 font-sans c-primary" aria-label="Kellas Andrei, home">Kellas Andrei</Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(true)}
            className={`p-2 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer text-[var(--ink)] hover:text-[var(--accent-ink)]`}
            aria-label="Open navigation menu"
            data-tour="m-menu"
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
  className = "",
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
        className={`t-h2 c-primary font-cal lowercase ${animClass}`}
        style={isInView !== undefined ? { animationDelay: `${baseDelay}ms` } : undefined}
      >
        {textVal}
      </h2>
    </div>
  );
};

const RESOURCE_FILTERS = ['All', ...RESOURCES.map((g) => g.filter)];

/** Items shown before "+N more". */
const RESOURCE_PREVIEW = 3;

/**
 * One category as a ruled list: a small heading with a count, then compact
 * rows (name, one-line description, ↗ on hover). The rest folds behind "+N more".
 */
const ResourceGroupList = ({ group, wide }: { group: ResourceGroup; wide: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Filtered down to one category, there's room for the whole list.
  const preview = wide ? group.items.length : RESOURCE_PREVIEW;
  const visibleItems = group.items.slice(0, preview);
  const hiddenItems = group.items.slice(preview);
  const headingId = `rs-${group.filter.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  const renderItem = (resource: Resource) => (
    <li key={resource.url}>
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="rs-item">
        <span className="rs-name">
          {resource.name}
          <ArrowUpRight weight="light" size={12} className="rs-arrow" aria-hidden="true" />
        </span>
        <span className="rs-desc">{resource.description}</span>
      </a>
    </li>
  );

  return (
    <section className={`rs-group ${wide ? 'is-wide' : ''}`} aria-labelledby={headingId}>
      <header className="rs-head">
        <h3 id={headingId} className="rs-title">{group.category}</h3>
      </header>

      <ul className="rs-list">{visibleItems.map(renderItem)}</ul>

      {hiddenItems.length > 0 && (
        <>
          <div className={`rs-more-wrap ${isExpanded ? 'is-open' : ''}`} aria-hidden={!isExpanded}>
            <ul className="rs-list rs-list-more">{hiddenItems.map(renderItem)}</ul>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="rs-more"
          >
            {isExpanded ? '− show less' : `+ ${hiddenItems.length} more`}
          </button>
        </>
      )}
    </section>
  );
};

const ResourcesGrid = (_props: { theme: 'dark' | 'light' }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const reduced = useReducedMotion();

  const visibleGroups = RESOURCES.filter((group) => activeFilter === 'All' || group.filter === activeFilter);
  const single = visibleGroups.length === 1;

  // The stage eases to the height of whatever is inside it, so switching
  // categories (or opening "+N more") never makes the page below jump.
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [stageHeight, setStageHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <>
      {/* Filter tabs: plain words, the active one underlined. Wrap, never scroll. */}
      <div className="rs-tabs" role="group" aria-label="Filter resources">
        {RESOURCE_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            aria-pressed={filter === activeFilter}
            className="rs-tab"
          >
            {filter.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Switching: the current set fades out, then the new one rises in with
          each list a beat after the last, while the stage eases to its height. */}
      <div className="rs-stage" style={{ height: stageHeight }}>
        <div ref={innerRef}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeFilter}
              className={`rs-grid ${single ? 'is-single' : ''}`}
              initial="out"
              animate="in"
              exit="leave"
              variants={{
                out: {},
                in: { transition: { staggerChildren: reduced ? 0 : 0.06 } },
                leave: { opacity: 0, transition: { duration: reduced ? 0 : 0.16, ease: 'easeIn' } },
              }}
            >
              {visibleGroups.map((group) => (
                <motion.div
                  key={group.category}
                  className="min-w-0"
                  variants={{
                    out: { opacity: 0, y: reduced ? 0 : 10 },
                    in: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.42, ease } },
                  }}
                >
                  <ResourceGroupList group={group} wide={single} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

type WorksView = 'grid' | 'list';
const WORKS_VIEW_KEY = 'works-view-mode';

/**
 * Where the page was when a project page opened, so "← my works" can land on
 * the grid exactly where the visitor left it.
 */
let worksReturn: { path: string; y: number } | null = null;
const rememberWorksScroll = () => {
  worksReturn = { path: window.location.pathname, y: window.scrollY };
};
/** Hands the saved position back once, when the visitor returns to that path. */
const takeWorksReturn = (path: string) => {
  if (!worksReturn || path.startsWith('/work/')) return null;
  const saved = worksReturn;
  worksReturn = null;
  return saved.path === path ? saved.y : null;
};
/** Re-applies a scroll position across a few frames while the page settles. */
const restoreScrollY = (y: number) => {
  let frames = 0;
  const attempt = () => {
    window.scrollTo({ top: y, behavior: 'auto' });
    if (frames++ < 3) requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
};

/** ↗ to a project's live site. Sits above the card's own link and never triggers it. */
const WorkLiveLink: React.FC<{ project: WorkProject; size?: number }> = ({ project, size = 13 }) =>
  project.liveUrl ? (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.title} live site`}
      className="wk-live"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ArrowUpRight weight="light" size={size} aria-hidden="true" />
    </a>
  ) : null;

/** The whole card links to the project page; the ↗ is a separate link above it. */
const WorkCardLink: React.FC<{ project: WorkProject; onNavigate?: () => void }> = ({ project, onNavigate }) => (
  <Link
    to={workPath(project)}
    state={{ fromWorks: true }}
    aria-label={project.title}
    className="wk-link"
    onClick={() => {
      rememberWorksScroll();
      onNavigate?.();
    }}
  />
);

/** One hard cut every 1/12s: the hover stepping runs on the hero's stop-motion clock. */
const DITHER_STEP_MS = 1000 / 12;
const DITHER_RESOLVED = 3;

/**
 * Editorial card: a two-tone dithered thumbnail over a flat light info panel
 * (title, description, and the ↗ in the footer). Hover or keyboard focus resolves the
 * dither in four hard-cut steps (3px → 2px → 1px → original) and steps back on
 * leave. Shared by the works grid and the browse-all modal.
 */
const WorkCard: React.FC<{ project: WorkProject; onNavigate?: () => void }> = ({ project, onNavigate }) => {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState(0);

  // Walk one step per frame toward the target; reduced motion jumps straight there.
  useEffect(() => {
    if (step === target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(target);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + Math.sign(target - s)), DITHER_STEP_MS);
    return () => window.clearTimeout(id);
  }, [step, target]);

  return (
    <div
      className={`wk-card${target ? ' is-active' : ''}`}
      // Mouse only: touch shows the dither, and the detail page the original.
      onPointerEnter={(e) => e.pointerType === 'mouse' && setTarget(DITHER_RESOLVED)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setTarget(0)}
      onFocus={(e) => (e.target as HTMLElement).matches(':focus-visible') && setTarget(DITHER_RESOLVED)}
      onBlur={() => setTarget(0)}
    >
      <DitherThumb project={project} step={step} className="wk-thumb" />
      <span className="wk-panel">
        <span className="wk-name">{project.title}</span>
        {project.summary && <span className="wk-desc">{project.summary}</span>}
        <span className="wk-foot">
          <WorkLiveLink project={project} />
        </span>
      </span>
      <WorkCardLink project={project} onNavigate={onNavigate} />
    </div>
  );
};

/**
 * List-view row, in the resources list's style: a dithered square, the name
 * with its one-line summary underneath, and the ↗ live link on the right. The whole
 * row opens the project page. Rows rise in with a short stagger (--i) when the
 * list appears.
 */
/** The project's live domain, shown above its card, e.g. "holymeltburger.com". */
const siteHost = (url?: string) => {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Steady drift, in px per second, and the pause after the visitor moves it. */
const DRIFT_PX_PER_SEC = 32;
const RESUME_AFTER_MS = 1200;

/**
 * "my works" in the mobile menu: a row of project cards (the dithered
 * thumbnail, its domain above and the title below) that drifts continuously
 * at a steady pace and loops seamlessly. Swipe, drag or use the arrows to move
 * it; the drift carries on from there a moment later. A tap opens the project
 * and closes the menu.
 */
const WorksCarousel: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  /** Float position: some browsers round scrollLeft, so the drift keeps its own. */
  const pos = React.useRef(0);
  const lastInteraction = React.useRef(0);

  /** Distance between card starts: one card plus the gap. */
  const step = () => {
    const track = trackRef.current;
    const cards = track?.querySelectorAll<HTMLElement>('.mm-card');
    if (!cards || cards.length < 2) return track?.clientWidth ?? 1;
    return cards[1].offsetLeft - cards[0].offsetLeft;
  };

  /** Width of one full set of cards: the loop point. */
  const loopWidth = () => {
    const track = trackRef.current;
    const cards = track?.querySelectorAll<HTMLElement>('.mm-card');
    if (!cards || cards.length <= WORKS.length) return 0;
    return cards[WORKS.length].offsetLeft - cards[0].offsetLeft;
  };

  const interacting = () => Date.now() - lastInteraction.current < RESUME_AFTER_MS;
  const noteInteraction = () => {
    lastInteraction.current = Date.now();
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    // While the visitor is moving it, follow them.
    if (interacting()) pos.current = track.scrollLeft;
    setIndex(Math.round(track.scrollLeft / step()) % WORKS.length);
  };

  // The drift: never stops; it only steps aside while the visitor moves the row.
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const track = trackRef.current;
      if (track && !interacting()) {
        const loop = loopWidth();
        pos.current += DRIFT_PX_PER_SEC * dt;
        // One full set scrolled past: jump back by exactly one set, seamlessly.
        if (loop > 0 && pos.current >= loop) pos.current -= loop;
        track.scrollLeft = pos.current;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const go = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    noteInteraction();
    let from = Math.round(track.scrollLeft / step());
    // Stepping back from the very start wraps into the duplicate set.
    if (dir < 0 && from === 0) {
      from = WORKS.length;
      track.scrollLeft = from * step();
    }
    const target = (from + dir) * step();
    pos.current = target;
    track.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      className="mm-carousel"
      aria-label="My works"
      onPointerDown={noteInteraction}
      onTouchStart={noteInteraction}
      onTouchMove={noteInteraction}
      onWheel={noteInteraction}
      onKeyDown={noteInteraction}
    >
      <div ref={trackRef} className="mm-carousel-track" onScroll={onScroll}>
        {/* Two sets for a seamless loop; the second is decoration only. */}
        {[0, 1].map((set) => (
          <div key={set} className="mm-carousel-set" inert={set === 1} aria-hidden={set === 1 || undefined}>
            {WORKS.map((project) => (
              <Link
                key={project.slug}
                to={workPath(project)}
                state={{ fromWorks: true }}
                className="mm-card"
                onClick={() => {
                  rememberWorksScroll();
                  onNavigate();
                }}
              >
                <span className="mm-card-meta">{siteHost(project.liveUrl) || ' '}</span>
                <DitherThumb project={project} className="mm-card-thumb" />
                <span className="mm-card-title">{project.title}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mm-carousel-nav">
        <button type="button" className="mm-carousel-arrow" aria-label="Previous project" onClick={() => go(-1)}>
          <ArrowLeft size={16} weight="regular" aria-hidden="true" />
        </button>
        <span className="mm-carousel-count">
          {pad2(index + 1)} / {pad2(WORKS.length)}
        </span>
        <button type="button" className="mm-carousel-arrow" aria-label="Next project" onClick={() => go(1)}>
          <ArrowRight size={16} weight="regular" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

const WorkRow: React.FC<{ project: WorkProject; index: number; onNavigate?: () => void }> = ({ project, index, onNavigate }) => (
  <div className="wk-row wl-row" style={{ '--i': index } as React.CSSProperties}>
    <DitherThumb project={project} className="wl-thumb" />
    <span className="wl-main">
      <span className="wl-title">
        {project.title}
        <ArrowRight weight="light" size={12} className="wl-go" aria-hidden="true" />
      </span>
      {project.summary && <span className="wl-desc">{project.summary}</span>}
    </span>
    <span className="wl-end">
      <WorkLiveLink project={project} size={12} />
    </span>
    <WorkCardLink project={project} onNavigate={onNavigate} />
  </div>
);

/**
 * Sets the document title and the description / Open Graph tags for a page,
 * and puts the previous values back when the page goes away.
 */
function useDocumentMeta({ title, description, image }: { title: string; description?: string; image?: string }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const setMeta = (attr: 'name' | 'property', key: string, value?: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      const created = !el;
      const previous = el?.getAttribute('content') ?? null;
      if (!value) {
        // Nothing to say: drop a tag we'd otherwise leave stale.
        if (el && created) el.remove();
        return () => {};
      }
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
      return () => {
        if (created) el!.remove();
        else if (previous !== null) el!.setAttribute('content', previous);
      };
    };

    const undo = [
      setMeta('name', 'description', description),
      setMeta('property', 'og:title', title),
      setMeta('property', 'og:description', description),
      setMeta('property', 'og:image', image),
    ];
    return () => {
      document.title = previousTitle;
      undo.forEach((u) => u());
    };
  }, [title, description, image]);
}

/** "← my works": back through history when the visitor came from the grid, else to the works section. */
const BackToWorks: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fromSite = Boolean((location.state as { fromWorks?: boolean } | null)?.fromWorks);
  return fromSite ? (
    <button type="button" className="pp-back" onClick={() => navigate(-1)}>
      ← my works
    </button>
  ) : (
    <Link to="/work" className="pp-back">
      ← my works
    </Link>
  );
};

/** /work/:slug — one project, in the site's own layout. */
const ProjectPage: React.FC<{ project: WorkProject }> = ({ project }) => {
  const location = useLocation();
  const index = WORKS.indexOf(project);
  const prev = WORKS[(index - 1 + WORKS.length) % WORKS.length];
  const next = WORKS[(index + 1) % WORKS.length];
  const meta = [project.role, project.year].filter(Boolean);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [project.slug]);

  useDocumentMeta({
    title: `${project.title} — Kellas Andrei`,
    description: project.summary,
    image: project.cover ? new URL(project.cover, window.location.origin).href : undefined,
  });

  return (
    <article className="section pp">
      <BackToWorks />

      <header className="pp-head">
        <h1 className="pp-title">{project.title}</h1>
      </header>

      {(project.liveUrl || project.repoUrl) && (
        <div className="pp-actions">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="pp-primary">
              visit live site <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="pp-secondary">
              view code <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}

      {meta.length > 0 && <p className="pp-meta">{meta.join(' · ')}</p>}

      <figure className="pp-hero">
        <img src={project.cover} alt={`${project.title} screenshot`} loading="eager" />
      </figure>

      {project.summary && <p className="pp-summary t-lead">{project.summary}</p>}

      {project.gallery && project.gallery.length > 0 && (
        <section className="pp-gallery" aria-labelledby="pp-gallery-heading">
          <h2 id="pp-gallery-heading" className="pp-h2">screenshots</h2>
          <div className="pp-grid">
            {project.gallery.map((src, i) => (
              <figure key={src} className="pp-shot">
                <img src={src} alt={`${project.title} screenshot ${i + 2}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>
      )}

      <nav className="pp-pager" aria-label="More projects">
        {/* replace: paging between projects never stacks history, so "← my works" still goes straight back. */}
        <Link to={workPath(prev)} replace state={location.state} className="pp-pg">
          <span className="pp-pg-label">← previous</span>
          <span className="pp-pg-title">{prev.title}</span>
        </Link>
        <Link to={workPath(next)} replace state={location.state} className="pp-pg pp-pg-next">
          <span className="pp-pg-label">next →</span>
          <span className="pp-pg-title">{next.title}</span>
        </Link>
      </nav>
    </article>
  );
};

/** Unknown /work/:slug. */
const NotFoundPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  useDocumentMeta({ title: 'Not found — Kellas Andrei' });
  return (
    <section className="section pp">
      <BackToWorks />
      <header className="pp-head">
        <h1 className="pp-title">page not found</h1>
      </header>
      <p className="pp-summary t-lead">There's nothing at this address.</p>
    </section>
  );
};

/**
 * Grid/list switch for the works section: a two-option segmented control. Each
 * option carries its icon and name, and a sand tile slides under the current one.
 */
const WorksViewToggle: React.FC<{
  view: WorksView;
  onChange: (next: WorksView) => void;
  theme: 'dark' | 'light';
  className?: string;
}> = ({ view, onChange, className = '' }) => {
  const option = (mode: WorksView, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => onChange(mode)}
      aria-label={label}
      aria-pressed={view === mode}
      className="vt-opt"
    >
      {icon}
      <span aria-hidden="true">{mode}</span>
    </button>
  );

  return (
    <div role="group" aria-label="Works layout" className={`vt ${className}`} data-view={view}>
      <span className="vt-thumb" aria-hidden="true" />
      {option('grid', 'Grid view', <LayoutGrid weight="regular" size={14} />)}
      {option('list', 'List view', <List weight="regular" size={14} />)}
    </div>
  );
};

const AllProjectsModal = ({
  isOpen,
  onClose,
  projects,
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: WorkProject[];
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
        className="scrim fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          // ease-out, no spring — the rest of the site never overshoots.
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={`w-full max-h-[85vh] max-w-4xl flex flex-col rounded-[10px] overflow-hidden border-[0.5px] bg-[var(--cream)] border-[var(--sand-deep)] text-[var(--ink)]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* One header for every width, built like the site's section headers:
              muted mono eyebrow over a lowercase mono heading. */}
          <div className={`px-4 md:px-6 py-3 md:py-4 flex items-start justify-between gap-3 shrink-0 border-b-[0.5px] border-[var(--sand-deep)]`}>
            <div className="min-w-0">
              <span className={`text-[10px] font-mono tracking-[1.5px] uppercase block text-[var(--ink-muted)]`}>
                projects
              </span>
              <h3 className={`text-[18px] md:text-[22px] font-cal font-normal leading-none tracking-normal mt-1 lowercase text-[var(--ink)]`}>
                all projects
              </h3>
            </div>

            {/* Matches the sidebar's 32px icon-button language. */}
            <button
              onClick={onClose}
              aria-label="Close"
              className={`w-[32px] h-[32px] rounded-[8px] border-[0.5px] flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer border-[var(--sand-deep)] text-[var(--ink-muted)] hover:text-[var(--accent-ink)] hover:border-[var(--hover-border)]`}
            >
              <X weight="light" size={14} />
            </button>
          </div>

          {/* Mobile (<md): ruled rows, the same as the works list view. */}
          <div className="md:hidden px-4 overflow-y-auto flex-1 min-h-0 pb-4">
            {projects.map((project, index) => (
              <WorkRow key={project.slug} project={project} index={index} onNavigate={onClose} />
            ))}
          </div>

          {/* Desktop (md+): the same card as the works section grid. */}
          <div className="hidden md:block px-6 py-5 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-3 gap-x-5 gap-y-8">
              {projects.map((project) => (
                <WorkCard key={project.slug} project={project} onNavigate={onClose} />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
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
        className="scrim fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-10 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl flex flex-col sm:rounded-3xl overflow-hidden border-0 sm:border shadow-2xl no-print-hide bg-[var(--sand)] sm:border-[var(--sand-deep)] text-[var(--ink)]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-3 sm:p-5 md:p-6 flex items-center justify-between border-b shrink-0 print-hide border-[var(--sand-deep)] bg-[var(--sand)]`}>
            <div className="flex items-center gap-3">
              <FileText size={20} className="opacity-60" />
              <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase">Resume</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-[var(--sand-deep)] hover:bg-[var(--hover-fill)] text-[var(--accent-ink)]`}
                title="Print or save as PDF"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-full border transition-all shrink-0 print-hide border-[var(--sand-deep)] hover:bg-[var(--hover-fill)] text-[var(--accent-ink)]`}
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
              <div className="text-center border-b pb-6" style={{ borderColor: 'var(--sand-deep)' }}>
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
                      className={`px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-lg border border-[var(--sand-deep)] bg-[var(--sand)]`}
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
                  {WORKS.map((project) => (
                    <div key={project.slug} className={`p-4 rounded-xl border border-[var(--sand-deep)] bg-[var(--sand)]`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-sm uppercase tracking-tight mb-1">{project.title}</h3>
                          {project.summary && <p className="text-xs opacity-70 leading-relaxed">{project.summary}</p>}
                        </div>
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
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
                    <div key={service.title} className={`p-4 rounded-xl border border-[var(--sand-deep)] bg-[var(--sand)]`}>
                      <h3 className="font-bold text-xs uppercase tracking-tight mb-1">{service.title}</h3>
                      <p className="text-[11px] opacity-60 leading-relaxed">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education / Info */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">Education</h2>
                <div className={`p-4 rounded-xl border border-[var(--sand-deep)] bg-[var(--sand)]`}>
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
      className={`border backdrop-blur-md rounded-xl p-3 sm:p-4 relative overflow-hidden group transition-all shadow-xl cursor-pointer bg-[var(--sand)] border-[var(--sand-deep)] hover:border-[var(--hover-border)] shadow-[var(--shadow-warm)]`}
    >
      {/* Typing Effect Content */}
      <div className={`font-mono text-[11px] sm:text-xs md:text-[13px] leading-relaxed min-h-[85px] sm:min-h-[75px] text-[var(--ink-body)]`}>
        <span className="text-cyan-400 font-bold select-none mr-1.5">&gt;</span>
        <span>{displayedText}</span>
        <span className="inline-block w-1.5 sm:w-2 h-3.5 sm:h-4 bg-cyan-400 ml-1 align-middle animate-pulse shadow-[0_0_8px_#00f0ff]" />
      </div>
    </motion.div>
  );
};

type GitLane = 'main' | 'branch';

interface ProcessNode {
  hash: string;
  name: string;
  desc: string;
  /** Which lane of the commit graph the step sits on. */
  lane: GitLane;
  /** Present-tense status shown on the mascot label while this node is active. */
  verb: string;
}

const PROCESS_NODES: ProcessNode[] = [
  { hash: "9f2c1ab", name: "understand", desc: "listen first, talk later. the problem people describe is rarely the one that’s actually keeping them up at night.", lane: 'main', verb: "understanding" },
  { hash: "4d7e05f", name: "plan", desc: "map the route before getting in the car. a messy sketch today saves a very tidy disaster next month.", lane: 'main', verb: "planning" },
  { hash: "b18a3c6", name: "build", desc: "headphones on, world off. this is where the napkin drawings finally become something you can click.", lane: 'branch', verb: "building" },
  { hash: "6c0f92d", name: "test", desc: "click everything like a curious stranger with too much free time, because eventually one will.", lane: 'branch', verb: "testing" },
  { hash: "e35b7a4", name: "refine", desc: "sand the edges until nothing snags. if a button needs explaining, it isn’t finished yet.", lane: 'branch', verb: "refining" },
  { hash: "a07d4e1", name: "done", desc: "", lane: 'main', verb: "done" },
];


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

interface GitGraphGeometry {
  /** Fixed height of every row; node centres sit at rowH·i + rowH/2. */
  rowH: number;
  gutter: number;
  mainX: number;
  branchX: number;
  r: number;
  rMerge: number;
}

/** Desktop and tablet share one geometry; phones get a tighter gutter. */
const GIT_GRAPH_WIDE: GitGraphGeometry = { rowH: 64, gutter: 72, mainX: 20, branchX: 48, r: 7, rMerge: 10 };
const GIT_GRAPH_NARROW: GitGraphGeometry = { rowH: 60, gutter: 56, mainX: 14, branchX: 36, r: 6, rMerge: 9 };

/**
 * Every coordinate in the graph comes from here, so nodes stay on their row's
 * text centre at any rowH. The branch forks at the commit before the first
 * branch step and merges into the last commit.
 */
function buildGitGraph(g: GitGraphGeometry, lanes: GitLane[]) {
  const cy = (i: number) => g.rowH * i + g.rowH / 2;
  const last = lanes.length - 1;
  const fork = lanes.indexOf('branch') - 1;
  const lastBranch = lanes.lastIndexOf('branch');
  const k = g.rowH * 0.55;

  const main = `M ${g.mainX} ${cy(0)} L ${g.mainX} ${cy(last)}`;
  const branch = [
    `M ${g.mainX} ${cy(fork)}`,
    `C ${g.mainX} ${cy(fork) + k}, ${g.branchX} ${cy(fork + 1) - k}, ${g.branchX} ${cy(fork + 1)}`,
    `L ${g.branchX} ${cy(lastBranch)}`,
    `C ${g.branchX} ${cy(lastBranch) + k}, ${g.mainX} ${cy(last) - k}, ${g.mainX} ${cy(last)}`,
  ].join(' ');

  const nodes = lanes.map((lane, i) => ({
    x: lane === 'branch' ? g.branchX : g.mainX,
    y: cy(i),
    lane,
    merge: i === last,
  }));

  // Checkmark inside the merge node, scaled to its radius.
  const m = nodes[last];
  const check = `M ${m.x - g.rMerge * 0.42} ${m.y + g.rMerge * 0.02} L ${m.x - g.rMerge * 0.1} ${m.y + g.rMerge * 0.34} L ${m.x + g.rMerge * 0.45} ${m.y - g.rMerge * 0.32}`;

  return { width: g.gutter, height: g.rowH * lanes.length, main, branch, nodes, check };
}

/** Auto-step: one commit every 3s, starting once the entrance (done lands ~1.7s) has finished. */
const AUTO_STEP_MS = 3000;
const AUTO_START_MS = 2000;

/** Entrance timing (ms): nodes stagger from 150ms; the branch grows after plan; done lands last. */
const GG_NODE_START = 150;
const GG_NODE_STEP = 80;
const GG_MERGE_AT = 1200;

/**
 * "how i think" as a real commit graph: understand and plan on main, build,
 * test and refine on a side branch, merged back into main at done. The rows
 * are the content; the SVG in the gutter is decoration drawn to match them.
 */
const GitGraph: React.FC<{ onActivate?: (index: number) => void }> = ({ onActivate }) => {
  const { ref, revealed, reduced } = useRevealOnce();
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  );
  const [hot, setHot] = useState<number | null>(null);
  const [tallest, setTallest] = useState(0);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // If any row's text wraps past the base row height, every row grows with it,
  // so the graph and the text can never drift apart.
  useEffect(() => {
    const measure = () =>
      setTallest(Math.max(0, ...textRefs.current.map((el) => el?.offsetHeight ?? 0)));
    const ro = new ResizeObserver(measure);
    textRefs.current.forEach((el) => el && ro.observe(el));
    measure();
    return () => ro.disconnect();
  }, []);

  const base = narrow ? GIT_GRAPH_NARROW : GIT_GRAPH_WIDE;
  const rowH = Math.max(base.rowH, Math.ceil(tallest + 16));
  const graph = buildGitGraph({ ...base, rowH }, PROCESS_NODES.map((n) => n.lane));
  const last = PROCESS_NODES.length - 1;
  const delayFor = (i: number) => (i === last ? GG_MERGE_AT : GG_NODE_START + i * GG_NODE_STEP);

  // Where the row highlight and node halo sit. It keeps the last row while they
  // fade out, so moving between rows glides instead of blinking off and on.
  const [pos, setPos] = useState(0);
  const posRef = React.useRef(0);

  // Auto-step state: paused while the visitor drives the graph, resumed a beat
  // after they leave, and only while the section is actually on screen.
  const userRef = React.useRef(false);
  const holdUntilRef = React.useRef(0);
  const inViewRef = React.useRef(false);

  const activate = (i: number) => {
    setHot(i);
    setPos(i);
    posRef.current = i;
    onActivate?.(i);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  // Every 3s the highlight glides to the next commit, wrapping from done back
  // to understand. Starts once the entrance animation has played. Off under
  // reduced motion, since it's self-changing content.
  useEffect(() => {
    if (reduced || !revealed) return;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      if (!userRef.current) setHot(posRef.current);
      interval = window.setInterval(() => {
        if (document.hidden || !inViewRef.current || userRef.current || Date.now() < holdUntilRef.current) return;
        const next = (posRef.current + 1) % PROCESS_NODES.length;
        posRef.current = next;
        setPos(next);
        setHot(next);
      }, AUTO_STEP_MS);
    }, AUTO_START_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [revealed, reduced]);

  const pauseAuto = () => { userRef.current = true; };
  const resumeAuto = () => {
    userRef.current = false;
    holdUntilRef.current = Date.now() + AUTO_STEP_MS;
    // With auto-stepping on, the highlight stays where the visitor left it and
    // carries on from there; without it, it simply fades out.
    if (reduced) setHot(null);
  };

  const haloNode = graph.nodes[pos];

  return (
    <div
      ref={ref}
      className={`gg ${revealed ? 'is-in' : ''} ${reduced ? 'is-still' : ''}`}
      style={{ '--gg-row': `${rowH}px`, '--gg-gutter': `${graph.width}px` } as React.CSSProperties}
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
    >
      <span
        className={`gg-hl ${hot !== null ? 'is-on' : ''}`}
        style={{ '--pos': pos } as React.CSSProperties}
        aria-hidden="true"
      />
      <svg
        className="gg-svg"
        width={graph.width}
        height={graph.height}
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        aria-hidden="true"
      >
        <path className="gg-main" d={graph.main} pathLength={1} />
        <path className="gg-branch" d={graph.branch} pathLength={1} />
        <circle
          className={`gg-halo ${hot !== null ? 'is-on' : ''}`}
          cx={0}
          cy={0}
          r={base.rMerge + 5}
          style={{ transform: `translate(${haloNode.x}px, ${haloNode.y}px)` }}
        />
        {graph.nodes.map((n, i) => (
          <g
            key={i}
            className={`gg-node-wrap ${n.merge ? 'is-merge' : ''}`}
            style={{ '--d': `${delayFor(i)}ms` } as React.CSSProperties}
          >
            <circle
              className={`gg-node ${n.merge ? 'is-merge' : n.lane} ${hot === i ? 'is-hot' : ''}`}
              cx={n.x}
              cy={n.y}
              r={n.merge ? base.rMerge : base.r}
            />
            {n.merge && <path className="gg-check" d={graph.check} />}
          </g>
        ))}
      </svg>

      <ol className="gg-list">
        {PROCESS_NODES.map((node, i) => (
          <li
            key={node.hash}
            tabIndex={0}
            className={`gg-row ${hot === i ? 'is-hot' : ''}`}
            style={{ '--d': `${delayFor(i)}ms` } as React.CSSProperties}
            onMouseEnter={() => activate(i)}
            onFocus={() => {
              pauseAuto();
              activate(i);
            }}
            onBlur={(e) => {
              // Tabbing to the next row keeps control; leaving the list hands it back.
              if (!(e.relatedTarget as HTMLElement | null)?.closest?.('.gg-row')) resumeAuto();
            }}
            onClick={() => activate(i)}
          >
            <div className="gg-text" ref={(el) => { textRefs.current[i] = el; }}>
              <div className="gg-line">
                <span className="gg-hash t-mono font-mono">{node.hash}</span>
                <span className="gg-name t-h3 font-sans">{node.name}</span>
                {i === last && <span className="gg-head t-label font-mono">HEAD → main</span>}
              </div>
              {node.desc && <p className="gg-desc t-body font-sans">{node.desc}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

/**
 * The section's illustration: the animated drummer, with the still as the
 * reduced-motion fallback. The still's filename has spaces, so it's encoded.
 */
const HOW_I_THINK_GIF = '/gif/drummer_head_turn_stop_motion.gif';
const HOW_I_THINK_IMAGE = encodeURI('/img/how i think image .png');

/**
 * Palette duotones for the illustration: the image goes to greyscale, its
 * contrast is stretched, then its dark-to-light range is mapped onto three
 * palette tones. CSS picks the light or dark one through --hit-duo.
 */
const DUOTONES = {
  // moss → sage → sage-soft
  light: { r: '0.184 0.435 0.863', g: '0.290 0.541 0.902', b: '0.169 0.373 0.812' },
  // dark sage-soft → sage → soft sage
  dark: { r: '0.173 0.561 0.663', g: '0.196 0.651 0.749', b: '0.149 0.494 0.588' },
};

const HowIThinkSection = (_props: { theme: 'dark' | 'light' }) => (
  // Left-anchored and capped, so leftover page width can't open a dead zone
  // between the graph and the illustration. Side by side only from lg; on
  // tablets the illustration stacks below the graph, and on phones above it.
  <div className="flex flex-col lg:flex-row lg:gap-20 lg:items-center lg:max-w-[920px]">
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      {(['light', 'dark'] as const).map((mode) => (
        <filter key={mode} id={`hit-duo-${mode}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.7" intercept="-0.2" />
            <feFuncG type="linear" slope="1.7" intercept="-0.2" />
            <feFuncB type="linear" slope="1.7" intercept="-0.2" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" tableValues={DUOTONES[mode].r} />
            <feFuncG type="table" tableValues={DUOTONES[mode].g} />
            <feFuncB type="table" tableValues={DUOTONES[mode].b} />
          </feComponentTransfer>
        </filter>
      ))}
    </svg>
    <figure className="hit-art w-full max-w-[220px] sm:max-w-[300px] mx-auto mb-8 sm:mb-0 sm:mt-10 lg:mt-0 sm:order-2 lg:flex-none lg:mr-0 lg:ml-auto lg:w-[380px] lg:max-w-[380px]">
      <picture>
        <source srcSet={HOW_I_THINK_IMAGE} media="(prefers-reduced-motion: reduce)" />
        <img src={HOW_I_THINK_GIF} alt="Illustration of a drummer mid-beat" loading="lazy" />
      </picture>
    </figure>

    <div className="w-full lg:w-auto min-w-0 sm:order-1 lg:flex-initial select-none">
      <GitGraph />
    </div>
  </div>
);

// --- My Approach: system diagram ---

type LayerId = 'ui' | 'frontend' | 'api';

interface ApproachStage {
  id: LayerId;
  tag: string;
  detailLabel: string;
  detailDesc: string;
}

/** Top to bottom, the same order a request travels through the diagram. */
const APPROACH_STAGES: ApproachStage[] = [
  {
    id: 'ui',
    tag: 'interface',
    detailLabel: 'ui and interaction design',
    detailDesc: 'design systems, micro-interactions, intuitive interfaces',
  },
  {
    id: 'frontend',
    tag: 'client',
    detailLabel: 'frontend architecture',
    detailDesc: 'scalable react apps, state management, responsive performance',
  },
  {
    id: 'api',
    tag: 'server',
    detailLabel: 'api and backend design',
    detailDesc: 'rest apis, node.js microservices, cloud db integrations',
  },
];

/**
 * One request, staged like a stop-motion set: interface → client → server.
 * Pastel paper panels with soft cut-out shadows, centered title plaques, and
 * everything animated on held frames: the ink lines "boil" a few times a
 * second, panels nudge between frames, and the envelope and JSON chip hop
 * along the wires rather than glide. Hovering a row in the list lifts its
 * panel. Decorative; the list carries the text.
 */

/** Positions 0→1 in `n` held frames, for discrete animateMotion. */
const hopFrames = (n: number) => Array.from({ length: n + 1 }, (_, i) => +(i / n).toFixed(3));

const SystemDiagram: React.FC<{ active: LayerId | null; reduced: boolean }> = ({ active, reduced }) => {
  const zone = (id: LayerId) =>
    `sd-zone${active && active !== id ? ' is-dim' : ''}${active === id ? ' is-on' : ''}`;

  /** Paper panel: soft shadow, pastel card, a lower-edge shade, and a centered plaque. */
  const panel = (y: number, h: number, label: string, tint: string, children: React.ReactNode) => {
    const plaqueW = label.length * 8 + 30;
    return (
      <>
        <rect className="sd-shade" x="13" y={y + 5} width="340" height={h} />
        <g className="sd-lift">
          <g className="sd-jitter">
            <rect className={`sd-panel ${tint}`} x="8" y={y} width="340" height={h} />
            <rect className="sd-panel-shade" x="9" y={y + h - 14} width="338" height="13" />
            {children}
            <rect className="sd-shade" x={180 - plaqueW / 2 + 2} y={y - 8} width={plaqueW} height="18" />
            <rect className="sd-line sd-fill" x={180 - plaqueW / 2} y={y - 10} width={plaqueW} height="18" />
            <rect className="sd-plaque-inner" x={180 - plaqueW / 2 + 3} y={y - 7} width={plaqueW - 6} height="12" />
            <text className="sd-plaque" x="180" y={y + 2.5}>{label}</text>
          </g>
        </g>
      </>
    );
  };

  /** Box with a soft cut-out shadow, so every piece sits under the same light. */
  const block = (x: number, y: number, w: number, h: number, fill = 'sd-fill') => (
    <>
      <rect className="sd-shade" x={x + 3} y={y + 3} width={w} height={h} />
      <rect className={`sd-line ${fill}`} x={x} y={y} width={w} height={h} />
    </>
  );

  const down = hopFrames(6);
  const roundTrip = [...hopFrames(5), ...hopFrames(5).reverse().slice(1)];

  return (
    <svg className="sd" viewBox="0 0 360 424" aria-hidden="true">
      <defs>
        {/* Line boil: the displacement noise swaps seed on held frames. */}
        <filter id="sd-boil" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2">
            {!reduced && (
              <animate attributeName="seed" values="2;9;15;4" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter="url(#sd-boil)">
        {/* --- Interface: the page someone touches --- */}
        <g className={zone('ui')}>
          {panel(18, 112, 'interface', 'sd-pink', (
            <>
              {block(92, 32, 176, 86)}
              <path className="sd-line" d="M92 45 H268" />
              {[99, 107, 115].map((x) => (
                <rect key={x} className="sd-line sd-fill" x={x} y="36" width="5" height="5" />
              ))}
              <rect className="sd-ink" x="102" y="54" width="66" height="7" />
              <rect className="sd-soft" x="102" y="66" width="78" height="3.5" />
              <rect className="sd-soft" x="102" y="73" width="56" height="3.5" />
              {block(102, 86, 50, 17, 'sd-butter')}
              <rect className="sd-soft" x="111" y="93" width="32" height="3" />
              <g className="sd-burst">
                <path d="M156 86 l5 -5 M159 94 h7 M153 81 v-6" />
              </g>
              <path className="sd-cursor" d="M146 94 l0 12 l3.2 -3.2 l2.6 5 l2 -1 l-2.6 -4.8 l4.6 0 z" />
              {block(184, 54, 72, 52, 'sd-sky')}
              <circle className="sd-line sd-butter" cx="241" cy="66" r="5" />
              <path className="sd-line sd-mint" d="M185 105 L205 81 L218 94 L229 84 L255 105 Z" />
            </>
          ))}
        </g>

        <path id="sd-wire-1" className="sd-wire" d="M180 136 V164" />
        <path className="sd-arrow" d="M175 158 L180 165 L185 158" />
        <path className="sd-line sd-fill" d="M196 138 H284 V156 H204 L196 162 Z" />
        <text className="sd-note" x="203" y="150.5">click → render</text>

        {/* --- Client: the component tree --- */}
        <g className={zone('frontend')}>
          {panel(172, 102, 'client', 'sd-butter-pale', (
            <>
              <path className="sd-line" d="M180 209 V219 M100 219 H260 M100 219 V232 M180 219 V232 M260 219 V232" />
              {block(144, 186, 72, 23, 'sd-pink')}
              <text className="sd-code sd-code-strong" x="180" y="201.5">{'<App />'}</text>
              {[
                { x: 64, label: '<Nav />' },
                { x: 144, label: '<Feed />' },
                { x: 224, label: '<Form />' },
              ].map((n) => (
                <g key={n.label}>
                  {block(n.x, 232, 72, 23)}
                  <text className="sd-code" x={n.x + 36} y="247.5">{n.label}</text>
                </g>
              ))}
            </>
          ))}
        </g>

        <path id="sd-wire-2" className="sd-wire" d="M180 280 V308" />
        <path className="sd-arrow" d="M175 286 L180 279 L185 286" />
        <path className="sd-arrow" d="M175 302 L180 309 L185 302" />
        <path className="sd-line sd-fill" d="M196 282 H282 V300 H204 L196 306 Z" />
        <text className="sd-note" x="203" y="294.5">fetch ⇄ json</text>

        {/* --- Server: API in front of a (friendly) database --- */}
        <g className={zone('api')}>
          {panel(316, 100, 'server', 'sd-sky-pale', (
            <>
              {block(104, 330, 110, 72)}
              <path className="sd-line" d="M104 354 H214 M104 378 H214" />
              {[342, 366, 390].map((y, i) => (
                <g key={y}>
                  <rect className="sd-line sd-led" x="113" y={y - 3} width="6" height="6" style={{ animationDelay: `${i * 0.375}s` }} />
                  <rect className="sd-soft" x="126" y={y - 2} width="38" height="4" />
                </g>
              ))}
              <text className="sd-code sd-code-start" x="176" y="345">/api</text>
              <path className="sd-wire sd-wire-solid" d="M214 366 H256" />
              <path className="sd-arrow" d="M250 361 L257 366 L250 371" />
              <path className="sd-shade" d="M266 342 V390 A30 8 0 0 0 326 390 V342 Z" />
              <path className="sd-line sd-mint" d="M262 338 V386 A30 8 0 0 0 322 386 V338" />
              <ellipse className="sd-line sd-fill" cx="292" cy="338" rx="30" ry="8" />
              <rect className="sd-ink sd-eye" x="282" y="355" width="3" height="5" />
              <rect className="sd-ink sd-eye" x="298" y="355" width="3" height="5" />
              <path className="sd-line" d="M286 366 Q291.5 371 297 366" fill="none" />
            </>
          ))}
        </g>

        {!reduced && (
          <>
            <g className="sd-packet">
              <rect className="sd-line sd-fill" x="-6" y="-4" width="12" height="8" />
              <path className="sd-line" d="M-6 -4 L0 1 L6 -4" fill="none" />
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                calcMode="discrete"
                keyPoints={[...down, 1].join(';')}
                keyTimes={[...down.map((_, i) => +(i * 0.065).toFixed(3)), 0.9].join(';')}
              >
                <mpath href="#sd-wire-1" />
              </animateMotion>
            </g>
            <g className="sd-packet" visibility="hidden">
              <set attributeName="visibility" to="visible" begin="1.1s" />
              <rect className="sd-line sd-butter" x="-10" y="-6" width="20" height="12" />
              <text className="sd-chip" x="0" y="2.6">{'{}'}</text>
              <animateMotion
                dur="2.8s"
                begin="1.1s"
                repeatCount="indefinite"
                calcMode="discrete"
                keyPoints={[...roundTrip, 0].join(';')}
                keyTimes={[...roundTrip.map((_, i) => +(i * 0.065).toFixed(3)), 0.9].join(';')}
              >
                <mpath href="#sd-wire-2" />
              </animateMotion>
            </g>
          </>
        )}
      </g>
    </svg>
  );
};

const ApproachSection: React.FC<{ theme: 'dark' | 'light'; isInView: boolean }> = ({
  theme,
  isInView,
}) => {
  const { ref, reduced } = useRevealOnce();
  const [active, setActive] = useState<LayerId | null>(null);
  const animClass = `scroll-animate-child ${isInView ? 'animated' : ''}`;

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
      <div className="min-w-0">
        <div className="section-head">
        <SectionHeading theme={theme} isInView={isInView} baseDelay={0}>
          my approach
        </SectionHeading>

        <p
          className={`t-lead font-sans c-secondary ${animClass}`}
          style={{ animationDelay: '160ms' }}
        >
          I build products end to end, from API design to pixel-level UI polish, with a bias toward clean, maintainable code.
        </p>
        </div>

        <ul className="ad-list" onMouseLeave={() => setActive(null)}>
          {APPROACH_STAGES.map((stage, i) => (
            <li
              key={stage.id}
              className={`ad-row ${active === stage.id ? 'is-on' : ''} ${animClass}`}
              style={{ animationDelay: `${240 + i * 60}ms` }}
              onMouseEnter={() => setActive(stage.id)}
            >
              <span className="ad-row-tag font-mono">{stage.tag}</span>
              <div className="min-w-0">
                <h3 className="t-h3 font-sans c-primary">{stage.detailLabel}</h3>
                <p className="t-body font-sans c-secondary mt-1 max-w-[420px] break-words">
                  {stage.detailDesc}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p
          className={`t-label font-mono c-tertiary mt-8 ${animClass}`}
          style={{ animationDelay: '440ms' }}
        >
          design → build → ship, in that order
        </p>
      </div>

      <div className={`flex justify-center md:justify-end ${animClass}`} style={{ animationDelay: '300ms' }}>
        <SystemDiagram active={active} reduced={reduced} />
      </div>
    </div>
  );
};

function useSectionInView() {
  const [isInView, setIsInView] = useState(false);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // A callback ref rather than an effect: sections mount and unmount as views
  // change, and an effect keyed to the App's mount would never see them.
  const ref = React.useCallback((el: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  return [ref, isInView] as const;
}

export default function App() {
  // Delegated UI sounds for the whole site, blog included; set up once.
  useEffect(() => initUiSounds(), []);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Storage blocked — fall back to the system setting.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [showResume, setShowResume] = useState(false);
  const [showBookCall, setShowBookCall] = useState(false);
  // Stable, so the dialog's focus and scroll-lock effect runs once per open.
  const closeBookCall = React.useCallback(() => setShowBookCall(false), []);
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
  const [aboutRef, aboutInView] = useSectionInView();
  const [expRef, expInView] = useSectionInView();
  const [stackRef, stackInView] = useSectionInView();
  const [certRef, certInView] = useSectionInView();

  const blogLocation = useLocation();
  // /work/:slug renders a project page in place of the home sections.
  const workMatch = useMatch('/work/:slug');
  const view = viewForPath(blogLocation.pathname);
  // Home renders every group in order; a nav view renders just its own.
  const shows = (key: string) => view === key || view === 'home';
  const reduceMotion = useReducedMotion();
  const getAnimClass = (inView: boolean) => `scroll-animate-child ${inView ? 'animated' : ''}`;

  const switchTimer = React.useRef<number | undefined>(undefined);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    // Synchronous so a view transition's "after" snapshot sees the new theme,
    // including the canvas and SVG colours that come from React state.
    const apply = () => {
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch {
        // Storage blocked — the choice still applies for this session.
      }
      flushSync(() => setTheme(next));
    };

    if (prefersReducedMotion()) {
      apply();
      return;
    }

    // Preferred: the browser snapshots the page and crossfades old → new on the
    // compositor, so it stays smooth however many elements change colour.
    const startViewTransition = (
      document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
    ).startViewTransition;
    if (startViewTransition) {
      startViewTransition.call(document, apply);
      return;
    }

    // Fallback: ease colours element by element, only while switching.
    root.classList.add('theme-switching');
    window.clearTimeout(switchTimer.current);
    switchTimer.current = window.setTimeout(() => root.classList.remove('theme-switching'), 450);
    apply();
  };

  // Until the visitor picks, follow the system setting live. data-theme stays
  // unset in that case, so the CSS media query and this state agree.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        // Storage blocked — treat as no saved choice.
      }
      if (saved !== 'dark' && saved !== 'light') setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // /blog is a standalone route: its own shell, no sidebar nav, and therefore
  // none of the scroll-spy <-> URL syncing that drives the portfolio page.
  if (blogLocation.pathname.startsWith('/blog')) {
    return <BlogPage theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className={`min-h-screen font-sans text-[15px] selection:bg-zinc-800 selection:text-white lg:flex relative bg-[var(--cream)] text-[var(--ink-body)] selection:bg-[var(--sage-soft)] selection:text-[var(--accent-ink)]`}>
      <CustomCursor />
      <SidebarNavigation
        theme={theme}
        toggleTheme={toggleTheme}
        onBookCall={() => setShowBookCall(true)}
        onOpenResume={() => setShowResume(true)}
        onOpenGame={() => setShowGame(true)}
      />
      <AllProjectsModal isOpen={showAllProjects} onClose={() => setShowAllProjects(false)} projects={WORKS} theme={theme} />
      <ResumeModal isOpen={showResume} onClose={() => setShowResume(false)} theme={theme} />
      <BookCallModal isOpen={showBookCall} onClose={closeBookCall} />
      <HarvestSnakeModal isOpen={showGame} onClose={() => setShowGame(false)} theme={theme} />
      <IntroTour />

      <div className="flex-1 min-w-0">
        <main>
          {workMatch ? (
            findWork(workMatch.params.slug)
              ? <ProjectPage project={findWork(workMatch.params.slug)!} />
              : <NotFoundPage />
          ) : (
          <>
          {/* Each nav key is its own view; home shows them all in one page.
              "How I think" has no nav entry and reads as part of About;
              GitHub activity sits with Work. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              className="view"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
            {view !== 'home' && <ViewBack />}
            {shows('about') && (
              <>
                {/* --- Hero Section --- */}
                <Hero onBookCall={() => setShowBookCall(true)} />

                {/* --- 01 / Overview Section --- */}
                <section id="about" ref={aboutRef} className={`section border-t border-[var(--sand-deep)]`}>
                  <ApproachSection theme={theme} isInView={aboutInView} />
                </section>

                {/* --- How I Think Section --- */}
                <section id="process" className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="section-head">
                    <h2 className="t-h2 c-primary font-cal lowercase">
                      how i think
                    </h2>
                  </div>
                  <HowIThinkSection theme={theme} />
                </section>
              </>
            )}
            {shows('experience') && (
              <>
                {/* --- 02 / Experience Section --- */}
                <section id="experience" ref={expRef} className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="section-head">
                    <SectionHeading theme={theme} isInView={expInView} baseDelay={0}>Experience</SectionHeading>
                    <p
                      className={`t-lead font-sans c-secondary ${getAnimClass(expInView)}`}
                      style={{ animationDelay: '160ms' }}
                    >
                      1+ years of building scalable full-stack applications, modern web interfaces, and digital products.
                    </p>
                  </div>

                  <ol className="xp-list" aria-label="Work history, most recent first">
                    {EXPERIENCES.map((exp, index) => {
                      const isLast = index === EXPERIENCES.length - 1;
                      const isCurrent = exp.end === null;
                      return (
                        <li
                          key={exp.id}
                          className={`xp-item ${isCurrent ? 'is-current' : ''} ${getAnimClass(expInView)}`}
                          style={{ animationDelay: `${240 + index * 60}ms` }}
                        >
                          {/* Timeline rail: logo tile, then the line down to the next role */}
                          <div className="xp-rail" aria-hidden="true">
                            <div className="xp-logo">
                              <ExperienceLogo exp={exp} theme={theme} />
                            </div>
                            {!isLast && <div className="xp-line" />}
                          </div>

                          <article className="xp-body">
                            <header className="xp-head">
                              <div className="min-w-0">
                                <h3 className="xp-role">{exp.role}</h3>
                                <p className="xp-company">
                                  <span className="xp-company-name">{exp.company}</span>
                                  <span aria-hidden="true"> · </span>
                                  {exp.employmentType}
                                  <span aria-hidden="true"> · </span>
                                  {exp.location}
                                </p>
                              </div>

                              <div className="xp-when">
                                <span className="xp-dates">
                                  <time dateTime={exp.start}>{formatYm(exp.start)}</time>
                                  {' – '}
                                  {isCurrent ? 'Present' : <time dateTime={exp.end!}>{formatYm(exp.end!)}</time>}
                                </span>
                                <span className="xp-tenure">
                                  {isCurrent && <span className="xp-now"><i aria-hidden="true" />current</span>}
                                  {formatTenure(exp.start, exp.end)}
                                </span>
                              </div>
                            </header>

                            <p className="xp-summary">{exp.summary}</p>

                            <ul className="xp-highlights">
                              {exp.highlights.map((h) => (
                                <li key={h}>{h}</li>
                              ))}
                            </ul>

                            <div className="xp-stack">
                              <span className="xp-stack-label">stack</span>
                              <ul className="xp-tags" aria-label={`Tools used at ${exp.company}`}>
                                {exp.skills.map((skill) => (
                                  <li key={skill}>{skill.toLowerCase()}</li>
                                ))}
                              </ul>
                            </div>
                          </article>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Experience bottom footer */}
                  <div
                    className={`border-t pt-6 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getAnimClass(expInView)} border-[var(--sand-deep)]`}
                    style={{ animationDelay: `${240 + EXPERIENCES.length * 60}ms` }}
                  >
                    <div className="t-small font-sans c-secondary">
                      Interested in collaborating or discussing technical roles?
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <a
                        href="https://github.com/kellasandyyyy1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors inline-flex items-center gap-2 t-mono font-mono lowercase whitespace-nowrap shrink-0 group text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
                      >
                        <NavIcon3D name="github" size={18} />
                        <span>github</span>
                        <ArrowUpRight weight="light" size={14} className={
                          'text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]'
                        } />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors inline-flex items-center gap-2 t-mono font-mono lowercase whitespace-nowrap shrink-0 group text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
                      >
                        <NavIcon3D name="linkedin" size={18} />
                        <span>LINKEDIN</span>
                        <ArrowUpRight weight="light" size={14} className={
                          'text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]'
                        } />
                      </a>
                      <button
                        data-sound="primary" onClick={() => setShowBookCall(true)}
                        className={`transition-colors inline-flex items-center gap-2 t-mono font-mono lowercase whitespace-nowrap shrink-0 cursor-pointer group text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
                      >
                        <NavIcon3D name="calendar" size={18} />
                        <span>BOOK CALL</span>
                        <ArrowUpRight weight="light" size={14} className={
                          'text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]'
                        } />
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
            {shows('stack') && (
              <>
                {/* --- 03 / Stack Section --- */}
                <section id="stack" ref={stackRef} className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="section-head">
                    <SectionHeading theme={theme} isInView={stackInView} baseDelay={0}>My Tech Stack</SectionHeading>
                    <p
                      className={`t-lead font-sans ${getAnimClass(stackInView)} text-[var(--accent-ink)]`}
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
                        <div className={`t-label font-mono uppercase mb-2.5 select-none border-b pb-1.5 c-tertiary border-[var(--sand-deep)]`}>
                          {group.category}
                        </div>

                        {/* Tool rows within column */}
                        <div className="flex flex-col">
                          {group.tools.map((tool, idx) => {
                            const isLastInGroup = idx === group.tools.length - 1;
                            return (
                              <div
                                key={tool.name}
                                className={`flex items-center py-[9px] transition-colors px-0.5 hover:bg-[var(--hover-fill)] ${isLastInGroup ? '' : ('border-b border-[var(--sand-deep)]')
                                  }`}
                              >
                                {/* Left: Icon + Tool Name */}
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  {tool.customIcon ? (
                                    tool.customIcon
                                  ) : tool.iconClass ? (
                                    <i className={`${tool.iconClass} text-[14px] shrink-0 opacity-90`} />
                                  ) : (
                                    <Cpu size={14} className={`shrink-0 text-[var(--ink-muted)]`} />
                                  )}
                                  <span className={`t-body font-sans truncate c-primary`}>
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
              </>
            )}
            {shows('certifications') && (
              <>
                {/* --- Certifications Section --- */}
                <section id="certifications" ref={certRef} className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="section-head flex items-start justify-between gap-8">
                    <div className="min-w-0">
                      <h2
                        className={`t-h2 c-primary font-cal lowercase ${getAnimClass(certInView)}`}
                        style={{ animationDelay: '80ms' }}
                      >
                        certifications
                      </h2>
                      <p
                        className={`t-lead font-sans c-secondary ${getAnimClass(certInView)}`}
                        style={{ animationDelay: '160ms' }}
                      >
                        verified industry certifications and technical credentials issued by official platforms.
                      </p>
                    </div>
                  </div>

                  {/* No outer border, no card fills: only the dividers between columns. */}
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    {CERTIFICATIONS.map((cert, index) => (
                      <a
                        key={cert.id}
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${cert.title}, issued by ${cert.issuer}`}
                        className={`group relative isolate overflow-hidden flex flex-col items-center text-center px-6 py-10 md:py-4 ${getAnimClass(certInView)} ${
                          // Divider between columns only: never on the outside, never when stacked.
                          index > 0
                            ? `md:border-l md:border-[var(--sand-deep)]`
                            : ''
                          }`}
                        style={{ animationDelay: `${240 + index * 80}ms` }}
                      >
                        {/* Brand watermark. Decorative, sits behind the cell's own
                            content and is clipped so it never crosses a divider. */}
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-0 -z-10 flex items-center justify-center text-[var(--ink)]`}
                          style={{ opacity: theme === 'light' ? 0.045 : 0.06 }}
                        >
                          <cert.Icon size={190} />
                        </span>

                        <span
                          className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 border-[0.5px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 border-[var(--sand-deep)] text-[var(--ink)]`}
                        >
                          <cert.Icon size={17} />
                        </span>

                        <h3 className="t-h3 font-sans c-primary mt-5">
                          {cert.title}
                        </h3>

                        <span className={`inline-flex items-center gap-1.5 t-label font-mono lowercase mt-2 transition-colors duration-200 ease-out text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]`}>
                          {cert.issuer}
                          <ArrowUpRight weight="light" size={11} className="shrink-0" />
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              </>
            )}
            {shows('work') && (
              <>
                {/* --- Projects Section --- */}
                <section id="projects" className={`section border-t select-none overflow-hidden border-[var(--sand-deep)]`}>
                  <div className="section-head flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      {/* The toggle sits on the heading's own line so it reads as
                          belonging to "my works". It is deliberately NOT grouped with
                          the 01—08 page indicator, which is unrelated and stays far
                          right on its own. */}
                      <div className="flex items-center gap-3 md:gap-4">
                        <h2 className="t-h2 c-primary font-cal lowercase">
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

                    <span className={`shrink-0 flex items-center gap-1 t-label font-mono text-[var(--ink-muted)]`}>
                      
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
                        className="works-fade wk-grid"
                      >
                        {WORKS.map((project) => (
                          <WorkCard key={project.slug} project={project} />
                        ))}
                      </div>
                    )}

                    {worksView === 'list' && (
                      // Capped so rows don't stretch to absurd line lengths on wide
                      // screens; matches the max-width convention used elsewhere.
                      <div key="works-list" className="wl-list">
                        {WORKS.map((project, index) => (
                          <WorkRow key={project.slug} project={project} index={index} />
                        ))}
                      </div>
                    )}

                    {/* Browse all row — shared by both views. In grid view it needs its
                        own top edge; in list view it inherits one from the row above. */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`wk-all ${worksView === 'grid' ? 'is-grid' : ''}`}
                      onClick={() => setShowAllProjects(true)}
                    >
                      <span className="wk-all-label">browse all</span>

                      <span className="wk-all-end">
                        <span className="wk-all-tag">all</span>
                        <ArrowUpRight weight="light" size={13} className="wk-arrow" />
                      </span>
                    </motion.div>
                  </div>
                </section>

                {/* --- GitHub Section --- */}
                <section id="github" className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="max-w-[640px]">
                    <GithubSection />
                  </div>
                </section>
              </>
            )}
            {shows('services') && (
              <>
                {/* --- Services Section --- */}
                <section id="services" className="section sv-section border-t border-[var(--sand-deep)]">
                  <SectionHeading className="section-head" theme={theme}>Services</SectionHeading>
                  <ServicesDiagram services={SERVICE_FLOW} duotones={SERVICE_DUOTONES} />

                  <div className="sv-cta">
                    <p className="sv-cta-text font-cal">have a project in mind?</p>
                    {/* Same anatomy as the hero links: 3D object, mono label, nudging arrow. */}
                    <button
                      type="button"
                      className="sv-cta-link"
                      data-sound="primary" onClick={() => setShowBookCall(true)}
                    >
                      <span className="sv-cta-obj" aria-hidden="true">
                        <NavIcon3D name="calendar" size={22} />
                      </span>
                      book a call <span className="sv-cta-arrow" aria-hidden="true">↗</span>
                    </button>
                  </div>
                </section>
              </>
            )}
            {shows('resources') && (
              <>
                {/* --- Resources Section --- */}
                <section id="resources" className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="section-head">
                    <h2 className="t-h2 c-primary font-cal lowercase">
                      resources
                    </h2>
                    <p className="t-lead font-sans c-secondary">
                      the courses, docs, and writing i actually go back to. curated, not collected.
                    </p>
                  </div>

                  <ResourcesGrid theme={theme} />
                </section>
              </>
            )}
            {shows('contact') && (
              <>
                {/* --- Contact Section --- */}
                <section id="contact" className={`section border-t border-[var(--sand-deep)]`}>
                  <div className="mb-4">
                    <span className="t-label font-mono uppercase block c-tertiary">
                      CONTACT
                    </span>
                                </div>

                  <div className="ct-layout">
                  <figure className="ct-art">
                    {/* Same photocopy grain as the hero, tuned for line art: solid ink
                        below 70 keeps the outlines crisp, 70–200 turns the grey shading
                        to toner, paper is clear so the section texture shows through,
                        and the bottom 30% dissolves into specks. Ink follows the
                        heading colour in either theme. Every GIF frame is processed. */}
                    <XeroxPortrait
                      src="/gif/brooding_recline.gif"
                      alt="Illustration of a figure reclining on a phone call, cigarette in mouth"
                      aspectRatio={1538 / 1022}
                      inkColor="var(--text-primary)"
                      paperColor="transparent"
                      noiseAmount={30}
                      thresholdRange={[110, 150]}
                      solidBelow={70}
                      paperAbove={200}
                      grainSize={2}
                      seed={7}
                      fadeFrom={0.7}
                      animate
                      hoverReseed={false}
                    />
                  </figure>

                  <div className="max-w-[560px] space-y-7">
                    <h3 className="t-h2 font-cal c-primary">
                      Have a project in mind? Let's talk.
                    </h3>

                    <div>
                      <a
                        href="mailto:kellasandrei00@gmail.com"
                        className={`inline-block t-lead font-sans transition-colors border-b pb-2 text-[var(--ink)] hover:text-[var(--accent-ink)] border-[var(--sand-deep)]`}
                      >
                        kellasandrei00@gmail.com
                      </a>
                    </div>

                    {/* Actions row: text links with icons on left & arrow on right */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 pt-3">
                      <button
                        data-sound="primary" onClick={() => setShowBookCall(true)}
                        className={`transition-colors inline-flex items-center gap-2 t-mono font-mono lowercase cursor-pointer group text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
                      >
                        <NavIcon3D name="calendar" size={18} />
                        <span>BOOK A CALL</span>
                        <ArrowUpRight weight="light" size={14} className={
                          'text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]'
                        } />
                      </button>

                      <a
                        href="https://github.com/kellasandyyyy1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors inline-flex items-center gap-2 t-mono font-mono lowercase group text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
                      >
                        <NavIcon3D name="github" size={18} />
                        <span>github</span>
                        <ArrowUpRight weight="light" size={14} className={
                          'text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]'
                        } />
                      </a>

                      <a
                        href="https://www.linkedin.com/in/andrei-wayne-kellas-03a6153a4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`transition-colors inline-flex items-center gap-2 t-mono font-mono lowercase group text-[var(--ink-body)] hover:text-[var(--accent-ink)]`}
                      >
                        <NavIcon3D name="linkedin" size={18} />
                        <span>LINKEDIN</span>
                        <ArrowUpRight weight="light" size={14} className={
                          'text-[var(--ink-muted)] group-hover:text-[var(--accent-ink)]'
                        } />
                      </a>
                    </div>
                  </div>
                  </div>
                </section>
              </>
            )}
            </motion.div>
          </AnimatePresence>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
