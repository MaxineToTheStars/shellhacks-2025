/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // MindPath Brand Colors
        sage: {
          50: '#f0f4f1',
          100: '#dde6df',
          200: '#bccdc1',
          300: '#8fb096',
          400: '#6b8a73',
          500: '#4B694F', // Primary: Deep Sage Green
          600: '#3d5641',
          700: '#324537',
          800: '#2a382d',
          900: '#1E302B', // Text: Dark Forest
        },
        taupe: {
          50: '#faf8f6',
          100: '#f4f0eb',
          200: '#e8ddd1',
          300: '#DBC5B0', // Secondary: Soft Taupe
          400: '#c9b19a',
          500: '#b89d85',
          600: '#a68a6f',
          700: '#8b735c',
          800: '#725f4d',
          900: '#5d4e40',
        },
        gold: {
          50: '#fdf9f2',
          100: '#faf1e0',
          200: '#f4e0b8',
          300: '#E7C590', // Accent: Warm Gold
          400: '#dbb06a',
          500: '#d19a4a',
          600: '#c2853a',
          700: '#a16d30',
          800: '#82582c',
          900: '#6a4726',
        },
        // Legacy support
        primary: {
          50: '#f0f4f1',
          100: '#dde6df',
          200: '#bccdc1',
          300: '#8fb096',
          400: '#6b8a73',
          500: '#4B694F',
          600: '#3d5641',
          700: '#324537',
          800: '#2a382d',
          900: '#1E302B',
        },
      },
      fontFamily: {
        'sans': ['Avenir Next', 'Montserrat', 'system-ui', 'sans-serif'], // Humanist Sans-Serif for headings
        'serif': ['Merriweather', 'Georgia', 'serif'], // Serif for body text
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}
