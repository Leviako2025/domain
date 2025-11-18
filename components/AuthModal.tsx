import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, name?: string) => void;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for realism
    setTimeout(() => {
        const displayName = isRegistering ? name : email.split('@')[0];
        onLogin(email, displayName);
        setIsLoading(false);
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
        </button>
        
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
                {isRegistering ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-slate-400 text-sm">
                {isRegistering ? 'Join Namer.ai to sync your ideas across devices.' : 'Sign in to access your saved domains.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="w-5 h-5 text-slate-500 absolute left-3 top-3 group-focus-within:text-violet-400 transition-colors" />
                        <input 
                            type="text" 
                            required={isRegistering}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-700"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3 group-focus-within:text-violet-400 transition-colors" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-700"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
                <div className="relative group">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3 group-focus-within:text-violet-400 transition-colors" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder:text-slate-700"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        {isRegistering ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                <button 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="ml-2 text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                    {isRegistering ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
