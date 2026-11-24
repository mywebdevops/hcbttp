// Site content layer. The hub editor owns public/site-content.json;
// the site renders the built-in defaults from data/brand.ts first,
// then swaps in the published JSON when it loads. Any missing or
// invalid field falls back to the default, so a bad publish can
// never blank the site.
import { useEffect, useState } from 'react';
import { ABOUT, BRAND, SERVICES } from '@/data/brand';

export interface SiteContentService {
  id: string;
  name: string;
  priceLabel: string;
  description: string;
}

export interface SiteTheme {
  colors: Record<string, string>;
  fontPair: string;
  motion: { reveal: boolean; smoothScroll: boolean };
}

export interface SiteBlockField {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

export interface SiteBlock {
  id: string;
  type: string;
  visible: boolean;
  heading?: string;
  text?: string;
  image?: string;
  images?: string[];
  fields?: SiteBlockField[];
}

export const BUILTIN_BLOCK_TYPES = [
  'hero',
  'about',
  'services',
  'treatments',
  'retail',
  'community',
];

const CUSTOM_BLOCK_TYPES = ['text', 'photo-text', 'gallery', 'quote', 'form'];

export const DEFAULT_BLOCKS: SiteBlock[] = BUILTIN_BLOCK_TYPES.map((type) => ({
  id: type,
  type,
  visible: true,
}));

export function mergeBlocks(raw: unknown): SiteBlock[] {
  const seen = new Set<string>();
  const blocks: SiteBlock[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const b = item as Record<string, unknown>;
      const type = String(b.type || '');
      if (!BUILTIN_BLOCK_TYPES.includes(type) && !CUSTOM_BLOCK_TYPES.includes(type)) {
        continue;
      }
      let id = String(b.id || '').trim();
      if (!id) id = BUILTIN_BLOCK_TYPES.includes(type) ? type : `block-${blocks.length + 1}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const block: SiteBlock = { id, type, visible: b.visible !== false };
      if (CUSTOM_BLOCK_TYPES.includes(type)) {
        block.heading = String(b.heading || '');
        block.text = String(b.text || '');
        if (type === 'photo-text') block.image = String(b.image || '');
        if (type === 'gallery') {
          block.images = Array.isArray(b.images)
            ? b.images.filter((x): x is string => typeof x === 'string').slice(0, 12)
            : [];
        }
        if (type === 'form') {
          block.fields = Array.isArray(b.fields)
            ? b.fields
                .filter((f): f is Record<string, unknown> => !!f && typeof f === 'object')
                .slice(0, 10)
                .map((f, i) => ({
                  key: String(f.key || `field-${i + 1}`),
                  label: String(f.label || ''),
                  type: String(f.type || 'text'),
                  required: f.required === true,
                }))
            : [];
        }
      }
      blocks.push(block);
    }
  }
  for (const type of BUILTIN_BLOCK_TYPES) {
    if (!blocks.some((b) => b.type === type)) {
      blocks.push({ id: type, type, visible: true });
    }
  }
  return blocks.slice(0, 20);
}

export interface SiteContent {
  tagline: string;
  serviceArea: string;
  quote: string;
  accolade: string;
  story: { text: string; pull?: boolean }[];
  services: SiteContentService[];
  theme: SiteTheme;
  blocks: SiteBlock[];
}

export const THEME_COLOR_KEYS = [
  'ivory',
  'cream',
  'blush',
  'petal',
  'espresso',
  'bronze',
  'gold',
] as const;

export const DEFAULT_THEME_COLORS: Record<string, string> = {
  ivory: '#FBF7F1',
  cream: '#F4ECE1',
  blush: '#EBCFC6',
  petal: '#F5E1DC',
  espresso: '#2A1D17',
  bronze: '#7A4E33',
  gold: '#A8864F',
};

export interface FontPair {
  id: string;
  display: string;
  body: string;
  displayStack: string;
  bodyStack: string;
}

const googleFontsUrl = (display: string, body: string) =>
  `https://fonts.googleapis.com/css2?family=${display.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;1,400&family=${body.replace(/ /g, '+')}:wght@300;400;500&display=swap`;

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'cormorant-jost',
    display: 'Cormorant Garamond',
    body: 'Jost',
    displayStack: "'Cormorant Garamond', Georgia, serif",
    bodyStack: "'Jost', 'Helvetica Neue', sans-serif",
  },
  {
    id: 'fraunces-work',
    display: 'Fraunces',
    body: 'Work Sans',
    displayStack: "'Fraunces', Georgia, serif",
    bodyStack: "'Work Sans', 'Helvetica Neue', sans-serif",
  },
  {
    id: 'dm-serif-dm-sans',
    display: 'DM Serif Display',
    body: 'DM Sans',
    displayStack: "'DM Serif Display', Georgia, serif",
    bodyStack: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  {
    id: 'libre-source',
    display: 'Libre Baskerville',
    body: 'Source Sans 3',
    displayStack: "'Libre Baskerville', Georgia, serif",
    bodyStack: "'Source Sans 3', 'Helvetica Neue', sans-serif",
  },
];

export const DEFAULT_THEME: SiteTheme = {
  colors: { ...DEFAULT_THEME_COLORS },
  fontPair: 'cormorant-jost',
  motion: { reveal: true, smoothScroll: true },
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function mergeTheme(raw: unknown): SiteTheme {
  const t = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const rawColors =
    t.colors && typeof t.colors === 'object'
      ? (t.colors as Record<string, unknown>)
      : {};
  const colors: Record<string, string> = {};
  for (const key of THEME_COLOR_KEYS) {
    const v = rawColors[key];
    colors[key] =
      typeof v === 'string' && HEX_RE.test(v)
        ? v.toLowerCase()
        : DEFAULT_THEME_COLORS[key];
  }
  const rawMotion =
    t.motion && typeof t.motion === 'object'
      ? (t.motion as Record<string, unknown>)
      : {};
  return {
    colors,
    fontPair: FONT_PAIRS.some((p) => p.id === t.fontPair)
      ? (t.fontPair as string)
      : DEFAULT_THEME.fontPair,
    motion: {
      reveal: rawMotion.reveal !== false,
      smoothScroll: rawMotion.smoothScroll !== false,
    },
  };
}

function hexToRgbChannels(hex: string): string | null {
  if (!HEX_RE.test(hex)) return null;
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Applies a theme to the document. Only colors that differ from the
// built-in defaults get an inline variable, so the site's automatic
// dark mode keeps working for un-customized colors.
export function applyTheme(theme: SiteTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const key of THEME_COLOR_KEYS) {
    const hex = theme.colors[key];
    if (hex && hex.toLowerCase() !== DEFAULT_THEME_COLORS[key].toLowerCase()) {
      const rgb = hexToRgbChannels(hex);
      if (rgb) root.style.setProperty(`--c-${key}`, rgb);
    } else {
      root.style.removeProperty(`--c-${key}`);
    }
  }
  const pair =
    FONT_PAIRS.find((p) => p.id === theme.fontPair) || FONT_PAIRS[0];
  root.style.setProperty('--font-display', pair.displayStack);
  root.style.setProperty('--font-body', pair.bodyStack);
  if (pair.id !== 'cormorant-jost') {
    let link = document.getElementById(
      'hcb-font-pair'
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'hcb-font-pair';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const href = googleFontsUrl(pair.display, pair.body);
    if (link.href !== href) link.href = href;
  }
  root.classList.toggle('no-smooth', !theme.motion.smoothScroll);
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  tagline: BRAND.tagline,
  serviceArea: BRAND.serviceArea,
  quote: ABOUT.quote,
  accolade: ABOUT.accolade,
  story: ABOUT.story.map((p) => ({ ...p })),
  services: SERVICES.map((s) => ({
    id: s.id,
    name: s.name,
    priceLabel: s.priceLabel,
    description: s.description,
  })),
  theme: DEFAULT_THEME,
  blocks: DEFAULT_BLOCKS.map((b) => ({ ...b })),
};

const nonEmpty = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';

export function mergeSiteContent(raw: unknown): SiteContent {
  if (!raw || typeof raw !== 'object') return DEFAULT_SITE_CONTENT;
  const r = raw as Record<string, unknown>;
  const base = DEFAULT_SITE_CONTENT;

  const story =
    Array.isArray(r.story) && r.story.length > 0
      ? r.story
          .map((p, i) => {
            // The hub editor sends plain strings; pull-quote styling
            // is preserved by paragraph position from the defaults.
            if (typeof p === 'string' && nonEmpty(p)) {
              return { text: p, pull: base.story[i]?.pull === true };
            }
            if (
              !!p &&
              typeof p === 'object' &&
              nonEmpty((p as { text?: unknown }).text)
            ) {
              const obj = p as { text: string; pull?: boolean };
              return { text: obj.text, pull: obj.pull === true };
            }
            return null;
          })
          .filter((p): p is { text: string; pull: boolean } => p !== null)
      : base.story;

  const services = base.services.map((svc) => {
    if (!Array.isArray(r.services)) return svc;
    const override = r.services.find(
      (s): s is Record<string, unknown> =>
        !!s && typeof s === 'object' && (s as { id?: unknown }).id === svc.id
    );
    if (!override) return svc;
    return {
      id: svc.id,
      name: nonEmpty(override.name) ? (override.name as string) : svc.name,
      priceLabel: nonEmpty(override.priceLabel)
        ? (override.priceLabel as string)
        : svc.priceLabel,
      description: nonEmpty(override.description)
        ? (override.description as string)
        : svc.description,
    };
  });

  return {
    tagline: nonEmpty(r.tagline) ? (r.tagline as string) : base.tagline,
    serviceArea: nonEmpty(r.serviceArea)
      ? (r.serviceArea as string)
      : base.serviceArea,
    quote: nonEmpty(r.quote) ? (r.quote as string) : base.quote,
    accolade: nonEmpty(r.accolade) ? (r.accolade as string) : base.accolade,
    story: story.length > 0 ? story : base.story,
    services,
    theme: mergeTheme((r as Record<string, unknown>).theme),
    blocks: mergeBlocks((r as Record<string, unknown>).blocks),
  };
}

let cached: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

const listeners = new Set<(c: SiteContent) => void>();

function notify() {
  if (cached) {
    applyTheme(cached.theme);
    listeners.forEach((fn) => fn(cached as SiteContent));
  }
}

// Live draft preview from the hub editor: the editor iframe-posts
// the unsaved content and the page re-renders with it. Only the hub
// origin may do this, and nothing is stored.
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://hub.tabtopro.com') return;
    const data = event.data as
      | { type?: string; content?: unknown }
      | null;
    if (!data || data.type !== 'hcb-preview-content') return;
    cached = mergeSiteContent(data.content);
    notify();
  });
}

export function loadSiteContent(): Promise<SiteContent> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/site-content.json', {
      headers: { accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => {
        cached = raw ? mergeSiteContent(raw) : DEFAULT_SITE_CONTENT;
        applyTheme(cached.theme);
        return cached;
      })
      .catch(() => {
        cached = DEFAULT_SITE_CONTENT;
        return cached;
      });
  }
  return inflight;
}

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(
    cached ?? DEFAULT_SITE_CONTENT
  );
  useEffect(() => {
    let alive = true;
    listeners.add(setContent);
    loadSiteContent().then((c) => {
      if (alive) setContent(c);
    });
    return () => {
      alive = false;
      listeners.delete(setContent);
    };
  }, []);
  return content;
}
