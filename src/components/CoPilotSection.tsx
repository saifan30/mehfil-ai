import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, MessageSquare, Lightbulb, Compass, ShieldAlert } from 'lucide-react';
import { EventPlan } from '../types/event';

interface CoPilotSectionProps {
  plan: EventPlan;
}

const QUICK_PROMPTS = [
  'How can we reduce overall costs by 15% without sacrificing elegance?',
  'Suggest an outdoor rain & humidity contingency plan for this setting.',
  'Write a poetic, warm 2-minute opening welcome script for the emcee.',
  'What are 3 unique guest icebreakers suited for this gathering?',
  'Recommend 4 signature non-alcoholic welcome drinks matching our theme.',
];

export const CoPilotSection: React.FC<CoPilotSectionProps> = ({ plan }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleAskCoPilot = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          prompt: textToSend,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to obtain suggestion from server.');
      }

      const data = await res.json();
      setAdvice(data.advice || 'No response returned.');
    } catch (err: any) {
      console.error('Co-pilot error:', err);
      setError('Unable to fetch AI suggestion. Please check your connection or server status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!advice) return;
    navigator.clipboard.writeText(advice);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Mehfil AI Co-Pilot & Celebration Consultant
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Real-time consultation on scripts, weather contingencies, budget optimization, and hospitality nuances.
          </p>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div>
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
          Recommended Consultation Topics
        </span>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setPrompt(q);
                handleAskCoPilot(q);
              }}
              className="text-xs text-stone-300 bg-stone-900/80 hover:bg-amber-950/40 hover:text-amber-200 border border-stone-800 hover:border-amber-700/50 rounded-xl px-3 py-1.5 transition-colors text-left flex items-center gap-1.5 focus:outline-none"
            >
              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-4 rounded-2xl border border-stone-800 bg-stone-900/80 backdrop-blur-sm space-y-3">
        <label className="block text-xs font-medium text-stone-300">
          Ask Custom Question About This Celebration
        </label>
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Can you draft a traditional welcome announcement in Urdu/English for when the ghazal singer begins?"
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={!prompt.trim() || isLoading}
            onClick={() => handleAskCoPilot()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Advice response output */}
      {advice && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-stone-900/90 to-stone-950/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h4 className="font-serif text-sm font-bold text-amber-200">
                Co-Pilot Consultation
              </h4>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 rounded-lg transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Advice</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-stone-200 leading-relaxed whitespace-pre-wrap font-sans">
            {advice}
          </div>
        </div>
      )}
    </div>
  );
};
