/** @type {import('tailwindcss').Config} */
// NOTE: With Tailwind CSS v4, theme tokens are defined in index.css via @theme {}.
// This file is kept for tooling compatibility (e.g. content scanning).
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
};
