/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gradiente primário iOS 26
        primary: {
          start: '#6E8EFB',
          end: '#A777FF',
        },
        // Cores pastel para colunas
        pastel: {
          pink: '#FFD6E0',
          blue: '#D6E8FF',
          green: '#C1FBA4',
          yellow: '#FFF4B7',
          purple: '#E8D6FF',
          orange: '#FFE4B7',
          teal: '#B7F4E8',
          gray: '#E8E8E8',
        },
        // Cores para liquid glass
        glass: {
          white: 'rgba(255, 255, 255, 0.8)',
          dark: 'rgba(0, 0, 0, 0.1)',
        }
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '10px',
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}