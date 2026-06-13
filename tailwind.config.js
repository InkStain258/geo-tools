/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        geo: {
          green: '#2E7D32',
          'green-light': '#4CAF50',
          'green-dark': '#1B5E20',
          blue: '#1565C0',
          'blue-light': '#1E88E5',
          'blue-dark': '#0D47A1',
          orange: '#F57C00',
          'orange-light': '#FF9800',
          bg: '#FAFAFA',
          card: '#FFFFFF',
          text: '#212121',
          'text-secondary': '#757575',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};
