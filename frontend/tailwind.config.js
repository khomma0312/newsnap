/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
        },
        danger: {
          DEFAULT: "#dc2626",
          dark: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
};
