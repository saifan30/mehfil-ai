import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Coins, 
  Clock, 
  Printer, 
  Edit3, 
  Bookmark, 
  UtensilsCrossed, 
  LayoutGrid, 
  Briefcase,
  Flame,
  Shirt
} from 'lucide-react';
import { EventPlan, TimelineItem, VendorItem, MenuSection as MenuSectionType, ZoneLayout } from '../types/event';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TimelineSection } from './TimelineSection';
import { BudgetSection } from './BudgetSection';
import { VendorSection } from './VendorSection';
import { MenuSection } from './MenuSection';
import { ZonesSection } from './ZonesSection';
import { CoPilotSection } from './CoPilotSection';

interface PlanViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onEditInputs: () => void;
  onPrintExport: () => void;
  onSavePlan: () => void;
  isSaved: boolean;
}

type TabType = 'timeline' | 'budget' | 'vendors' | 'menu' | 'zones' | 'copilot';

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  onUpdatePlan,
  onEditInputs,
  onPrintExport,
  onSavePlan,
  isSaved,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const currency = plan.budgetBreakdown.currency || 'INR';

  // Copy hex code helper
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Section update handlers
  const handleUpdateTimeline = (updatedTimeline: TimelineItem[]) => {
    onUpdatePlan({ ...plan, timeline: updatedTimeline });
  };

  const handleUpdateBudget = (updatedBudget: EventPlan['budgetBreakdown']) => {
    onUpdatePlan({ ...plan, budgetBreakdown: updatedBudget });
  };

  const handleUpdateVendors = (updatedVendors: VendorItem[]) => {
    onUpdatePlan({ ...plan, vendorChecklist: updatedVendors });
  };

  const handleUpdateMenu = (updatedMenu: MenuSectionType[]) => {
    onUpdatePlan({ ...plan, curatedMenu: updatedMenu });
  };

  const handleUpdateZones = (updatedZones: ZoneLayout[]) => {
    onUpdatePlan({ ...plan, zones: updatedZones });
  };

  const bookedVendorsCount = plan.vendorChecklist.filter(
    (v) => v.status === 'Contract Signed' || v.status === 'Deposit Paid' || v.status === 'Fully Paid'
  ).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800 no-print">
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="font-semibold uppercase tracking-wider">
            Mehfil AI Generated Blueprint
          </span>
          <span className="text-stone-600">·</span>
          <span className="text-stone-400 font-mono text-[11px]">
            {new Date(plan.generatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSavePlan}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isSaved
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                : 'bg-stone-900 text-stone-200 border-stone-700 hover:border-amber-500/50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span>{isSaved ? 'Saved in Library' : 'Save Plan'}</span>
          </button>

          <button
            onClick={onPrintExport}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Export / Print</span>
          </button>

          <button
            onClick={onEditInputs}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow transition-colors active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Parameters</span>
          </button>
        </div>
      </div>

      {/* Printable Cover Header (Shown only during print) */}
      <div className="hidden print:block print-only mb-6 border-b border-stone-300 pb-4">
        <h1 className="text-2xl font-bold font-serif text-stone-900">{plan.summary.title}</h1>
        <p className="text-sm text-stone-600 italic">{plan.summary.tagline}</p>
        <div className="text-xs text-stone-700 mt-2 grid grid-cols-2 gap-2">
          <div><strong>Date:</strong> {formatDate(plan.input.date)} ({plan.input.startTime})</div>
          <div><strong>Location:</strong> {plan.input.location} ({plan.input.venueType})</div>
          <div><strong>Guests:</strong> {plan.input.guestCount}</div>
          <div><strong>Total Budget:</strong> {formatCurrency(plan.budgetBreakdown.totalBudget, currency)}</div>
        </div>
      </div>

      {/* Hero Atmosphere Board */}
      <div className="p-6 sm:p-8 rounded-3xl border border-amber-900/40 bg-gradient-to-b from-stone-900/95 via-stone-900/80 to-stone-950 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle decorative glowing corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              {plan.input.eventType}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-100 mt-1">
              {plan.summary.title}
            </h2>
            <p className="text-sm sm:text-base text-amber-200/90 italic font-serif mt-1">
              "{plan.summary.tagline}"
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
            {plan.summary.atmosphereNarrative}
          </p>

          {/* 5-Swatch Curated Color Palette */}
          {plan.summary.colorPalette && plan.summary.colorPalette.length > 0 && (
            <div className="pt-4 border-t border-stone-800">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest block mb-3">
                Curated Celebration Palette & Textile Accents
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {plan.summary.colorPalette.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopyHex(color.hex)}
                    aria-label={`Copy hex color ${color.hex} for ${color.name} (${color.role})`}
                    className="group cursor-pointer p-2.5 rounded-xl border border-stone-800 bg-stone-950/70 hover:border-amber-500/50 transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div
                      style={{ backgroundColor: color.hex }}
                      className="w-full h-10 rounded-lg shadow-inner mb-2 border border-white/10"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-200 text-[11px] truncate">
                        {color.name}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400 group-hover:text-amber-300">
                        {copiedHex === color.hex ? 'Copied!' : color.hex}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block truncate mt-0.5">
                      {color.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics Bar */}
          <div className="pt-4 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Date & Time</span>
                <span className="font-medium text-stone-200">
                  {formatDate(plan.input.date)} ({plan.input.startTime})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Venue & City</span>
                <span className="font-medium text-stone-200 truncate block">
                  {plan.input.location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Guest Count</span>
                <span className="font-medium text-stone-200 font-mono">
                  {plan.input.guestCount} Attendees
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">Total Budget</span>
                <span className="font-medium text-amber-300 font-mono">
                  {formatCurrency(plan.budgetBreakdown.totalBudget, currency)}
                </span>
              </div>
            </div>
          </div>

          {plan.summary.suggestedDressCode && (
            <div className="flex items-center gap-2 text-xs text-stone-300 pt-1">
              <Shirt className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>Suggested Attire:</strong> {plan.summary.suggestedDressCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto no-print scrollbar-none">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'timeline'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline (Run of Show)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900/30 text-stone-950 font-mono">
            {plan.timeline.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'budget'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Budget & Ledger</span>
          <span className="font-mono text-[10px]">
            {formatCurrency(plan.budgetBreakdown.totalBudget, currency)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'vendors'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Vendor Procurement</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900/30 text-stone-950 font-mono">
            {bookedVendorsCount}/{plan.vendorChecklist.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'menu'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Feast & Dastarkhwan</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900/30 text-stone-950 font-mono">
            {plan.curatedMenu.length} Courses
          </span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'zones'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Spatial Zones</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900/30 text-stone-950 font-mono">
            {plan.zones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'copilot'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/50'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Co-Pilot</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'timeline' && (
          <TimelineSection
            timeline={plan.timeline}
            onUpdateTimeline={handleUpdateTimeline}
            eventStartTime={plan.input.startTime}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetSection
            budgetData={plan.budgetBreakdown}
            guestCount={plan.input.guestCount}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorSection
            vendors={plan.vendorChecklist}
            currency={currency}
            onUpdateVendors={handleUpdateVendors}
          />
        )}

        {activeTab === 'menu' && (
          <MenuSection
            menu={plan.curatedMenu}
            onUpdateMenu={handleUpdateMenu}
          />
        )}

        {activeTab === 'zones' && (
          <ZonesSection
            zones={plan.zones}
            onUpdateZones={handleUpdateZones}
            guestCount={plan.input.guestCount}
          />
        )}

        {activeTab === 'copilot' && (
          <CoPilotSection plan={plan} />
        )}
      </div>

      {/* Print-only complete dump for clean PDF printing */}
      <div className="hidden print:block print-only space-y-6 pt-6 border-t border-stone-300">
        <h2 className="text-xl font-bold font-serif text-stone-900">Run of Show & Timeline</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-300 font-bold">
              <th className="py-2">Time</th>
              <th className="py-2">Phase</th>
              <th className="py-2">Milestone</th>
              <th className="py-2">Lead / Cue</th>
            </tr>
          </thead>
          <tbody>
            {plan.timeline.map((t) => (
              <tr key={t.id} className="border-b border-stone-200">
                <td className="py-2 font-mono">{t.time}</td>
                <td className="py-2">{t.phase}</td>
                <td className="py-2">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-[11px] text-stone-600">{t.description}</div>
                </td>
                <td className="py-2 text-[11px]">
                  <div>{t.leadRole}</div>
                  <div className="italic text-stone-500">{t.cue}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-bold font-serif text-stone-900 pt-4">Budget Breakdown</h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-300 font-bold">
              <th className="py-2">Category</th>
              <th className="py-2">Allocation</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {plan.budgetBreakdown.items.map((b) => (
              <tr key={b.id} className="border-b border-stone-200">
                <td className="py-2">{b.category}</td>
                <td className="py-2">{b.allocatedPercent}%</td>
                <td className="py-2 text-right font-mono">{formatCurrency(b.allocatedAmount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
