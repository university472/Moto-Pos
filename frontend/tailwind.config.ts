// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class', // FIXED: string instead of single-element array
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand Colors (Section 7) ──────────────────────────────────────
        primary: {
          DEFAULT: '#0F5469',
          hover: '#1A7A96',
          foreground: '#FFFFFF'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          foreground: '#1E293B'
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          foreground: '#FFFFFF'
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          foreground: '#FFFFFF'
        },
        // ── Layout Colors (no border here – use CSS variable) ────────────
        background: '#F8FAFC',
        surface: '#FFFFFF',
        // ── Text Colors ───────────────────────────────────────────────────
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        // ── Sidebar ───────────────────────────────────────────────────────
        sidebar: {
          DEFAULT: '#0F172A',
          text: '#CBD5E1',
          hover: '#1E293B',
          active: '#0F5469',
          border: '#1E293B'
        },
        // ── Shadcn/UI CSS variable mappings ───────────────────────────────
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'pos-total': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'pos-product': ['16px', { lineHeight: '1.4', fontWeight: '600' }]
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        pos: '0 0 0 3px rgba(15, 84, 105, 0.15)'
      }
    }
  },
  plugins: [tailwindcssAnimate] // FIXED: import-style plugin
}

export default config
