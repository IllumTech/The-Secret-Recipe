'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme();
    // Remove focus after click to prevent persistent outline
    e.currentTarget.blur();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={resolvedTheme === 'dark'}
      className={`
        relative p-2 rounded-lg
        bg-gray-100 dark:bg-gray-800
        text-gray-800 dark:text-gray-200
        hover:bg-gray-200 dark:hover:bg-gray-700
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400
        transition-all duration-200
        transform hover:scale-105
        ${className}
      `}
      type="button"
    >
      <span className="sr-only">
        {resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
      
      {resolvedTheme === 'dark' ? (
        <Sun 
          className="w-5 h-5 transition-transform duration-300 rotate-0" 
          aria-hidden="true"
        />
      ) : (
        <Moon 
          className="w-5 h-5 transition-transform duration-300 rotate-0" 
          aria-hidden="true"
        />
      )}
    </button>
  );
}
