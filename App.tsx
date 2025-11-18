
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DomainCard from './components/DomainCard';
import AuthModal from './components/AuthModal';
import { generateIdentities } from './services/gemini';
import { IdentityIdea, AppState, User } from './types';
import { Search, Wand2, AlertCircle, Loader, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<IdentityIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load User on mount
  useEffect(() => {
      const storedUser = localStorage.getItem('namer_user');
      if (storedUser) {
          try {
              setUser(JSON.parse(storedUser));
          } catch (e) {
              console.error("Failed to parse user", e);
          }
      }
  }, []);

  // Load saved items when user changes (switch context)
  const [savedIdentities, setSavedIdentities] = useState<IdentityIdea[]>([]);

  useEffect(() => {
      const storageKey = user ? `namer_saved_ids_${user.email}` : 'namer_saved_ids_guest';
      try {
          const saved = localStorage.getItem(storageKey);
          setSavedIdentities(saved ? JSON.parse(saved) : []);
      } catch (e) {
          console.error("Failed to load saved identities", e);
          setSavedIdentities([]);
      }
  }, [user]);

  // Persist saved items to the correct user key whenever they change
  useEffect(() => {
      const storageKey = user ? `namer_saved_ids_${user.email}` : 'namer_saved_ids_guest';
      localStorage.setItem(storageKey, JSON.stringify(savedIdentities));
  }, [savedIdentities, user]);

  const handleLogin = (email: string, name?: string) => {
      const newUser: User = {
          email,
          name: name || email.split('@')[0],
      };
      setUser(newUser);
      localStorage.setItem('namer_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('namer_user');
      setAppState(AppState.IDLE);
  };

  const toggleSave = (idea: IdentityIdea) => {
    const exists = savedIdentities.find(d => d.handle === idea.handle);
    if (exists) {
      setSavedIdentities(savedIdentities.filter(d => d.handle !== idea.handle));
    } else {
      setSavedIdentities([...savedIdentities, idea]);
    }
  };

  const isSaved = (idea: IdentityIdea) => {
    return savedIdentities.some(d => d.handle === idea.handle);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setAppState(AppState.GENERATING);
    setError(null);
    setResults([]);

    try {
      const ideas = await generateIdentities(prompt);
      setResults(ideas);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check your API key and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleLogoClick = () => {
    setAppState(AppState.IDLE);
    setResults([]);
    setPrompt('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500/30">
      <Header 
        user={user}
        onLogoClick={handleLogoClick}
        onSavedClick={() => setAppState(AppState.SAVED)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        savedCount={savedIdentities.length}
        currentView={appState}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      <main className="max-w-6xl mx-auto px-4 pb-20">
        {/* Hero Section - Only show in IDLE state or during Generation */}
        {(appState === AppState.IDLE || appState === AppState.GENERATING) && (
          <div className={`transition-all duration-700 ease-in-out flex flex-col items-center justify-center min-h-[70vh]`}>
            <div className="text-center mb-12 space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
                <Wand2 className="w-4 h-4" />
                <span>AI-Powered Identity Engine</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                Claim your online<br />identity.
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Describe your gaming style, content niche, or personal brand. Our AI will generate unique usernames and check social media availability.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full max-w-2xl transition-all duration-500 scale-105">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex items-center bg-slate-900 rounded-xl p-2 border border-slate-800 shadow-2xl">
                  <Search className="w-6 h-6 text-slate-500 ml-4" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A stealthy rogue FPS player, or a cozy knitting streamer..."
                    className="w-full bg-transparent border-none outline-none text-lg text-white px-4 py-3 placeholder:text-slate-600"
                    disabled={appState === AppState.GENERATING}
                  />
                  <button
                    type="submit"
                    disabled={appState === AppState.GENERATING || !prompt.trim()}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:hover:bg-violet-600 flex items-center gap-2"
                  >
                    {appState === AppState.GENERATING ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate</span>
                        <Wand2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Condensed Search Bar for Results/Saved View */}
        {(appState === AppState.RESULTS || appState === AppState.SAVED || appState === AppState.ERROR) && (
           <div className="py-8 mb-8 border-b border-white/5">
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
                <div className="relative flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 shadow-lg focus-within:ring-1 focus-within:ring-violet-500/50">
                  <Search className="w-5 h-5 text-slate-500 ml-3" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Generate another identity..."
                    className="w-full bg-transparent border-none outline-none text-base text-white px-3 py-2 placeholder:text-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                     <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
           </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {appState === AppState.RESULTS && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                   Results for <span className="text-violet-400">"{prompt}"</span>
                </h3>
                <span className="text-sm text-slate-500">{results.length} available</span>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((idea, index) => (
                <DomainCard 
                  key={`${idea.handle}-${index}`} 
                  idea={idea} 
                  isSaved={isSaved(idea)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </div>
        )}

        {/* Saved Grid */}
        {appState === AppState.SAVED && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                   <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                   My Saved IDs
                </h3>
                <span className="text-sm text-slate-500">{savedIdentities.length} saved</span>
             </div>
            
            {savedIdentities.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800 bg-slate-900/50">
                <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate-300">No saved identities yet</h4>
                <p className="text-slate-500 mt-2">Start generating ideas and click the heart icon to save them.</p>
                <button 
                  onClick={() => {
                    setAppState(AppState.IDLE);
                    setPrompt('');
                  }}
                  className="mt-6 text-violet-400 hover:text-violet-300 font-medium text-sm hover:underline"
                >
                  Go back to Home
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedIdentities.map((idea, index) => (
                  <DomainCard 
                    key={`saved-${idea.handle}-${index}`} 
                    idea={idea} 
                    isSaved={true}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
