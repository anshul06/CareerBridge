import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // DSU CareerBridge Brand
        brand: {
          tan: '#d2b48c',
          'tan-50': '#faf6f0',
          'tan-100': '#f4ebde',
          'tan-200': '#e8d5be',
          'tan-300': '#dcc19e',
          'tan-400': '#d2b48c',
          'tan-500': '#c4a07a',
          'tan-600': '#b08860',
          oxford: '#002147',
          'oxford-50': '#e6edf5',
          'oxford-100': '#c0d0e3',
          'oxford-200': '#8aabce',
          'oxford-300': '#5486b8',
          'oxford-400': '#1e61a3',
          'oxford-500': '#002147',
          'oxford-600': '#001a39',
          'oxford-700': '#00122b',
        },
        // Semantic colors (CSS variable driven for dark mode)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Match score colors
        match: {
          high: '#16a34a',
          medium: '#d97706',
          low: '#dc2626',
          'high-bg': '#f0fdf4',
          'medium-bg': '#fffbeb',
          'low-bg': '#fef2f2',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,33,71,0.08), 0 1px 3px 0 rgba(0,33,71,0.04)',
        'card-lg': '0 10px 30px -5px rgba(0,33,71,0.10)',
        sidebar: '2px 0 20px 0 rgba(0,33,71,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #002147 0%, #0a3060 50%, #1e61a3 100%)',
        'tan-gradient': 'linear-gradient(135deg, #faf6f0 0%, #f4ebde 50%, #e8d5be 100%)',
        'hero-gradient': 'linear-gradient(135deg, #002147 0%, #003670 60%, #002147 100%)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        shimmer: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
