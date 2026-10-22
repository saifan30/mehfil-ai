import React from 'react';
import { Sparkles, Calendar, PlusCircle, Printer, FolderOpen, Flame } from 'lucide-react';
import { EventPlan } from '../types/event';

interface NavbarProps {
  currentPlan: EventPlan | null;
  onNewPlan: () => void;
  onOpenSamples: () => void;
  onOpenSavedPlans: () => void;
  onPrintExport: () => void;
  savedPlansCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPlan,
  onNewPlan,
  onOpenSamples,
  onOpenSavedPlans,
  onPrintExport,
  savedPlansCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-900/30 bg-stone-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5 no-print transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <button
          type="button"
          onClick={onNewPlan}
          aria-label="Mehfil AI Home and New Plan"
          className="flex items-center gap-3 cursor-pointer group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl p-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-rose-700 flex items-center justify-center shadow-lg shadow-amber-950/50 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-stone-950 fill-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-wider text-amber-200">
                MEHFIL
              </span>
              <span className="font-sans text-xs tracking-widest font-semibold text-amber-400/90 px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-sans tracking-wide hidden sm:block">
              Celebration & Cultural Event Planner
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSamples}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-200/90 hover:text-amber-100 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-700/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
            title="Explore Curated Celebration Templates"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Sample</span> Scenarios
          </button>

          <button
            onClick={onOpenSavedPlans}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-stone-100 bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none relative"
            title="View Saved Event Plans"
          >
            <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Saved Plans</span>
            {savedPlansCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-600/40 text-amber-200 rounded-full font-mono border border-amber-500/30">
                {savedPlansCount}
              </span>
            )}
          </button>

          {currentPlan && (
            <button
              onClick={onPrintExport}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
              title="Print or Export PDF / Markdown"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export / Print</span>
            </button>
          )}

          <button
            onClick={onNewPlan}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-950/40 transition-all focus-visible:ring-2 focus-visible:ring-amber-300 focus:outline-none active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
