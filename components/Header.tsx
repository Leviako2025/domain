import React from 'react';
import { Globe, Sparkles, Heart, Fingerprint } from 'lucide-react';
import { AppState } from '../types';

interface Props {
  onLogoClick: () => void;
  onSavedClick: () => void;
  savedCount: number;
  currentView: AppState;
}

const Header: React.FC<Props> = ({ onLogoClick, onSavedClick, savedCount, currentView }) => {
  return (
    <header className="w-full py-6 border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onLogoClick}
        >
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Fingerprint className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-400 group-hover:text-white transition-colors">
            Namer.ai
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <div className="hidden sm:flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Identity Engine</span>
          </div>
          <button 
            onClick={onSavedClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              currentView === AppState.SAVED 
                ? 'bg-white text-slate-900' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${currentView === AppState.SAVED ? 'fill-slate-900' : 'fill-transparent'}`} />
            <span>Saved IDs</span>
            {savedCount > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                currentView === AppState.SAVED ? 'bg-slate-200 text-slate-900' : 'bg-violet-500 text-white'
              }`}>
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;