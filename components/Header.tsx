import React from 'react';
import type { Page } from '../types';

interface HeaderProps {
  onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="flex items-center justify-between p-4 md:px-6 border-b border-gray-700">
      <div className="cursor-pointer" onClick={() => onNavigate('home')}>
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500 leading-tight">
          Code Idea
        </h1>
        <p className="hidden md:block text-sm text-gray-400 -mt-1">
          From idea to architecture.
        </p>
      </div>
      <button
        onClick={() => onNavigate('agents')}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700/50 text-indigo-300 font-semibold rounded-lg hover:bg-gray-600/70 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
        <span className="hidden sm:inline">Meet the Agents</span>
      </button>
    </header>
  );
};

export default Header;
