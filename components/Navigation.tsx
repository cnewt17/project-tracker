'use client';

import { LayoutGrid } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Project Tracker
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="/"
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/projects"
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Projects
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
