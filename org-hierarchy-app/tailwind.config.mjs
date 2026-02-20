/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For Next.js App Router
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If using Pages Router or a mix
    './components/**/*.{js,ts,jsx,tsx,mdx}', // If components are directly under root
    './src/**/*.{js,ts,jsx,tsx,mdx}', // General source directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}