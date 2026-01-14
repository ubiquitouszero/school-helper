/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Kid-friendly color palette (matches the banner)
      colors: {
        'rainbow': {
          red: '#FF6B6B',
          orange: '#FF9F43',
          yellow: '#FECA57',
          blue: '#48DBFB',
          purple: '#5F27CD',
          violet: '#A55EEA',
          pink: '#FF6B9D',
        },
        'kid': {
          bg: '#FFF5F5',       // Soft background
          text: '#333333',     // Easy to read
          success: '#48DBFB',  // Friendly blue
          error: '#FF6B6B',    // Soft red
        }
      },
      // Kid-friendly fonts
      fontFamily: {
        'fun': ['Comic Sans MS', 'cursive', 'sans-serif'],
        'readable': ['system-ui', '-apple-system', 'sans-serif'],
      },
      // Larger tap targets for kids
      spacing: {
        'tap': '44px',        // Minimum tap target size
        'tap-lg': '56px',     // Larger tap target
      },
      // Rounded corners for friendly feel
      borderRadius: {
        'kid': '12px',
        'kid-lg': '20px',
      },
      // Animation for feedback
      animation: {
        'bounce-small': 'bounce 0.5s ease-in-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'celebrate': 'celebrate 0.6s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        celebrate: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
