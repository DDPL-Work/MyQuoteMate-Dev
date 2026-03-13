import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Ticket, Loader2, History } from 'lucide-react';
import api from '../services/api';

const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    expiresAt: '',
    maxUses: '',
    minPurchaseAmount: '',
    applicableTiers: []
  });

  const [usageHistory, setUsageHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchDiscounts();
    fetchUsageHistory();
  }, []);

  const fetchUsageHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/discounts/history');
      setUsageHistory(response.data.data);
    } catch (err) {
      console.error('Failed to fetch usage history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/discounts');
      setDiscounts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleTier = (tier) => {
    setFormData(prev => ({
      ...prev,
      applicableTiers: prev.applicableTiers.includes(tier)
        ? prev.applicableTiers.filter(t => t !== tier)
        : [...prev.applicableTiers, tier]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0
      };

      if (editingId) {
        await api.put(`/discounts/${editingId}`, submitData);
      } else {
        await api.post('/discounts', submitData);
      }
      fetchDiscounts();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: '',
        maxUses: '',
        minPurchaseAmount: '',
        applicableTiers: []
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save discount');
    }
  };

  const handleEdit = (discount) => {
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      description: discount.description,
      startDate: discount.startDate ? discount.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expiresAt: discount.expiresAt ? discount.expiresAt.split('T')[0] : '',
      maxUses: discount.maxUses ? discount.maxUses.toString() : '',
      minPurchaseAmount: discount.minPurchaseAmount ? discount.minPurchaseAmount.toString() : '',
      applicableTiers: discount.applicableTiers || []
    });
    setEditingId(discount._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await api.delete(`/discounts/${id}`);
        fetchDiscounts();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete discount');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      expiresAt: '',
      maxUses: '',
      minPurchaseAmount: '',
      applicableTiers: []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-8 h-8 text-orange-500" />
            Coupons & Discounts
          </h1>
          <p className="text-gray-600 mt-2">Create and manage discount codes and coupons.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Discount
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Discount' : 'Create Discount'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="code"
                    placeholder="Discount Code (e.g., SAVE20)"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 uppercase"
                    required
                  />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="value"
                    placeholder="Discount Value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    placeholder="Min Purchase Amount (optional)"
                    value={formData.minPurchaseAmount}
                    onChange={handleInputChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    step="0.01"
                  />
                </div>

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                  rows="2"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="maxUses"
                    placeholder="Max Uses (optional)"
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Tiers</label>
                  <div className="space-y-2">
                    {['standard', 'premium'].map(tier => (
                      <label key={tier} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.applicableTiers.includes(tier)}
                          onChange={() => toggleTier(tier)}
                          className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize cursor-pointer">{tier}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors font-medium"
                  >
                    {editingId ? 'Update Discount' : 'Create Discount'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Table */}
      {discounts.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No discounts yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Validity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Max Uses</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.map(discount => (
                <tr key={discount._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{discount.code}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{discount.description}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-green-600 font-medium">Start: {new Date(discount.startDate).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}</span>
                      <span className="text-xs text-red-600 font-medium">End: {discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' }) : 'Never'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{discount.maxUses || 'Unlimited'}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;
