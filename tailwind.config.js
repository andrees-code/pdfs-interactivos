/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#faf8f5',
        'surface-dim': '#f2ede8',
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fdf9f5',
        'surface-container': '#f9f4ee',
        'surface-container-high': '#f3ece4',
        'surface-container-highest': '#ece4da',
        'surface-variant': '#ece4da',
        'on-background': '#0a0604',
        'on-surface': '#0a0604',
        'on-surface-variant': '#3d1a00',
        'outline': '#a07040',
        'outline-variant': '#e0c8a8',
        tertiary: '#fbbf24',
        'tertiary-container': '#d97706',
        secondary: '#fdba74',
        'secondary-container': '#ea580c',
        error: '#fca5a5',
        primary: {
          DEFAULT: '#ea580c',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        'primary-container': '#f97316',
        'on-primary': '#7c2d12',
        'inverse-primary': '#c2410c',
        slate: {
          950: '#faf8f5'
        },
        surface: {
          base: '#faf8f5',
          raised: '#ffffff',
          bright: '#f9f4ee',
          line: '#ead8c4'
        },
        success: '#4ade80',
        warning: '#fbbf24',
        danger: '#f87171'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
        'headline-md': ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
        'headline-lg': ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
        'display-xl': ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui'],
        'label-caps': ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
        'body-md': ['Inter', 'ui-sans-serif', 'system-ui'],
        'body-lg': ['Inter', 'ui-sans-serif', 'system-ui'],
        'code-sm': ['Monaco', 'Menlo', 'monospace']
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
        'toolbar-height': '64px',
        'sidebar-width': '280px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        gutter: '24px',
        'margin-safe': '40px'
      },
      borderRadius: {
        panel: '10px',
        card: '8px',
        pill: '999px',
        DEFAULT: '4px',
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
        full: '9999px'
      },
      boxShadow: {
        panel: '0 24px 64px rgba(2, 6, 23, 0.45)',
        glow: '0 0 0 1px rgba(63, 103, 255, 0.25), 0 18px 45px rgba(63, 103, 255, 0.35)'
      },
      fontSize: {
        'display-xl': ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['2.4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-lg': ['1.05rem', { lineHeight: '1.75' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-lg': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'code-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }]
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
