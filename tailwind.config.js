/** @type {import('tailwindcss').Config} */
module.exports = {
  mod: "jit",
  content: ["./app/client/index.html", "./app/client/**/*.{css,ts,tsx}"],
  darkMode: ['media', "class"],
  theme: {
    extend: {
      colors: {
        'bgc': '#FFE6BD',
        'primary': '#F69C6C',
        'secondary': '#D1714A',
        'text': '#FFEDD7',
        'dtext': '#70422F'
      },
      backgroundImage: {
        "bg": "url('./assets/imgs/bg.svg')",
        "wave": "url('./assets/imgs/wave.svg')",
        "dice": "url('./assets/imgs/dice.svg')",
        "face": "url('./assets/imgs/face.svg')",
        "hand": "url('./assets/imgs/hand.png')",
        "score": "url('./assets/imgs/score.png')",
        "rule": "url('./assets/imgs/rule.png')",
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
