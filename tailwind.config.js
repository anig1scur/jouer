/** @type {import('tailwindcss').Config} */
module.exports = {
  mod: "jit",
  content: ["./app/client/index.html", "./app/client/**/*.{css,ts,tsx}"],
  darkMode: ['media', "class"],
  theme: {
    extend: {
      animation: {
        'slidein': 'slidein 45s linear infinite',
      },
      keyframes: {
        slidein: {
          '0%': { backgroundPosition: 'top' },
          '100%': { backgroundPosition: '-200px 300px' },
        },
      },
      screens: {
        'retina': { 'min-device-pixel-ratio': 1.5 },
      },
      colors: {
        'bgc': '#FFE6BD',
        'primary': '#F69C6C',
        'secondary': '#D1714A',
        'cbg': '#E2976F',
        'text': '#FFEDD7',
        'dtext': '#70422F'
      },
      backgroundImage: {
        "bg": "url('./assets/imgs/bg.png')",
        "wave": "url('./assets/imgs/wave.svg')",
        "dice": "url('./assets/imgs/dice.svg')",
        "face": "url('./assets/imgs/face.svg')",
        "hand": "url('./assets/imgs/hand.png')",
        "score": "url('./assets/imgs/score.png')",
        "rules": "url('./assets/imgs/rules.png')",
      },
      fontFamily: {
        "kreon": ["Kreon", "sans-serif"],
        "jmadh": ["jmadh", "sans-serif"],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
