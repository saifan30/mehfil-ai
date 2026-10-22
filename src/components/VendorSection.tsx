import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Trash2, 
  ChevronDown, 
  Filter,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { VendorItem, VendorStatus, PriorityLevel } from '../types/event';
import { formatCurrency } from '../utils/formatters';

interface VendorSectionProps {
  vendors: VendorItem[];
  currency: string;
  onUpdateVendors: (updatedVendors: VendorItem[]) => void;
}

const STATUS_OPTIONS: VendorStatus[] = [
  'To Inquire',
  'Shortlisted',
  'Quote Received',
  'Contract Signed',
  'Deposit Paid',
  'Fully Paid',
];

const STATUS_STYLES: Record<VendorStatus, { bg: string; text: string; border: string }> = {
  'To Inquire': { bg: 'bg-stone-800', text: 'text-stone-300', border: 'border-stone-700' },
  'Shortlisted': { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
  'Quote Received': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
  'Contract Signed': { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
  'Deposit Paid': { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700/50' },
  'Fully Paid': { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
};

const PRIORITY_STYLES: Record<PriorityLevel, { text: string; border: string }> = {
  Critical: { text: 'text-rose-400', border: 'border-rose-500/40' },
  High: { text: 'text-amber-400', border: 'border-amber-500/40' },
  Medium: { text: 'text-blue-400', border: 'border-blue-500/40' },
  Low: { text: 'text-stone-400', border: 'border-stone-600/40' },
};

export const VendorSection: React.FC<VendorSectionProps> = ({
  vendors,
  currency,
  onUpdateVendors,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isAddingVendor, setIsAddingVendor] = useState<boolean>(false);

  // New vendor form state
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Catering');
  const [newRole, setNewRole] = useState<string>('');
  const [newStatus, setNewStatus] = useState<VendorStatus>('To Inquire');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('High');
  const [newEstimatedCost, setNewEstimatedCost] = useState<number>(50000);
  const [newDeadline, setNewDeadline] = useState<string>('4 weeks prior');
  const [newDeliverablesText, setNewDeliverablesText] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Filter vendors
  const filteredVendors = vendors.filter((v) => {
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || v.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  // Calculate procurement stats
  const totalVendors = vendors.length;
  const bookedOrPaidCount = vendors.filter(
    (v) => v.status === 'Contract Signed' || v.status === 'Deposit Paid' || v.status === 'Fully Paid'
  ).length;
  const totalVendorSpend = vendors.reduce((sum, v) => sum + (v.estimatedCost || 0), 0);

  // Update single vendor
  const handleUpdateSingleVendor = (id: string, updates: Partial<VendorItem>) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, ...updates } : v));
    onUpdateVendors(updated);
  };

  // Delete vendor
  const handleDeleteVendor = (id: string) => {
    if (confirm('Delete this vendor from checklist?')) {
      const updated = vendors.filter((v) => v.id !== id);
      onUpdateVendors(updated);
    }
  };

  // Toggle deliverable item
  const handleToggleDeliverable = (vendorId: string, index: number) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    // Toggle by prepending or removing a check mark indicator if desired, or maintaining state
    const item = vendor.deliverables[index];
    const isDone = item.startsWith('✓ ');
    const newItem = isDone ? item.replace('✓ ', '') : `✓ ${item}`;

    const newDeliverables = [...vendor.deliverables];
    newDeliverables[index] = newItem;

    handleUpdateSingleVendor(vendorId, { deliverables: newDeliverables });
  };

  // Add new vendor
  const handleAddVendor = () => {
    if (!newName.trim()) return;

    const deliverables = newDeliverablesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newVendor: VendorItem = {
      id: `v-custom-${Date.now()}`,
      name: newName,
      category: newCategory,
      role: newRole || `${newCategory} Specialist`,
      status: newStatus,
      priority: newPriority,
      estimatedCost: Number(newEstimatedCost) || 0,
      deliverables: deliverables.length > 0 ? deliverables : ['Standard service delivery'],
      contactNotes: newNotes,
      bookingDeadline: newDeadline,
    };

    onUpdateVendors([...vendors, newVendor]);
    setIsAddingVendor(false);
    setNewName('');
    setNewRole('');
    setNewDeliverablesText('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            Vendor Procurement Hub & Checklist
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Track contracts, payment milestones, key deliverables, and booking deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsAddingVendor(true)}
          type="button"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Procurement Progress Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
            Contracted / Booked
          </span>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {bookedOrPaidCount} of {totalVendors} Vendors
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">
            {totalVendors > 0 ? Math.round((bookedOrPaidCount / totalVendors) * 100) : 0}% locked in
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
            Estimated Vendor Total
          </span>
          <div className="text-lg font-bold font-mono text-amber-300">
            {formatCurrency(totalVendorSpend, currency)}
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">
            Sum of all estimated quotes
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/60">
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block mb-1">
            High / Critical Priority
          </span>
          <div className="text-lg font-bold font-mono text-rose-400">
            {vendors.filter((v) => v.priority === 'Critical' || v.priority === 'High').length} Vendors
          </div>
          <span className="text-[10px] text-stone-500 mt-0.5 block">
            Require priority attention
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-400 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
        </div>
        {['All', ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Add Vendor Panel */}
      {isAddingVendor && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-3">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Add New Vendor Partner
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Vendor / Company Name</label>
              <input
                type="text"
                placeholder="e.g. Royal Mehfil Soundworks"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Catering, Sound & AV, Decor, Photography"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Specific Role</label>
              <input
                type="text"
                placeholder="e.g. Lead Sitar & Vocalist, Master Halwai"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Procurement Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as VendorStatus)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-100"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-stone-100"
              >
                {['Critical', 'High', 'Medium', 'Low'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Estimated Cost ({currency})</label>
              <input
                type="number"
                value={newEstimatedCost}
                onChange={(e) => setNewEstimatedCost(Number(e.target.value) || 0)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Booking Deadline</label>
              <input
                type="text"
                placeholder="e.g. 4 weeks prior"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-stone-300 mb-1">Deliverables (one per line)</label>
            <textarea
              rows={2}
              placeholder="e.g. Line array speaker set&#10;Wireless microphones&#10;On-site sound technician"
              value={newDeliverablesText}
              onChange={(e) => setNewDeliverablesText(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAddingVendor(false)}
              className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddVendor}
              disabled={!newName.trim()}
              className="px-4 py-1 text-xs font-semibold bg-amber-400 text-stone-950 rounded-lg hover:bg-amber-300 disabled:opacity-50"
            >
              Save Vendor
            </button>
          </div>
        </div>
      )}

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => {
          const statusStyle = STATUS_STYLES[vendor.status] || STATUS_STYLES['To Inquire'];
          const priorityStyle = PRIORITY_STYLES[vendor.priority] || PRIORITY_STYLES['Medium'];

          return (
            <div
              key={vendor.id}
              className="p-4 rounded-xl border border-stone-800 bg-stone-900/80 hover:border-amber-700/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      {vendor.category}
                    </span>
                    <h4 className="text-sm font-semibold text-stone-100 mt-0.5">
                      {vendor.name}
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">{vendor.role}</p>
                  </div>

                  {/* Priority & Delete */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${priorityStyle.text} ${priorityStyle.border} bg-stone-950/60`}
                    >
                      {vendor.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove vendor"
                      aria-label={`Remove ${vendor.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Dropdown & Estimated Cost */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-400">Status:</span>
                    <select
                      value={vendor.status}
                      aria-label={`Procurement status for ${vendor.name}`}
                      onChange={(e) =>
                        handleUpdateSingleVendor(vendor.id, {
                          status: e.target.value as VendorStatus,
                        })
                      }
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} focus:outline-none cursor-pointer`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st} className="bg-stone-900 text-stone-100">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="font-mono text-xs font-bold text-amber-300">
                    {formatCurrency(vendor.estimatedCost, currency)}
                  </div>
                </div>

                {/* Deliverables Checklist */}
                {vendor.deliverables && vendor.deliverables.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
                      Deliverables Checklist:
                    </span>
                    <ul className="space-y-1">
                      {vendor.deliverables.map((item, idx) => {
                        const isDone = item.startsWith('✓ ');
                        const labelText = isDone ? item.replace('✓ ', '') : item;
                        return (
                          <li key={idx}>
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isDone}
                              onClick={() => handleToggleDeliverable(vendor.id, idx)}
                              className="w-full text-left flex items-start gap-2 text-xs text-stone-300 hover:text-stone-100 p-0.5 rounded focus-visible:ring-1 focus-visible:ring-amber-400 focus:outline-none"
                            >
                              <span className="mt-0.5 text-amber-400 shrink-0">
                                {isDone ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-stone-500" />
                                )}
                              </span>
                              <span className={isDone ? 'line-through text-stone-400' : ''}>
                                {labelText}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer row: Deadline and Contact Notes */}
              <div className="mt-3 pt-2.5 border-t border-stone-800 text-[11px] text-stone-400 space-y-1">
                {vendor.bookingDeadline && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400/80" />
                    <span>Target deadline: <strong className="text-stone-300">{vendor.bookingDeadline}</strong></span>
                  </div>
                )}
                {vendor.contactNotes && (
                  <div className="text-[11px] text-stone-400 italic">
                    "{vendor.contactNotes}"
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredVendors.length === 0 && (
          <div className="col-span-2 text-center py-8 text-stone-500 text-xs">
            No vendors match the current filter.
          </div>
        )}
      </div>
    </div>
  );
};
