/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6D28D9",
          secondary: "#14B8A6",
        },
      },
    },
  },
  plugins: [],
}
