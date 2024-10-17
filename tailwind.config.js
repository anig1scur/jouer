/** @type {import('tailwindcss').Config} */
module.exports = {
  mod: "jit",
  content: ["./app/client/index.html", "./app/client/**/*.{css,ts,tsx}"],
  darkMode: ['media', "class"],
  theme: {
    extend: {},
  },
  plugins: [],
}
