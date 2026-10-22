import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Volume2, 
  UserCheck, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { TimelineItem, TimelinePhase } from '../types/event';

interface TimelineSectionProps {
  timeline: TimelineItem[];
  onUpdateTimeline: (updatedTimeline: TimelineItem[]) => void;
  eventStartTime: string;
}

const PHASES: TimelinePhase[] = [
  'Setup & Prep',
  'Arrival & Welcome',
  'Ritual & Ceremony',
  'Entertainment & Program',
  'Dining & Feast',
  'Celebration & Dance',
  'Wrap & Departure',
];

const PHASE_COLORS: Record<TimelinePhase, { bg: string; text: string; border: string }> = {
  'Setup & Prep': { bg: 'bg-stone-800/80', text: 'text-stone-300', border: 'border-stone-700' },
  'Arrival & Welcome': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
  'Ritual & Ceremony': { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-700/50' },
  'Entertainment & Program': { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
  'Dining & Feast': { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
  'Celebration & Dance': { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700/50' },
  'Wrap & Departure': { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
};

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  timeline,
  onUpdateTimeline,
  eventStartTime,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form state for adding/editing
  const [itemTime, setItemTime] = useState<string>('19:00');
  const [itemTitle, setItemTitle] = useState<string>('');
  const [itemPhase, setItemPhase] = useState<TimelinePhase>('Entertainment & Program');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemLeadRole, setItemLeadRole] = useState<string>('Event Lead');
  const [itemCue, setItemCue] = useState<string>('');

  const filteredItems = selectedPhase === 'All' 
    ? timeline 
    : timeline.filter((item) => item.phase === selectedPhase);

  // Toggle item completion
  const handleToggleComplete = (id: string) => {
    const updated = timeline.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    onUpdateTimeline(updated);
  };

  // Start editing
  const handleStartEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    setItemTime(item.time);
    setItemTitle(item.title);
    setItemPhase(item.phase);
    setItemDescription(item.description);
    setItemLeadRole(item.leadRole);
    setItemCue(item.cue);
    setIsAddingNew(false);
  };

  // Save edit
  const handleSaveEdit = (id: string) => {
    const updated = timeline.map((item) =>
      item.id === id
        ? {
            ...item,
            time: itemTime,
            title: itemTitle,
            phase: itemPhase,
            description: itemDescription,
            leadRole: itemLeadRole,
            cue: itemCue,
          }
        : item
    );
    onUpdateTimeline(updated);
    setEditingId(null);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this timeline event?')) {
      const updated = timeline.filter((item) => item.id !== id);
      onUpdateTimeline(updated);
    }
  };

  // Add new item
  const handleAddNewItem = () => {
    if (!itemTitle.trim()) return;
    const newItem: TimelineItem = {
      id: `t-custom-${Date.now()}`,
      time: itemTime,
      title: itemTitle,
      phase: itemPhase,
      description: itemDescription,
      leadRole: itemLeadRole || 'Event Lead',
      cue: itemCue || 'Standard ambient cue',
      isCompleted: false,
    };

    // Insert sorted by time if possible
    const updated = [...timeline, newItem].sort((a, b) => a.time.localeCompare(b.time));
    onUpdateTimeline(updated);
    setIsAddingNew(false);
    setItemTitle('');
    setItemDescription('');
    setItemCue('');
  };

  const completedCount = timeline.filter((i) => i.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Celebration Run of Show & Timeline
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Precision-timed cues, operational leads, and musical transitions from load-in to departure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-stone-400 font-mono bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
            Progress: <span className="text-amber-400 font-bold">{completedCount}/{timeline.length}</span> checked
          </div>

          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingId(null);
              setItemTime(eventStartTime || '19:00');
              setItemTitle('');
              setItemDescription('');
              setItemCue('');
            }}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedPhase('All')}
          className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            selectedPhase === 'All'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
          }`}
        >
          All Moments ({timeline.length})
        </button>
        {PHASES.map((phase) => {
          const count = timeline.filter((i) => i.phase === phase).length;
          if (count === 0 && selectedPhase !== phase) return null;
          return (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedPhase === phase
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
              }`}
            >
              {phase} ({count})
            </button>
          );
        })}
      </div>

      {/* Add New Event Inline Panel */}
      {isAddingNew && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Add Timeline Milestone
            </h4>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="new-timeline-time" className="block text-[11px] text-stone-300 mb-1">Time</label>
              <input
                id="new-timeline-time"
                type="text"
                placeholder="e.g. 19:30"
                value={itemTime}
                onChange={(e) => setItemTime(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="new-timeline-title" className="block text-[11px] text-stone-300 mb-1">Milestone Title</label>
              <input
                id="new-timeline-title"
                type="text"
                placeholder="e.g. Grand Entrance of Couple / Keynote Speech"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label htmlFor="new-timeline-phase" className="block text-[11px] text-stone-300 mb-1">Celebration Phase</label>
              <select
                id="new-timeline-phase"
                value={itemPhase}
                onChange={(e) => setItemPhase(e.target.value as TimelinePhase)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-timeline-lead" className="block text-[11px] text-stone-300 mb-1">Lead Responsible</label>
              <input
                id="new-timeline-lead"
                type="text"
                placeholder="e.g. Emcee / Hospitality Captain"
                value={itemLeadRole}
                onChange={(e) => setItemLeadRole(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label htmlFor="new-timeline-cue" className="block text-[11px] text-stone-300 mb-1">Audio / Lighting Cue</label>
              <input
                id="new-timeline-cue"
                type="text"
                placeholder="e.g. Warm amber spotlight, live shehnai crescendo"
                value={itemCue}
                onChange={(e) => setItemCue(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-timeline-desc" className="block text-[11px] text-stone-300 mb-1">Description & Operational Notes</label>
            <input
              id="new-timeline-desc"
              type="text"
              placeholder="What happens during this moment? Any specific coordination notes?"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewItem}
              disabled={!itemTitle.trim()}
              className="px-4 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 disabled:opacity-50"
            >
              Save Milestone
            </button>
          </div>
        </div>
      )}

      {/* Timeline Items List */}
      <div className="relative pl-6 sm:pl-8 border-l border-amber-900/40 space-y-6">
        {filteredItems.map((item) => {
          const isEditing = editingId === item.id;
          const phaseColor = PHASE_COLORS[item.phase] || PHASE_COLORS['Entertainment & Program'];

          return (
            <div key={item.id} className="relative group">
              {/* Dot on timeline */}
              <button
                type="button"
                onClick={() => handleToggleComplete(item.id)}
                title={item.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                aria-label={`Toggle completion for ${item.title}`}
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  item.isCompleted
                    ? 'bg-emerald-500 text-stone-950 ring-4 ring-emerald-950'
                    : 'bg-stone-900 border-2 border-amber-500 text-transparent hover:text-amber-400 ring-4 ring-stone-950'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>

              {/* Item Card or Edit Form */}
              {isEditing ? (
                <div className="p-4 rounded-xl border border-amber-500/50 bg-stone-900/95 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Time</label>
                      <input
                        type="text"
                        value={itemTime}
                        onChange={(e) => setItemTime(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-stone-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Phase</label>
                      <select
                        value={itemPhase}
                        onChange={(e) => setItemPhase(e.target.value as TimelinePhase)}
                        className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-xs"
                      >
                        {PHASES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Lead Responsible</label>
                      <input
                        type="text"
                        value={itemLeadRole}
                        onChange={(e) => setItemLeadRole(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Cue</label>
                      <input
                        type="text"
                        value={itemCue}
                        onChange={(e) => setItemCue(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded px-2.5 py-1 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-3 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded hover:bg-amber-300"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    item.isCompleted
                      ? 'bg-stone-900/40 border-stone-800/60 opacity-75'
                      : 'bg-stone-900/80 border-stone-800 hover:border-amber-700/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        {item.time}
                      </span>
                      <h4
                        className={`text-sm font-semibold tracking-wide ${
                          item.isCompleted ? 'line-through text-stone-400' : 'text-stone-100'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${phaseColor.bg} ${phaseColor.text} ${phaseColor.border}`}
                      >
                        {item.phase}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 text-stone-400">
                      <button
                        onClick={() => handleStartEdit(item)}
                        title="Edit event"
                        aria-label={`Edit ${item.title}`}
                        className="p-1 hover:text-amber-300 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete event"
                        aria-label={`Delete ${item.title}`}
                        className="p-1 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Operational badges */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-stone-800/80 text-[11px] text-stone-400">
                    {item.leadRole && (
                      <div className="flex items-center gap-1 text-stone-300">
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        <span className="text-stone-400">Lead:</span> {item.leadRole}
                      </div>
                    )}
                    {item.cue && (
                      <div className="flex items-center gap-1 text-stone-300">
                        <Volume2 className="w-3 h-3 text-purple-400" />
                        <span className="text-stone-400">Cue:</span> {item.cue}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-stone-500 text-xs">
            No milestones in this phase. Click "Add Event" to insert one.
          </div>
        )}
      </div>
    </div>
  );
};
