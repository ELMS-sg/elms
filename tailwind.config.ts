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
        // Primary colors - more muted blue
        primary: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bbd6fe',
          300: '#90b8fd',
          400: '#609afa',
          500: '#3b82f6', // Main primary color - more muted
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Accent colors - less saturated
        accent: {
          green: {
            light: '#f0fdf4',
            DEFAULT: '#22c55e', // Less saturated green
            dark: '#16a34a',
          },
          yellow: {
            light: '#fefce8',
            DEFAULT: '#eab308', // Less saturated yellow
            dark: '#ca8a04',
          },
          red: {
            light: '#fef2f2',
            DEFAULT: '#ef4444', // Less saturated red
            dark: '#dc2626',
          },
        },
        // Background and text colors - more subtle
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: '#ffffff',
          hover: '#f8fafc',
        },
      },
      borderRadius: {
        'xl': '0.75rem', // Reduced from 1rem
        '2xl': '1rem',   // Reduced from 1.5rem
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)', // More subtle shadow
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Less pronounced hover shadow
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
