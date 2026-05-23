import type { ReactNode } from 'react';
import { siClaude, siCline, siGooglegemini, siMoonshotai } from 'simple-icons';
import gooseLogo from '../assets/logos/goose-logo-light.png';
import Monogram from './Monogram';

const SIZES = { sm: 28, md: 36, lg: 44 };
const ICON_SIZES = { sm: 14, md: 18, lg: 22 };

type IconDef = { bg: string; icon: (sz: number) => ReactNode };

const ICONS: Record<string, IconDef> = {
  'claude-code': {
    bg: '#D97757',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siClaude.path} />
      </svg>
    ),
  },
  'codex': {
    bg: '#F8FAFF',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="codexCloud" x1="18" y1="9" x2="46" y2="57" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#D9C8FF" />
            <stop offset="0.5" stopColor="#5A78FF" />
            <stop offset="1" stopColor="#252BFF" />
          </linearGradient>
          <filter id="codexSoftShadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2945FF" floodOpacity="0.25" />
          </filter>
        </defs>
        <path
          filter="url(#codexSoftShadow)"
          d="M17.5 47.2C11.2 45.4 7 39.6 7 32.9c0-7.9 5.9-14.5 13.6-15.4C24.1 10.7 31 6.6 38.5 8c4.8.9 9 3.8 11.5 7.9 8.2.5 14.6 7.3 14.6 15.7 0 7.6-5.4 14.2-12.8 15.5-2.1 6-7.8 10-14.3 10-3.6 0-7.1-1.3-9.8-3.6-4.1 1.5-8.7.4-11.8-2.8-1-1.1-1-2.4 1.6-3.5Z"
          fill="url(#codexCloud)"
        />
        <path d="M25 24l7 8-7 8" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M39 40h10" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    ),
  },
  'gemini-cli': {
    bg: '#4285F4',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siGooglegemini.path} />
      </svg>
    ),
  },
  'kimi-cli': {
    bg: '#0F172A',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siMoonshotai.path} />
      </svg>
    ),
  },
  'aider': {
    bg: '#020403',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 64 64" fill="none" shapeRendering="crispEdges">
        <defs>
          <linearGradient id="aiderBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#071E18" />
            <stop offset="1" stopColor="#02100D" />
          </linearGradient>
          <linearGradient id="aiderPixel" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00FF93" />
            <stop offset="1" stopColor="#00E573" />
          </linearGradient>
          <pattern id="aiderScan" width="64" height="8" patternUnits="userSpaceOnUse">
            <rect width="64" height="4" fill="rgba(0,255,150,0.06)" />
          </pattern>
        </defs>
        <rect width="64" height="64" rx="13" fill="url(#aiderBg)" />
        <rect width="64" height="64" rx="13" fill="url(#aiderScan)" />
        <g filter="drop-shadow(0 0 2px rgba(0,255,145,0.65))">
          <rect x="23" y="10" width="17" height="8" fill="url(#aiderPixel)" />
          <rect x="39" y="18" width="8" height="18" fill="url(#aiderPixel)" />
          <rect x="22" y="27" width="17" height="8" fill="url(#aiderPixel)" />
          <rect x="16" y="36" width="6" height="9" fill="url(#aiderPixel)" />
          <rect x="22" y="44" width="17" height="8" fill="url(#aiderPixel)" />
          <rect x="47" y="45" width="6" height="7" fill="url(#aiderPixel)" />
        </g>
      </svg>
    ),
  },
  'cline': {
    bg: '#0277BD',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="white">
        <path d={siCline.path} />
      </svg>
    ),
  },
  'goose': {
    bg: '#FFFFFF',
    icon: (sz) => {
      const px = Math.round(sz * 1.45);
      return <img src={gooseLogo} alt="" width={px} height={px} style={{ display: 'block', objectFit: 'contain' }} />;
    },
  },
  'antigravity': {
    bg: '#F7F9FF',
    icon: (sz) => (
      <svg width={sz} height={sz} viewBox="0 0 112 112" fill="none">
        <defs>
          <linearGradient id="antigravityMark" x1="23" y1="22" x2="91" y2="94" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00B95C" />
            <stop offset="0.33" stopColor="#FFE432" />
            <stop offset="0.66" stopColor="#FC413D" />
            <stop offset="1" stopColor="#3186FF" />
          </linearGradient>
        </defs>
        <path
          d="M89.6992 93.695C94.3659 97.195 101.366 94.8617 94.9492 88.445C75.6992 69.7783 79.7825 18.445 55.8659 18.445C31.9492 18.445 36.0325 69.7783 16.7825 88.445C9.78251 95.445 17.3658 97.195 22.0325 93.695C40.1159 81.445 38.9492 59.8617 55.8659 59.8617C72.7825 59.8617 71.6159 81.445 89.6992 93.695Z"
          fill="url(#antigravityMark)"
        />
      </svg>
    ),
  },
};

interface Props {
  id: string;
  mono: string;
  hue: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CliIcon({ id, mono, hue, size = 'md' }: Props) {
  const def = ICONS[id];
  const px = SIZES[size];
  const iconSz = ICON_SIZES[size];

  if (!def) {
    return <Monogram mono={mono} hue={hue} size={size} />;
  }

  return (
    <div style={{
      width: px, height: px, borderRadius: 8,
      background: def.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {def.icon(iconSz)}
    </div>
  );
}
