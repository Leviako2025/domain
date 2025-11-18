import React from 'react';
import { Sparkles, Heart, Fingerprint, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { AppState, User } from '../types';

interface Props {
  user: User | null;
  onLogoClick: () => void;
  onSavedClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  savedCount: number;
  currentView: AppState;
}

const Header: React.FC<Props> = ({ user, onLogoClick, onSavedClick, onLoginClick, onLogoutClick, savedCount, currentView }) => {
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
          <button 
            onClick={onSavedClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              currentView === AppState.SAVED 
                ? 'bg-white text-slate-900' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${currentView === AppState.SAVED ? 'fill-slate-900' : 'fill-transparent'}`} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                currentView === AppState.SAVED ? 'bg-slate-200 text-slate-900' : 'bg-violet-500 text-white'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {user ? (
             <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-300 hidden md:block">{user.name}</span>
                </div>
                <button 
                    onClick={onLogoutClick}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400 transition-colors"
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5" />
                </button>
             </div>
          ) : (
             <div className="pl-2">
                <button 
                    onClick={onLoginClick}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                </button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
