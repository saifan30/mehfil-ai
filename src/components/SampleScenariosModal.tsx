import React from 'react';
import { Sparkles, X, ArrowRight, MapPin, Users, Coins, Calendar } from 'lucide-react';
import { SAMPLE_SCENARIOS, SampleScenario } from '../data/sampleScenarios';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SampleScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: SampleScenario) => void;
}

export const SampleScenariosModal: React.FC<SampleScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sample-scenarios-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md no-print"
    >
      <div className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[88vh] flex flex-col animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 id="sample-scenarios-title" className="font-serif text-lg font-bold text-stone-100">
              Curated Celebration Inspiration Scenarios
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sample scenarios modal"
            className="text-stone-400 hover:text-stone-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400">
          Select any benchmark scenario to immediately test Mehfil AI's timeline orchestration, budget breakdown, and vendor checklist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {SAMPLE_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="p-5 rounded-2xl border border-stone-800 bg-stone-950/60 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 bg-amber-950/30">
                  {scenario.badge}
                </span>

                <h4 className="font-serif text-base font-bold text-stone-100 mt-2 group-hover:text-amber-200 transition-colors">
                  {scenario.title}
                </h4>

                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {scenario.tagline}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-1.5 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{scenario.data.location} ({scenario.data.venueType})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatDate(scenario.data.date)} at {scenario.data.startTime}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <strong>{scenario.data.guestCount}</strong> guests
                    </span>
                    <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {formatCurrency(scenario.data.budget, scenario.data.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSelectScenario(scenario);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors group-hover:shadow-md group-hover:shadow-amber-950/50"
                >
                  <span>Load Into Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
