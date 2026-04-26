/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b1326',
        'surface-dim': '#0b1326',
        'surface-bright': '#31394d',
        'surface-container-lowest': '#060e20',
        'surface-container-low': '#131b2e',
        'surface-container': '#171f33',
        'surface-container-high': '#222a3d',
        'surface-container-highest': '#2d3449',
        'surface-variant': '#2d3449',
        'on-background': '#dae2fd',
        'on-surface': '#dae2fd',
        'on-surface-variant': '#c7c4d7',
        'outline': '#908fa0',
        'outline-variant': '#464554',
        tertiary: '#ddb7ff',
        'tertiary-container': '#b76dff',
        secondary: '#89ceff',
        'secondary-container': '#00a2e6',
        error: '#ffb4ab',
        primary: {
          DEFAULT: '#c0c1ff',
          50: '#f0efff',
          100: '#e1e0ff',
          200: '#c0c1ff',
          300: '#a8a9ff',
          400: '#8083ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#494bd6',
          800: '#3730a3',
          900: '#1000a9'
        },
        'primary-container': '#8083ff',
        'on-primary': '#1000a9',
        'inverse-primary': '#494bd6',
        slate: {
          950: '#080b14'
        },
        surface: {
          base: '#070a12',
          raised: '#0f1525',
          bright: '#18233f',
          line: '#233253'
        },
        success: '#2dd4bf',
        warning: '#f59e0b',
        danger: '#f43f5e'
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
        panel: '20px',
        card: '16px',
        pill: '999px',
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
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
