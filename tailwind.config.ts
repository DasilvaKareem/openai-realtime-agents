import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SNES Synthesizer Color System
        'snes-bg-primary': 'var(--bg-primary)',
        'snes-bg-secondary': 'var(--bg-secondary)',
        'snes-border': 'var(--border)',
        'snes-text-primary': 'var(--text-primary)',
        'snes-text-secondary': 'var(--text-secondary)',
        'snes-text-muted': 'var(--text-muted)',
        'snes-accent-green': 'var(--accent-green)',
        'snes-accent-green-hover': 'var(--accent-green-hover)',
        'snes-accent-red': 'var(--accent-red)',
        'snes-border-dark': 'var(--border-dark)',
        
        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'snes-header': ['Orbitron', 'Chicago', 'Arial Black', 'sans-serif'],
        'snes-body': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'monospace'],
        'snes-label': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      letterSpacing: {
        'snes-wide': '2px',
        'snes-medium': '1px',
        'snes-tight': '0.5px',
      },
      borderRadius: {
        'snes': '6px',
        'snes-sm': '4px',
      },
      boxShadow: {
        'snes-panel': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'snes-button': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'snes-led': '0 0 8px var(--accent-green-hover), 0 0 16px rgba(124, 252, 0, 0.2)',
        'snes-led-strong': '0 0 12px var(--accent-green-hover), 0 0 24px rgba(124, 252, 0, 0.3)',
      },
      animation: {
        'snes-pulse': 'snes-pulse 2s infinite',
        'snes-pulse-fast': 'snes-pulse 1.5s infinite',
      },
      keyframes: {
        'snes-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 8px var(--accent-green-hover), 0 0 16px rgba(124, 252, 0, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 16px var(--accent-green-hover), 0 0 32px rgba(124, 252, 0, 0.4)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
