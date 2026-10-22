import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EventForm } from './components/EventForm';
import { PlanView } from './components/PlanView';
import { ExportModal } from './components/ExportModal';
import { SavedPlansModal } from './components/SavedPlansModal';
import { SampleScenariosModal } from './components/SampleScenariosModal';
import { EventInput, EventPlan } from './types/event';
import type { SampleScenario } from './data/sampleScenarios';
import { AlertCircle, CheckCircle, Flame } from 'lucide-react';

const STORAGE_KEY = 'mehfil_ai_saved_plans_v1';
const LAST_PLAN_KEY = 'mehfil_ai_last_active_plan';

const LOADING_MESSAGES = [
  'Weaving the fragrance of jasmine and the cadence of the sitar...',
  'Balancing the royal dastarkhwan and timing culinary courses...',
  'Calculating budget allocations across venue, staging, and artistry...',
  'Harmonizing acoustic cues and stage transitions for your run of show...',
  'Curating 5-swatch celebration color palette and lighting atmosphere...',
  'Structuring vendor procurement deliverables and critical deadlines...',
];

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<EventPlan | null>(null);
  const [activeView, setActiveView] = useState<'form' | 'plan'>('form');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState<boolean>(false);

  // Saved plans state
  const [savedPlans, setSavedPlans] = useState<EventPlan[]>([]);
  const [formInitialValues, setFormInitialValues] = useState<EventInput | null>(null);

  // Load saved plans on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPlans(parsed);
        }
      }

      const lastPlan = localStorage.getItem(LAST_PLAN_KEY);
      if (lastPlan) {
        const parsedPlan = JSON.parse(lastPlan);
        if (parsedPlan?.summary && parsedPlan?.timeline) {
          setCurrentPlan(parsedPlan);
          setActiveView('plan');
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }, []);

  // Cycle loading messages when generating
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2400);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Show temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate event plan
  const handleGeneratePlan = async (input: EventInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const plan: EventPlan = await response.json();
      setCurrentPlan(plan);
      setActiveView('plan');
      showToast('Celebration Blueprint Created!');

      // Save as last active plan
      try {
        localStorage.setItem(LAST_PLAN_KEY, JSON.stringify(plan));
      } catch (e) {
        console.warn('Storage quota warning:', e);
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setError(err.message || 'Failed to curate celebration plan. Please check inputs and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save plan to library
  const handleSaveCurrentPlan = () => {
    if (!currentPlan) return;
    const exists = savedPlans.some((p) => p.id === currentPlan.id);
    let updated: EventPlan[];

    if (exists) {
      updated = savedPlans.map((p) => (p.id === currentPlan.id ? currentPlan : p));
    } else {
      updated = [currentPlan, ...savedPlans];
    }

    setSavedPlans(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast('Plan saved to your collection.');
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
      showToast('Storage full. Delete older saved plans to free space.');
    }
  };

  // Delete saved plan
  const handleDeleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast('Plan removed from library.');
    } catch (e) {
      console.warn('Error updating localStorage:', e);
    }
  };

  // Select sample scenario
  const handleSelectSample = (scenario: SampleScenario) => {
    setFormInitialValues(scenario.data);
    setActiveView('form');
    showToast(`Loaded ${scenario.badge} preset!`);
  };

  // Import plan from JSON
  const handleImportPlan = (importedPlan: EventPlan) => {
    setCurrentPlan(importedPlan);
    setActiveView('plan');
    handleSaveCurrentPlan();
    showToast('Plan imported successfully!');
  };

  const isCurrentPlanSaved = Boolean(currentPlan && savedPlans.some((p) => p.id === currentPlan.id));

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation Header */}
      <Navbar
        currentPlan={currentPlan}
        onNewPlan={() => {
          setActiveView('form');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onOpenSavedPlans={() => setIsSavedPlansOpen(true)}
        onPrintExport={() => setIsExportOpen(true)}
        savedPlansCount={savedPlans.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 bg-stone-900 border border-amber-500/40 text-stone-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-stone-400 hover:text-stone-100 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-rose-600 flex items-center justify-center shadow-2xl shadow-amber-950 animate-pulse mb-6">
              <Flame className="w-8 h-8 text-stone-950 fill-stone-950" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-amber-200 mb-2">
              Curating Your Celebration
            </h3>
            <p className="text-stone-300 text-sm max-w-md h-12 flex items-center justify-center transition-all animate-fade-in font-medium">
              {LOADING_MESSAGES[loadingStep]}
            </p>
            <div className="w-48 h-1 bg-stone-800 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* View Switcher: Form vs Plan */}
        {activeView === 'form' || !currentPlan ? (
          <EventForm
            onSubmit={handleGeneratePlan}
            isLoading={isLoading}
            initialValues={formInitialValues}
            onSelectSample={handleSelectSample}
          />
        ) : (
          <PlanView
            plan={currentPlan}
            onUpdatePlan={(updated) => {
              setCurrentPlan(updated);
              try {
                localStorage.setItem(LAST_PLAN_KEY, JSON.stringify(updated));
              } catch (e) {
                console.warn(e);
              }
            }}
            onEditInputs={() => {
              setFormInitialValues(currentPlan.input);
              setActiveView('form');
            }}
            onPrintExport={() => setIsExportOpen(true)}
            onSavePlan={handleSaveCurrentPlan}
            isSaved={isCurrentPlanSaved}
          />
        )}
      </main>

      {/* Modals */}
      {currentPlan && (
        <ExportModal
          plan={currentPlan}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onImportPlan={handleImportPlan}
        />
      )}

      <SavedPlansModal
        savedPlans={savedPlans}
        isOpen={isSavedPlansOpen}
        onClose={() => setIsSavedPlansOpen(false)}
        onSelectPlan={(plan) => {
          setCurrentPlan(plan);
          setActiveView('plan');
          showToast(`Opened "${plan.summary.title}"`);
        }}
        onDeletePlan={handleDeleteSavedPlan}
        currentPlan={currentPlan}
        onSaveCurrentPlan={handleSaveCurrentPlan}
      />

      <SampleScenariosModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectScenario={handleSelectSample}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-6 px-4 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-stone-400">MEHFIL AI</span>
            <span>·</span>
            <span>Celebration & Event Planner</span>
          </div>
          <div className="text-[11px] text-stone-500">
            Engineered with React, TypeScript, Node.js & Gemini API
          </div>
        </div>
      </footer>
    </div>
  );
}
