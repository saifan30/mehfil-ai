import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Coins, 
  Music, 
  UtensilsCrossed, 
  Palette, 
  Building2, 
  Clock, 
  Info, 
  Flame, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EventInput } from '../types/event';
import { SAMPLE_SCENARIOS, SampleScenario } from '../data/sampleScenarios';

interface EventFormProps {
  onSubmit: (input: EventInput) => Promise<void>;
  isLoading: boolean;
  initialValues?: EventInput | null;
  onSelectSample: (scenario: SampleScenario) => void;
}

const EVENT_TYPES = [
  'Wedding / Sangeet & Reception',
  'Ghazal & Musical Mehfil',
  'Milestone Birthday',
  'Anniversary Celebration',
  'Corporate Gala & Awards',
  'Cultural Festive Dinner (Eid, Diwali, Holiday)',
  'Intimate Dining & Poetry Soiree',
  'Custom Celebration',
];

const VENUE_TYPES = [
  'Heritage Haveli / Palace Courtyard',
  'Luxury Hotel Ballroom & Lawn',
  'Open-Air Garden Pavilion / Glasshouse',
  'Private Rooftop Conservatory',
  'Boutique Banquet Hall',
  'Private Estate / Residence',
  'Waterfront / Beachside Deck',
];

const CURRENCIES: Array<{ code: EventInput['currency']; symbol: string; label: string }> = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'CAD', symbol: '$', label: 'CAD ($)' },
];

const POPULAR_VIBES = [
  'Royal Mughal & Velvet Luxury',
  'Warm Candlelit Midnight Ghazal',
  'Bohemian Sufi Chic & Florals',
  'Contemporary Minimalist Luxe',
  'Heritage Rajasthani Grandeur',
  'Pastel Romance & Rose Gold',
];

const POPULAR_CUISINES = [
  'Awadhi Dum Cooking & Live Kebab Counters',
  'Progressive Indian Tapas & Chaat Bar',
  'Modern Pan-Middle Eastern & Mezze',
  'Royal Rajputana Thali & Mithai Feast',
  'Gourmet Multi-Course Plated Banquet',
  'Pure Vegetarian & Jain Artisanal Spread',
];

