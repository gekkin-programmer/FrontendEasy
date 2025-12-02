/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    // If your project uses a 'src' folder, keep these:
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    
    // !! IF YOU DO NOT HAVE A 'src' FOLDER, ADD THESE LINES: !!
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3C48F6",
      },
      fontFamily: {
        // This connects Tailwind's 'font-mono' to your JetBrains font
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        // If you want it to be the default sans font too:
        sans: ["var(--font-jetbrains-mono)", "sans-serif"],
      },
    },
  },
  plugins: [],
}

