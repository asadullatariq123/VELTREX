/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VELTREX Earth Intelligence - Light Glacier & Cobalt Palette
        veltrex: {
          porcelain: '#F8F9FA',
          surface: '#FFFFFF',
          cobalt: '#0F2C59',
          cobaltLight: '#1E3A8A',
          glacier: '#E0F2FE',
          glacierBorder: '#BAE6FD',
          mineral: '#059669',
          amber: '#D97706',
          vermillion: '#DC2626',
          muted: '#64748B',
          grid: '#E2E8F0',
          blue: '#00F0FF',
        },
        navy: {
          700: '#1E293B',
          750: '#152035',
          800: '#0F172A',
          900: '#0B132B',
          950: '#060B19',
        },
        risk: {
          low: '#059669',
          moderate: '#D97706',
          high: '#EA580C',
          critical: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'scan-line': 'scanLine 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