const POPULAR_ENTERTAINMENT = [
  'Live Ghazal Ensemble with Harmonium & Tabla',
  'Sufi Qawwali Troupe followed by DJ & Dhol',
  'Acoustic Sitar, Sarangi & Flute Quartet',
  'Progressive Fusion Band & Ambient Soundscape',
  'Classical Vocal Recital & Sher-o-Shayari Open Mic',
];

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  isLoading,
  initialValues,
  onSelectSample,
}) => {
  // Today's date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<EventInput>(() => {
    if (initialValues) return initialValues;
    return {
      eventType: 'Wedding / Sangeet & Reception',
      eventTitle: '',
      date: '2026-11-20',
      startTime: '18:30',
      durationHours: 6,
      location: 'Udaipur, Rajasthan',
      venueType: 'Heritage Haveli / Palace Courtyard',
      guestCount: 200,
      budget: 2500000,
      currency: 'INR',
      vibeAndTheme: 'Royal Mughal & Velvet Luxury with fragrant mogra garlands and brass chandeliers',
      cuisinePreference: 'Awadhi Dum Cooking & Live Kebab Counters',
      entertainmentPreference: 'Live Ghazal Ensemble with Harmonium & Tabla',
      specialRequirements: 'Low baithak seating near the stage for family elders, and welcome rosewater station.',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventType.trim()) {
      newErrors.eventType = 'Please select an event type.';
    }
    if (!formData.date) {
      newErrors.date = 'Event date is required.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Please provide a city or location.';
    }
    if (!formData.guestCount || formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1.';
    }
    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = 'Please enter a valid budget amount.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to top of form or first error
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    await onSubmit(formData);
  };

  const handleScenarioClick = (scenario: SampleScenario) => {
    setFormData({ ...scenario.data });
    setErrors({});
    onSelectSample(scenario);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Welcome banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/40 text-amber-300 text-xs font-medium tracking-wide mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Curate Memorable Celebrations With Cultural Soul & Precision</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-100 mb-3">
          Plan Your Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400 font-display">Mehfil</span>
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          From palatial sangeets and intimate midnight ghazal nights to milestone galas and festive feasts. 
          Generate an intelligent, personalized timeline, mathematical budget breakdown, vendor procurement blueprint, and curated menu.
        </p>

        {/* Quick Sample Scenarios Pills */}
        <div className="mt-6 pt-5 border-t border-stone-800/80">
          <p className="text-xs font-semibold text-amber-200/80 uppercase tracking-widest mb-3">
            One-Click Curated Scenarios For Instant Testing
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-left">
            {SAMPLE_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioClick(scenario)}
                className="group p-3 rounded-xl border border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-amber-500/50 transition-all text-left flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
              >
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 group-hover:text-amber-300">
                    {scenario.badge}
                  </span>
                  <h4 className="text-xs font-medium text-stone-200 mt-1 line-clamp-1 group-hover:text-white">
                    {scenario.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                    {scenario.tagline}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-amber-400/80 flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform">
                  Load Preset <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-stone-900/80 border border-stone-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative">
        <div className="space-y-8">
          {/* Section 1: Event Identity */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-800">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-serif font-semibold text-stone-200">
                1. Celebration Essentials
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventType" className="block text-xs font-medium text-stone-300 mb-1.5">
                  Event Type <span className="text-rose-400">*</span>
                </label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-stone-900 text-stone-100">
                      {type}
                    </option>
                  ))}
                </select>
                {errors.eventType && <p className="text-xs text-rose-400 mt-1">{errors.eventType}</p>}
              </div>

              <div>
                <label htmlFor="eventTitle" className="block text-xs font-medium text-stone-300 mb-1.5">
                  Event Title or Couple/Host Name <span className="text-stone-500 text-[11px]">(Optional)</span>
                </label>
                <input
                  id="eventTitle"
                  type="text"
                  placeholder="e.g. Maya & Rohan's Sangeet, Golden Jubilee Soiree"
                  value={formData.eventTitle || ''}
                  onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="eventDate" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Event Date <span className="text-rose-400">*</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                {errors.date && <p className="text-xs text-rose-400 mt-1">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="startTime" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="durationHours" className="block text-xs font-medium text-stone-300 mb-1.5">
                    Duration (Hours)
                  </label>
                  <input
                    id="durationHours"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) || 1 })}
                    className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Space */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-800">
              <MapPin className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-serif font-semibold text-stone-200">
                2. Location & Venue Setting
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-xs font-medium text-stone-300 mb-1.5">
                  City & Region / Destination <span className="text-rose-400">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Udaipur, London, New York, Mumbai, Dubai"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                {errors.location && <p className="text-xs text-rose-400 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label htmlFor="venueType" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Venue Archetype
                </label>
                <select
                  id="venueType"
                  value={formData.venueType}
                  onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  {VENUE_TYPES.map((venue) => (
                    <option key={venue} value={venue} className="bg-stone-900 text-stone-100">
                      {venue}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Scale & Budget Math */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-800">
              <Coins className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-serif font-semibold text-stone-200">
                3. Guests & Financial Scope
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guest Count */}
              <div>
                <label htmlFor="guestCount" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Guest Count <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    {formData.guestCount} Guests
                  </span>
                </label>
                <input
                  id="guestCount"
                  type="number"
                  min="5"
                  max="5000"
                  step="5"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                />
                {errors.guestCount && <p className="text-xs text-rose-400 mt-1">{errors.guestCount}</p>}
                
                {/* Guest Quick Buttons */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[25, 60, 120, 250, 450].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setFormData({ ...formData, guestCount: count })}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                        formData.guestCount === count
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-stone-800/60 text-stone-400 border-stone-700/60 hover:text-stone-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget & Currency */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Total Planned Budget <span className="text-rose-400">*</span></span>
                  {formData.budget > 0 && formData.guestCount > 0 && (
                    <span className="text-[11px] text-stone-400 font-mono">
                      ~{Math.round(formData.budget / formData.guestCount).toLocaleString()} / guest
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as EventInput['currency'] })}
                    className="w-28 bg-stone-950/80 border border-stone-700/80 rounded-xl px-2 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-stone-900 text-stone-100">
                        {curr.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Math.max(0, Number(e.target.value)) })}
                    placeholder="Enter total amount"
                    className="flex-1 bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                {errors.budget && <p className="text-xs text-rose-400 mt-1">{errors.budget}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Atmosphere, Cuisine & Music */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-800">
              <Palette className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-serif font-semibold text-stone-200">
                4. Vibe, Culinary & Entertainment Styling
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="vibeAndTheme" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Aesthetic, Theme & Ambiance Notes</span>
                  <span className="text-[11px] text-amber-400/80">Click preset to append</span>
                </label>
                <textarea
                  id="vibeAndTheme"
                  rows={2}
                  value={formData.vibeAndTheme}
                  onChange={(e) => setFormData({ ...formData, vibeAndTheme: e.target.value })}
                  placeholder="e.g. Royal Mughal elegance, warm brass lanterns, velvet bolsters, fresh mogra & rose fragrance..."
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_VIBES.map((vibe) => (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => setFormData({ ...formData, vibeAndTheme: vibe })}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/60 hover:bg-stone-800 text-stone-300 border border-stone-700/60 transition-colors"
                    >
                      + {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cuisinePreference" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                    Gastronomy & Culinary Focus
                  </label>
                  <input
                    id="cuisinePreference"
                    type="text"
                    value={formData.cuisinePreference}
                    onChange={(e) => setFormData({ ...formData, cuisinePreference: e.target.value })}
                    placeholder="e.g. Awadhi Dum & Kebab Counters, Chaat Bar, Mediterranean Mezze"
                    className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="entertainmentPreference" className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    Music & Entertainment Ensemble
                  </label>
                  <input
                    id="entertainmentPreference"
                    type="text"
                    value={formData.entertainmentPreference}
                    onChange={(e) => setFormData({ ...formData, entertainmentPreference: e.target.value })}
                    placeholder="e.g. Live Ghazal Duo with Harmonium, Sufi Qawwali, Acoustic Quartet"
                    className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialRequirements" className="block text-xs font-medium text-stone-300 mb-1.5">
                  Special Hospitality Requests & Cultural Nuances <span className="text-stone-500 text-[11px]">(Optional)</span>
                </label>
                <input
                  id="specialRequirements"
                  type="text"
                  value={formData.specialRequirements || ''}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  placeholder="e.g. Elder-friendly baithak seating near stage, rosewater ittar welcome, rain canopy contingency"
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submission and Action Buttons */}
          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full privacy: Gemini API key kept securely server-side.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-950/50 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-98"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Curating Mehfil Experience...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  <span className="text-sm font-bold tracking-wide">Generate Personalized Mehfil Plan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
