/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#050608",
        foreground: "#F4F4F5"
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 0, 0, 0.35)"
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite'
      },

    }
  },
  plugins: []
};
