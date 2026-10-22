import React from 'react';
import { FolderOpen, X, Trash2, Calendar, MapPin, Users, Coins, ArrowRight, Bookmark } from 'lucide-react';
import { EventPlan } from '../types/event';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SavedPlansModalProps {
  savedPlans: EventPlan[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: EventPlan) => void;
  onDeletePlan: (id: string) => void;
  currentPlan: EventPlan | null;
  onSaveCurrentPlan: () => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  savedPlans,
  isOpen,
  onClose,
  onSelectPlan,
  onDeletePlan,
  currentPlan,
  onSaveCurrentPlan,
}) => {
  if (!isOpen) return null;

  const isCurrentPlanSaved = currentPlan && savedPlans.some((p) => p.id === currentPlan.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md no-print">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif text-lg font-bold text-stone-100">
              Saved Celebration Blueprints
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentPlan && !isCurrentPlanSaved && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between gap-3">
            <div className="text-xs text-stone-300">
              Save current active plan <strong className="text-amber-200">"{currentPlan.summary.title}"</strong> to local storage.
            </div>
            <button
              onClick={onSaveCurrentPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 transition-colors shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 fill-stone-950" />
              <span>Save Plan</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedPlans.length === 0 ? (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-stone-600" />
              <p className="text-sm text-stone-400">No saved plans found in local browser storage.</p>
              <p className="text-xs text-stone-500">Generate a celebration plan and it will auto-save here!</p>
            </div>
          ) : (
            savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl border border-stone-800 bg-stone-950/60 hover:border-amber-700/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <h4 className="text-sm font-semibold text-stone-100 group-hover:text-amber-200 transition-colors">
                    {plan.summary.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      {formatDate(plan.input.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {plan.input.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400" />
                      {plan.input.guestCount} guests
                    </span>
                    <span className="flex items-center gap-1 font-mono text-amber-300">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {formatCurrency(plan.budgetBreakdown.totalBudget, plan.budgetBreakdown.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => {
                      onSelectPlan(plan);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-stone-200 rounded-lg transition-colors"
                  >
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors"
                    title="Delete saved plan"
                    aria-label={`Delete ${plan.summary.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
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
