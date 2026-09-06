import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowUpDown,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import { HostingPlan, PlanCategory } from '../../types';
import {
  fetchPlans,
  savePlan,
  deletePlanDoc,
  fetchCategories,
} from '../../firebase/firestoreService';
import { useAuth } from '../../firebase/authContext';

export const AdminPlansTab: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [categories, setCategories] = useState<PlanCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<HostingPlan | null>(null);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<HostingPlan | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState<number | string>(9.99);
  const [formCurrency, setFormCurrency] = useState('$');
  const [formBillingPeriod, setFormBillingPeriod] = useState('/mo');
  const [formRam, setFormRam] = useState('');
  const [formCpu, setFormCpu] = useState('');
  const [formStorage, setFormStorage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeaturesText, setFormFeaturesText] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formIcon, setFormIcon] = useState('Layers');
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsBestValue, setFormIsBestValue] = useState(false);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState(true);
  const [formDiscordCtaText, setFormDiscordCtaText] = useState('Buy Plan on Discord');
  const [formDiscordDestination, setFormDiscordDestination] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, cList] = await Promise.all([fetchPlans(), fetchCategories()]);
      setPlans(pList);
      setCategories(cList);
    } catch (err) {
      console.warn('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Performance Tier');
    setFormPrice(9.99);
    setFormCurrency('$');
    setFormBillingPeriod('/mo');
    setFormRam('8 GB DDR5');
    setFormCpu('200% Ryzen 9');
    setFormStorage('80 GB NVMe');
    setFormDescription('High-speed Minecraft hosting node with unmetered bandwidth.');
    setFormFeaturesText('8 GB DDR5 Memory\n2 vCPUs Ryzen 9 7950X\n80 GB Gen4 NVMe\n2.5 Tbps DDoS Shield\nDiscord Priority Support');
    setFormBadge('');
    setFormIcon('Zap');
    setFormIsPopular(false);
    setFormIsBestValue(false);
    setFormDisplayOrder(plans.length + 1);
    setFormActive(true);
    setFormDiscordCtaText('Buy Plan on Discord');
    setFormDiscordDestination('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: HostingPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormCategory(plan.category);
    setFormPrice(plan.price);
    setFormCurrency(plan.currency || '$');
    setFormBillingPeriod(plan.billingPeriod || '/mo');
    setFormRam(plan.ram);
    setFormCpu(plan.cpu);
    setFormStorage(plan.storage);
    setFormDescription(plan.description);
    setFormFeaturesText((plan.features || []).join('\n'));
    setFormBadge(plan.badge || '');
    setFormIcon(plan.icon || 'Layers');
    setFormIsPopular(!!plan.isPopular);
    setFormIsBestValue(!!plan.isBestValue);
    setFormDisplayOrder(plan.displayOrder || 1);
    setFormActive(plan.active);
    setFormDiscordCtaText(plan.discordCtaText || 'Buy Plan on Discord');
    setFormDiscordDestination(plan.discordDestination || '');
    setIsModalOpen(true);
  };

  const handleDuplicatePlan = async (plan: HostingPlan) => {
    const duplicated: HostingPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      name: `${plan.name} (Copy)`,
      displayOrder: plans.length + 1,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    await savePlan(duplicated, user?.email || 'Admin');
    await loadData();
  };

  const handleToggleActive = async (plan: HostingPlan) => {
    const updated = { ...plan, active: !plan.active };
    await savePlan(updated, user?.email || 'Admin');
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
  };

  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    const featuresArray = formFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const planToSave: HostingPlan = {
      id: editingPlan?.id || `plan-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      price: formPrice,
      currency: formCurrency,
      billingPeriod: formBillingPeriod,
      ram: formRam.trim(),
      cpu: formCpu.trim(),
      storage: formStorage.trim(),
      description: formDescription.trim(),
      features: featuresArray,
      badge: formBadge.trim() ? formBadge.trim() : undefined,
      icon: formIcon,
      isPopular: formIsPopular,
      isBestValue: formIsBestValue,
      displayOrder: Number(formDisplayOrder) || 1,
      active: formActive,
      discordCtaText: formDiscordCtaText.trim() || 'Buy Plan on Discord',
      discordDestination: formDiscordDestination.trim() ? formDiscordDestination.trim() : undefined,
      createdDate: editingPlan?.createdDate || new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    try {
      await savePlan(planToSave, user?.email || 'Admin');
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving plan:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlanDoc(planId, user?.email || 'Admin');
      setDeleteConfirmPlan(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ram.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Hosting Plans Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure dynamic plans, RAM, CPU clocking, pricing, and custom Discord destinations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plans (RAM, Name)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plans Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No plans match the search criteria.
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Hardware Specs</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #{plan.displayOrder}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{plan.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{plan.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {plan.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400">
                        {plan.currency}{plan.price}
                      </span>
                      <span className="text-[10px] text-slate-500">{plan.billingPeriod}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] font-medium text-white">{plan.ram}</div>
                      <div className="text-[10px] text-slate-400">
                        {plan.cpu} • {plan.storage}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {plan.isPopular && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            POPULAR
                          </span>
                        )}
                        {plan.isBestValue && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            BEST VALUE
                          </span>
                        )}
                        {plan.badge && !plan.isPopular && !plan.isBestValue && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(plan)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          plan.active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {plan.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{plan.active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePlan(plan)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                          title="Duplicate Plan"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmPlan(plan)}
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Form Modal (Create or Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Hosting Plan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netherite Pro"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="w-14 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-center"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={formBillingPeriod}
                      onChange={(e) => setFormBillingPeriod(e.target.value)}
                      className="w-16 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Hardware Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">RAM Memory *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 16 GB DDR5"
                    value={formRam}
                    onChange={(e) => setFormRam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPU Allocation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400% Ryzen 9"
                    value={formCpu}
                    onChange={(e) => setFormCpu(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NVMe Storage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 150 GB NVMe"
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                  placeholder="Short marketing summary of the server plan..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Features List (One feature per line)
                </label>
                <textarea
                  rows={4}
                  value={formFeaturesText}
                  onChange={(e) => setFormFeaturesText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 font-mono"
                  placeholder="16 GB DDR5 ECC RAM&#10;Ryzen 9 7950X @ 5.7GHz&#10;Path.net 2.5+ Tbps DDoS Shield&#10;Free Dedicated Subdomain"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Card Badge Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BEST VALUE or MOST POPULAR"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Icon Style</label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Layers">Layers (Default)</option>
                    <option value="Box">Box (Starter)</option>
                    <option value="Zap">Zap (Lightning/Pro)</option>
                    <option value="Gem">Gem (Diamond/Value)</option>
                    <option value="Crown">Crown (Enterprise)</option>
                    <option value="Flame">Flame (Extreme)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={formDiscordCtaText}
                    onChange={(e) => setFormDiscordCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Custom Discord Link (Leave empty to use main)
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.gg/custom-channel"
                    value={formDiscordDestination}
                    onChange={(e) => setFormDiscordDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-white font-semibold">Mark as "Popular"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBestValue}
                    onChange={(e) => setFormIsBestValue(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-white font-semibold">Mark as "Best Value"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-white font-semibold">Active & Visible</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Prompt Requirement #19) */}
      {deleteConfirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Hosting Plan?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmPlan.name}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmPlan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirmPlan.id)}
                className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white rounded-xl shadow-md transition-colors"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
