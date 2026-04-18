import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        memeos: {
          bg: '#0a0e17',
          surface: '#0f1520',
          'surface-light': '#151d2e',
          border: '#1e293b',
          cyan: '#00e5ff',
          'cyan-dim': '#00e5ff33',
          violet: '#8b5cf6',
          'violet-dim': '#8b5cf633',
          amber: '#f59e0b',
          'amber-dim': '#f59e0b33',
          emerald: '#10b981',
          'emerald-dim': '#10b98133',
          red: '#ef4444',
          'red-dim': '#ef444433',
          text: '#e2e8f0',
          'text-dim': '#64748b',
          'text-muted': '#475569',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.15)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
