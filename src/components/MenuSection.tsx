import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, Sparkles, Coffee, Wine } from 'lucide-react';
import { MenuSection as MenuSectionType, MenuItem } from '../types/event';

interface MenuSectionProps {
  menu: MenuSectionType[];
  onUpdateMenu: (updatedMenu: MenuSectionType[]) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menu,
  onUpdateMenu,
}) => {
  const [activeCourseIndex, setActiveCourseIndex] = useState<number>(0);
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemDietary, setNewItemDietary] = useState<string>('Vegetarian');

  const handleAddItem = (sectionIndex: number) => {
    if (!newItemName.trim()) return;
    const newItem: MenuItem = {
      name: newItemName,
      description: newItemDesc || 'Chef curated celebration delicacy',
      dietary: newItemDietary,
    };

    const updatedMenu = [...menu];
    updatedMenu[sectionIndex].items.push(newItem);
    onUpdateMenu(updatedMenu);

    setIsAddingItem(false);
    setNewItemName('');
    setNewItemDesc('');
  };

  const handleDeleteItem = (sectionIndex: number, itemIndex: number) => {
    const updatedMenu = [...menu];
    updatedMenu[sectionIndex].items.splice(itemIndex, 1);
    onUpdateMenu(updatedMenu);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-500" />
            Curated Feast & Dastarkhwan Gastronomy
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Sensory culinary journeys paired with signature celebration elixirs and traditional confections.
          </p>
        </div>

        <button
          onClick={() => setIsAddingItem(true)}
          type="button"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Dish</span>
        </button>
      </div>

      {/* Course Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {menu.map((section, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveCourseIndex(idx);
              setIsAddingItem(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeCourseIndex === idx
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            {section.title} ({section.items.length})
          </button>
        ))}
      </div>

      {/* Add Item Modal / Inline Form */}
      {isAddingItem && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-3">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Add Delicacy to {menu[activeCourseIndex]?.title || 'Menu'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-stone-300 mb-1">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Kashmiri Zafrani Rogan Josh, Smoked Paneer Tikka"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Dietary Tags</label>
              <select
                value={newItemDietary}
                onChange={(e) => setNewItemDietary(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-100"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal / Gourmet Meat">Halal / Meat</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Chef Signature">Chef Signature</option>
                <option value="Sweet / Dessert">Sweet / Dessert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-stone-300 mb-1">Culinary Description</label>
            <input
              type="text"
              placeholder="e.g. Slow simmered with saffron, cardamom and brown shallots"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAddingItem(false)}
              className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAddItem(activeCourseIndex)}
              disabled={!newItemName.trim()}
              className="px-4 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 disabled:opacity-50"
            >
              Add Dish
            </button>
          </div>
        </div>
      )}

      {/* Active Section Content */}
      {menu[activeCourseIndex] && (
        <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur-sm space-y-4">
          <div className="pb-3 border-b border-stone-800">
            <h4 className="font-serif text-lg font-bold text-amber-200">
              {menu[activeCourseIndex].title}
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              {menu[activeCourseIndex].description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu[activeCourseIndex].items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className="p-3.5 rounded-xl border border-stone-800 bg-stone-950/60 flex items-start justify-between gap-3 group hover:border-amber-700/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-stone-100">
                      {item.name}
                    </h5>
                    {item.dietary && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-950/40 text-amber-300">
                        {item.dietary}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteItem(activeCourseIndex, itemIdx)}
                  className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 p-1 transition-opacity"
                  title="Remove dish"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
