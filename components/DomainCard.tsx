import React, { useState } from 'react';
import { IdentityIdea, IdentityAnalysis } from '../types';
import { checkIdentityPresence, generateAvatar } from '../services/gemini';
import { Search, CheckCircle, XCircle, Loader2, ExternalLink, ArrowRight, Twitter, Facebook, Linkedin, Heart, Palette, Copy, Check, AlertTriangle } from 'lucide-react';

interface Props {
  idea: IdentityIdea;
  isSaved: boolean;
  onToggleSave: (idea: IdentityIdea) => void;
}

const DomainCard: React.FC<Props> = ({ idea, isSaved, onToggleSave }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<IdentityAnalysis | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Use handle directly
  const fullHandle = idea.handle;

  const handleAnalyze = async () => {
    if (analysis) return; // Already analyzed
    setIsAnalyzing(true);
    try {
      const result = await checkIdentityPresence(fullHandle);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateLogo = async () => {
    if (logoUrl) return;
    setIsGeneratingLogo(true);
    try {
      const url = await generateAvatar(idea.handle, idea.vibe);
      setLogoUrl(url);
    } catch (error) {
      console.error("Avatar generation failed", error);
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullHandle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Check out this username idea I found on Namer.ai: @${fullHandle} - ${idea.explanation}`;
  const shareUrl = "https://namer.ai"; 

  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
      {/* Background Gradient Blob */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full group-hover:bg-violet-500/20 transition-all"></div>

      <div className="relative z-10 flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
            idea.vibe === 'Professional' ? 'bg-blue-500/10 text-blue-400' :
            idea.vibe === 'Edgy' ? 'bg-red-500/10 text-red-400' :
            'bg-emerald-500/10 text-emerald-400'
          }`}>
            {idea.style}
          </span>
          <button 
            onClick={() => onToggleSave(idea)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
            title={isSaved ? "Remove from saved" : "Save idea"}
          >
            <Heart 
              className={`w-5 h-5 transition-all ${isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`} 
            />
          </button>
        </div>

        <div className="flex gap-1 mb-4">
            {[...Array(10)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < idea.availabilityScore ? 'bg-violet-500' : 'bg-slate-800'}`} />
            ))}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-3xl font-bold text-white tracking-tight">
            <span className="text-slate-600 mr-1">@</span>{idea.handle}
          </h3>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Copy handle"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {idea.explanation}
        </p>

        {logoUrl && (
          <div className="mb-6 rounded-full w-28 h-28 mx-auto overflow-hidden border-4 border-slate-800 shadow-lg animate-fade-in">
            <img src={logoUrl} alt={`${idea.handle} avatar`} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Analysis Section */}
          {!analysis && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`relative w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:cursor-not-allowed overflow-hidden ${
                isAnalyzing 
                  ? 'bg-slate-800 text-violet-300 ring-1 ring-violet-500/30' 
                  : 'bg-slate-800 hover:bg-violet-600 text-white'
              }`}
            >
              {isAnalyzing && (
                <div className="absolute inset-0 bg-violet-500/10 animate-pulse" />
              )}
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isAnalyzing ? 'Checking Socials...' : 'Check Availability'}</span>
            </button>
          )}

          {analysis && (
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 animate-fade-in text-left">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-800/50 pb-2">
                {analysis.takenOn.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                <span className={`text-sm font-semibold ${analysis.takenOn.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {analysis.takenOn.length > 0 ? 'Partially Taken' : 'Looks Available'}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{analysis.summary}</p>

              {analysis.takenOn.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {analysis.takenOn.map((platform) => (
                        <span key={platform} className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded uppercase tracking-wider">
                            {platform}
                        </span>
                    ))}
                 </div>
              )}
              {analysis.takenOn.length === 0 && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-[10px] rounded uppercase tracking-wider">
                      ALL CLEAR
                  </span>
              )}
            </div>
          )}

          {/* Logo Generation Button - Only show if not already generated */}
          {!logoUrl && (
            <button
              onClick={handleGenerateLogo}
              disabled={isGeneratingLogo}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all text-sm font-medium ${isGeneratingLogo ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {isGeneratingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
              <span>{isGeneratingLogo ? 'Drawing Avatar...' : 'Create Avatar'}</span>
            </button>
          )}

          <a
            href={`https://www.google.com/search?q="${fullHandle}"`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all text-sm font-medium"
          >
             Search Google <ArrowRight className="w-3 h-3" />
          </a>

        </div>
      </div>

      <div className="pt-4 mt-6 border-t border-slate-800/50 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-slate-500">Share this identity</span>
        <div className="flex items-center gap-3">
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-[#1DA1F2] transition-colors"
            title="Share on Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-[#4267B2] transition-colors"
            title="Share on Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DomainCard;