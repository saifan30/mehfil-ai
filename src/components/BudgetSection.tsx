import React, { useState } from 'react';
import { 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Plus, 
  Trash2, 
  Percent, 
  CheckCircle,
  Receipt,
  Users
} from 'lucide-react';
import { BudgetItem, EventPlan } from '../types/event';
import { formatCurrency } from '../utils/formatters';

interface BudgetSectionProps {
  budgetData: EventPlan['budgetBreakdown'];
  guestCount: number;
  onUpdateBudget: (updatedBudget: EventPlan['budgetBreakdown']) => void;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budgetData,
  guestCount,
  onUpdateBudget,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryPercent, setNewCategoryPercent] = useState<number>(5);
  const [newCategoryNotes, setNewCategoryNotes] = useState<string>('');

  const currency = budgetData.currency || 'INR';
  const totalBudget = budgetData.totalBudget;

  // Calculate totals
  const totalAllocatedPercent = budgetData.items.reduce((sum, item) => sum + item.allocatedPercent, 0);
  const totalAllocatedAmount = budgetData.items.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalActualSpent = budgetData.items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  const remainingBudget = totalBudget - totalActualSpent;
  const costPerGuest = Math.round(totalBudget / Math.max(1, guestCount));

  // Handle category percent adjustment
  const handlePercentChange = (id: string, newPercent: number) => {
    const clampedPercent = Math.max(0, Math.min(100, newPercent));
    const updatedItems = budgetData.items.map((item) => {
      if (item.id === id) {
        const allocatedAmount = Math.round((clampedPercent / 100) * totalBudget);
        return {
          ...item,
          allocatedPercent: clampedPercent,
          allocatedAmount,
        };
      }
      return item;
    });

    onUpdateBudget({
      ...budgetData,
      items: updatedItems,
    });
  };

  // Handle actual spent change
  const handleActualChange = (id: string, newActual: number) => {
    const updatedItems = budgetData.items.map((item) =>
      item.id === id ? { ...item, actualAmount: Math.max(0, newActual) } : item
    );

    onUpdateBudget({
      ...budgetData,
      items: updatedItems,
    });
  };

  // Handle total budget change
  const handleTotalBudgetChange = (newTotal: number) => {
    const safeTotal = Math.max(0, newTotal);
    const updatedItems = budgetData.items.map((item) => ({
      ...item,
      allocatedAmount: Math.round((item.allocatedPercent / 100) * safeTotal),
    }));

    onUpdateBudget({
      ...budgetData,
      totalBudget: safeTotal,
      contingencyAmount: Math.round(safeTotal * 0.05),
      items: updatedItems,
    });
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this budget category?')) {
      const updatedItems = budgetData.items.filter((item) => item.id !== id);
      onUpdateBudget({
        ...budgetData,
        items: updatedItems,
      });
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const allocatedAmount = Math.round((newCategoryPercent / 100) * totalBudget);
    const newItem: BudgetItem = {
      id: `b-custom-${Date.now()}`,
      category: newCategoryName,
      allocatedPercent: newCategoryPercent,
      allocatedAmount,
      actualAmount: 0,
      notes: newCategoryNotes || 'Custom allocation',
    };

    onUpdateBudget({
      ...budgetData,
      items: [...budgetData.items, newItem],
    });

    setIsAddingCategory(false);
    setNewCategoryName('');
    setNewCategoryNotes('');
  };

  const [isEditingTotal, setIsEditingTotal] = useState<boolean>(false);
  const [tempTotalInput, setTempTotalInput] = useState<number>(budgetData.totalBudget);

  // Auto-normalize category percentages to exactly 100%
  const handleAutoBalanceTo100 = () => {
    if (budgetData.items.length === 0) return;
    const currentSum = budgetData.items.reduce((sum, item) => sum + item.allocatedPercent, 0);
    if (currentSum === 0) return;

    let runningSum = 0;
    const updatedItems = budgetData.items.map((item, idx) => {
      let newPercent: number;
      if (idx === budgetData.items.length - 1) {
        newPercent = Math.max(0, 100 - runningSum);
      } else {
        newPercent = Math.round((item.allocatedPercent / currentSum) * 100);
        runningSum += newPercent;
      }
      const allocatedAmount = Math.round((newPercent / 100) * totalBudget);
      return {
        ...item,
        allocatedPercent: newPercent,
        allocatedAmount,
      };
    });

    onUpdateBudget({
      ...budgetData,
      items: updatedItems,
    });
  };

  // Check budget health
  const percentDiff = Math.abs(100 - totalAllocatedPercent);
  const isBalanced = percentDiff < 1;

  return (
    <div className="space-y-6">
      {/* Header and key metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Celebration Budget & Expense Intelligence
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Real-time mathematical ledger, variance tracking, and contingency planning.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategory(true)}
          type="button"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
              Total Planned Budget
            </span>
            <button
              type="button"
              onClick={() => {
                setTempTotalInput(totalBudget);
                setIsEditingTotal(!isEditingTotal);
              }}
              className="text-[10px] text-amber-400 hover:text-amber-300 underline"
            >
              {isEditingTotal ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingTotal ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                min="100"
                step="500"
                value={tempTotalInput}
                onChange={(e) => setTempTotalInput(Number(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs font-mono text-amber-300"
                aria-label="New total planned budget amount"
              />
              <button
                type="button"
                onClick={() => {
                  handleTotalBudgetChange(tempTotalInput);
                  setIsEditingTotal(false);
                }}
                className="px-2 py-1 text-[11px] font-semibold bg-amber-400 text-stone-950 rounded hover:bg-amber-300"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-300">
              {formatCurrency(totalBudget, currency)}
            </div>
          )}
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Base allocation pool
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/70">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
            Actual Spent To-Date
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-stone-100">
            {formatCurrency(totalActualSpent, currency)}
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            {totalBudget > 0 ? Math.round((totalActualSpent / totalBudget) * 100) : 0}% of budget spent
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/70">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
            Remaining Liquidity
          </span>
          <div className={`text-lg sm:text-xl font-bold font-mono ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(remainingBudget, currency)}
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            {remainingBudget >= 0 ? 'Safe surplus' : 'Exceeding budget!'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/70">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>Cost Per Guest</span>
            <Users className="w-3 h-3 text-amber-400" />
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-purple-300">
            {formatCurrency(costPerGuest, currency)}
          </div>
          <span className="text-[10px] text-stone-400 mt-0.5 block">
            Across {guestCount} guests
          </span>
        </div>
      </div>

      {/* Allocation Balance Bar */}
      <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-300">Category Allocation Total:</span>
            <span className={`font-mono font-bold ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalAllocatedPercent}% {isBalanced ? '✓ 100% Balanced' : `(${100 - totalAllocatedPercent}% unallocated)`}
            </span>
          </div>
          {!isBalanced && (
            <button
              type="button"
              onClick={handleAutoBalanceTo100}
              className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 px-2.5 py-1 rounded border border-amber-600/40 transition-colors self-start sm:self-auto"
            >
              Auto-Balance Categories to 100%
            </button>
          )}
        </div>
        <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden flex">
          {budgetData.items.map((item, idx) => {
            const colors = ['bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-teal-500'];
            const colorClass = colors[idx % colors.length];
            return (
              <div
                key={item.id}
                style={{ width: `${Math.min(100, item.allocatedPercent)}%` }}
                className={`h-full ${colorClass} transition-all`}
                title={`${item.category}: ${item.allocatedPercent}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Add New Category Panel */}
      {isAddingCategory && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-3">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            Add Custom Budget Category
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Traditional Firework Display, Henna Artists"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Target Allocation (%)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={newCategoryPercent}
                onChange={(e) => setNewCategoryPercent(Number(e.target.value) || 0)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Notes / Scope</label>
              <input
                type="text"
                placeholder="Details & scope..."
                value={newCategoryNotes}
                onChange={(e) => setNewCategoryNotes(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAddingCategory(false)}
              className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 disabled:opacity-50"
            >
              Add to Budget
            </button>
          </div>
        </div>
      )}

      {/* Main Budget Items Table */}
      <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category & Scope</th>
                <th className="py-3 px-3 text-center">Allocated %</th>
                <th className="py-3 px-4 text-right">Allocated Amount</th>
                <th className="py-3 px-4 text-right">Actual Spent</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {budgetData.items.map((item) => {
                const variance = item.allocatedAmount - (item.actualAmount || 0);
                const isOverBudget = item.actualAmount > 0 && variance < 0;

                return (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-200">{item.category}</div>
                      {item.notes && (
                        <div className="text-[11px] text-stone-400 mt-0.5">{item.notes}</div>
                      )}
                    </td>

                    {/* Allocated Percent Slider / Input */}
                    <td className="py-3 px-3 text-center w-36">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.allocatedPercent}
                          onChange={(e) => handlePercentChange(item.id, Number(e.target.value))}
                          aria-label={`Allocated percent for ${item.category}`}
                          className="w-14 bg-stone-950 border border-stone-700 rounded px-1.5 py-0.5 text-center font-mono text-amber-300 text-xs focus:border-amber-500"
                        />
                        <span className="text-stone-400 font-mono">%</span>
                      </div>
                    </td>

                    {/* Allocated Amount */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-stone-200">
                      {formatCurrency(item.allocatedAmount, currency)}
                    </td>

                    {/* Actual Spent Input */}
                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.actualAmount || 0}
                        onChange={(e) => handleActualChange(item.id, Number(e.target.value))}
                        aria-label={`Actual amount spent for ${item.category}`}
                        className="w-28 bg-stone-950 border border-stone-700 rounded px-2 py-1 text-right font-mono text-stone-100 text-xs focus:border-amber-500"
                        placeholder="0"
                      />
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      <span className={isOverBudget ? 'text-rose-400' : 'text-emerald-400'}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(variance, currency)}
                      </span>
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDeleteCategory(item.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete category"
                        aria-label={`Delete ${item.category}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Saving Insights & Contingency Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Saving Tips */}
        <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wide">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            AI Cost-Optimization Insights
          </div>
          <ul className="space-y-1.5 text-xs text-stone-300">
            {(budgetData.costSavingTips || []).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">·</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contingency Fund Health */}
        <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wide">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Contingency Fund & Reserves
          </div>
          <div className="text-xs text-stone-300 leading-relaxed">
            Reserved Buffer: <span className="font-mono font-bold text-amber-300">{formatCurrency(budgetData.contingencyAmount || Math.round(totalBudget * 0.05), currency)}</span> (~5% of total budget).
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            {budgetData.budgetHealthNotes || 'Adequate reserves maintained for last-minute overtime, power backup generator fuel, and emergency weather tenting.'}
          </p>
        </div>
      </div>
    </div>
  );
};
