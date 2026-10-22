import React, { useState } from 'react';
import { LayoutGrid, Plus, Users, Sparkles, Lamp, Trash2 } from 'lucide-react';
import { ZoneLayout } from '../types/event';

interface ZonesSectionProps {
  zones: ZoneLayout[];
  onUpdateZones: (updatedZones: ZoneLayout[]) => void;
  guestCount: number;
}

export const ZonesSection: React.FC<ZonesSectionProps> = ({
  zones,
  onUpdateZones,
  guestCount,
}) => {
  const [isAddingZone, setIsAddingZone] = useState<boolean>(false);
  const [zoneName, setZoneName] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [seatingType, setSeatingType] = useState<string>('Tiered low baithak cushions & Persian rugs');
  const [capacity, setCapacity] = useState<number>(50);
  const [ambianceDetails, setAmbianceDetails] = useState<string>('');

  const handleAddZone = () => {
    if (!zoneName.trim()) return;
    const newZone: ZoneLayout = {
      zoneName,
      purpose: purpose || 'Celebration space',
      seatingType,
      capacity: Number(capacity) || 20,
      ambianceDetails: ambianceDetails || 'Warm amber lighting and scented candles',
    };

    onUpdateZones([...zones, newZone]);
    setIsAddingZone(false);
    setZoneName('');
    setPurpose('');
    setAmbianceDetails('');
  };

  const handleDeleteZone = (index: number) => {
    if (confirm('Delete this layout zone?')) {
      const updated = zones.filter((_, idx) => idx !== index);
      onUpdateZones(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-500" />
            Spatial Architecture & Seating Zones
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Organized acoustic zones, royal baithak seating arrangements, and hospitality circulation pathways.
          </p>
        </div>

        <button
          onClick={() => setIsAddingZone(true)}
          type="button"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Zone</span>
        </button>
      </div>

      {/* Add Zone Inline Form */}
      {isAddingZone && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-3">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Create Layout Zone
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="new-zone-name" className="block text-[11px] text-stone-300 mb-1">Zone Name</label>
              <input
                id="new-zone-name"
                type="text"
                placeholder="e.g. The Ghazal Baithak, Shahi Courtyard"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label htmlFor="new-zone-seating" className="block text-[11px] text-stone-300 mb-1">Seating Style</label>
              <input
                id="new-zone-seating"
                type="text"
                placeholder="e.g. Low gaddi cushions, high cocktail tables"
                value={seatingType}
                onChange={(e) => setSeatingType(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label htmlFor="new-zone-capacity" className="block text-[11px] text-stone-300 mb-1">Capacity (Guests)</label>
              <input
                id="new-zone-capacity"
                type="number"
                min="5"
                max="2000"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-zone-purpose" className="block text-[11px] text-stone-300 mb-1">Primary Purpose</label>
              <input
                id="new-zone-purpose"
                type="text"
                placeholder="e.g. Live music listening and tea service"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label htmlFor="new-zone-ambiance" className="block text-[11px] text-stone-300 mb-1">Ambiance & Lighting</label>
              <input
                id="new-zone-ambiance"
                type="text"
                placeholder="e.g. Amber lantern glow, brass urlis with floating petals"
                value={ambianceDetails}
                onChange={(e) => setAmbianceDetails(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAddingZone(false)}
              className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddZone}
              disabled={!zoneName.trim()}
              className="px-4 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 disabled:opacity-50"
            >
              Save Zone
            </button>
          </div>
        </div>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-stone-800 bg-stone-900/70 hover:border-amber-700/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">
                    Zone 0{idx + 1}
                  </span>
                  <h4 className="font-serif text-base font-bold text-stone-100 mt-0.5">
                    {zone.zoneName}
                  </h4>
                </div>
                <button
                  onClick={() => handleDeleteZone(idx)}
                  className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 p-1 transition-opacity"
                  title="Delete zone"
                  aria-label={`Delete ${zone.zoneName}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {zone.purpose}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-800 space-y-2 text-xs">
                <div>
                  <span className="text-[11px] text-stone-400 font-medium block">Seating Architecture:</span>
                  <span className="text-stone-200">{zone.seatingType}</span>
                </div>

                <div className="flex items-center gap-2 text-stone-300">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Capacity: <strong className="font-mono text-amber-300">{zone.capacity}</strong> guests</span>
                </div>

                {zone.ambianceDetails && (
                  <div className="flex items-start gap-2 text-stone-400 text-[11px] pt-1">
                    <Lamp className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="italic">{zone.ambianceDetails}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
