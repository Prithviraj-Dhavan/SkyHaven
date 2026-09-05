/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        skynavy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#627d98',
          500: '#334e68',
          600: '#243b53',
          700: '#102a43',
          800: '#0b1d33',
          850: '#071628',
          900: '#05203C',
          950: '#02122c',
        },
        skycraft: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec2ff',
          400: '#599eff',
          500: '#0062E3',
          600: '#0051c7',
          700: '#003fa1',
          800: '#053582',
          900: '#0a2e6b',
        },
        skyteal: {
          50: '#e6f7f6',
          100: '#ccefed',
          500: '#00A698',
          600: '#008e82',
        },
        skycyan: {
          500: '#00B2D6',
        },
        skyamber: {
          500: '#FFB600',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0062E3',
          600: '#0051c7',
          700: '#003fa1',
          800: '#075985',
          900: '#05203C',
          950: '#02122c',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Space Grotesk"', 'sans-serif'],
        heading: ['"Space Grotesk"', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'sky': '0 4px 14px 0 rgba(0, 98, 227, 0.25)',
        'sky-lg': '0 10px 30px -4px rgba(0, 98, 227, 0.35)',
        'card-sky': '0 2px 8px 0 rgba(2, 18, 44, 0.08)',
        'card-hover': '0 12px 32px -8px rgba(2, 18, 44, 0.16)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-mesh': 'radial-gradient(at 10% 20%, rgba(0, 98, 227, 0.18) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(0, 178, 214, 0.18) 0px, transparent 50%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
