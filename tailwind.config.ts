import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // RAG status colors - dot variant
    "bg-red-500",
    "bg-amber-500",
    "bg-green-500",
    "bg-slate-400",
    // RAG status colors - badge variant
    "bg-red-50",
    "text-red-700",
    "border-red-200",
    "dark:bg-red-900/20",
    "dark:text-red-300",
    "dark:border-red-800",
    "bg-amber-50",
    "text-amber-700",
    "border-amber-200",
    "dark:bg-amber-900/20",
    "dark:text-amber-300",
    "dark:border-amber-800",
    "bg-green-50",
    "text-green-700",
    "border-green-200",
    "dark:bg-green-900/20",
    "dark:text-green-300",
    "dark:border-green-800",
    "bg-slate-50",
    "text-slate-700",
    "border-slate-200",
    "dark:bg-slate-900/20",
    "dark:text-slate-300",
    "dark:border-slate-700",
    // RAG status colors - timeline variant
    "ring-red-200",
    "dark:ring-red-800",
    "ring-amber-200",
    "dark:ring-amber-800",
    "ring-green-200",
    "dark:ring-green-800",
    "ring-slate-200",
    "dark:ring-slate-700",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
