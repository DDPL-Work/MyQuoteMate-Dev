import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api';
import PaymentsTable from '../components/PaymentsTable';

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State for specific tiers
  const [standardPrice, setStandardPrice] = useState('7.99');
  const [premiumPrice, setPremiumPrice] = useState('9.99');
  const [standardId, setStandardId] = useState(null);
  const [premiumId, setPremiumId] = useState(null);

  const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, transactionCount: 0 });
  const [payments, setPayments] = useState([]);
  const [paymentsPagination, setPaymentsPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    fetchPricing();
    fetchRevenueStats();
    fetchPayments(1);
  }, []);

  const fetchRevenueStats = async () => {
    try {
      const response = await api.get('/admin/revenue');
      setRevenueStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch revenue stats:', err);
    }
  };

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pricing');
      const pricingData = response.data.data || [];

      const standardStr = pricingData.find(p => p.tier === 'standard');
      const premiumStr = pricingData.find(p => p.tier === 'premium');

      // Also check capitalized versions just in case
      const standardCap = pricingData.find(p => p.tier === 'Standard');
      const premiumCap = pricingData.find(p => p.tier === 'Premium');

      const standard = standardStr || standardCap;
      const premium = premiumStr || premiumCap;

      if (standard) {
        setStandardPrice(standard.price.toString());
        setStandardId(standard._id);
      }
      if (premium) {
        setPremiumPrice(premium.price.toString());
        setPremiumId(premium._id);
      }

      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pricing');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (page = 1) => {
    try {
      setPaymentsLoading(true);
      const response = await api.get('/admin/payments', {
        params: { page, limit: 10 }
      });
      setPayments(response.data.data);
      setPaymentsPagination(response.data.pagination || { page, limit: 10, total: response.data.data.length });
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleUpdatePrice = async (tierName, price, id) => {
    try {
      setLoading(true);
      const tierId = tierName.toLowerCase();

      const payload = {
        name: tierName,
        tier: tierId, // standard or premium
        price: parseFloat(price),
        description: tierName === 'Standard'
          ? 'One-time payment for 1 professional analysis'
          : 'Total control over complex projects',
        features: tierName === 'Standard'
          ? ['Complete AI analysis (1 credit)', 'Detailed cost breakdown', 'Red Flag detection']
          : ['Credits for 3 analyses', 'Compare 3 quotes side-by-side', 'Priority 24h processing']
      };

      if (id) {
        await api.put(`/admin/pricing/${id}`, payload);
      } else {
        await api.post('/admin/pricing', payload);
        // Refresh to get the new ID
        fetchPricing();
      }

      setSuccessMessage(`${tierName} price updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchPricing(); // Refresh to ensure sync
    } catch (err) {
      setError(err.response?.data?.error || `Failed to update ${tierName} price`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !standardId && !premiumId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading pricing...</p>
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
            <DollarSign className="w-8 h-8 text-orange-500" />
            Payment & Pricing Management
          </h1>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 min-w-[200px] shadow-sm">
              <p className="text-orange-600 text-sm font-semibold uppercase">Total Revenue</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                ${revenueStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 min-w-[200px] shadow-sm">
              <p className="text-blue-600 text-sm font-semibold uppercase">Total Transactions</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {revenueStats.transactionCount}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pricing Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Standard Tier */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Standard Plan</h3>
                <p className="text-gray-500 text-sm">Single report analysis</p>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={standardPrice}
                  onChange={(e) => setStandardPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                />
              </div>
            </div>
            <button
              onClick={() => handleUpdatePrice('Standard', standardPrice, standardId)}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {standardId ? 'Update' : 'Set Price'}
            </button>
          </div>
        </div>

        {/* Premium Tier */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Premium Plan</h3>
                <p className="text-gray-500 text-sm">3 reports bundle</p>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all font-bold text-lg"
                />
              </div>
            </div>
            <button
              onClick={() => handleUpdatePrice('Premium', premiumPrice, premiumId)}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {premiumId ? 'Update' : 'Set Price'}
            </button>
          </div>
        </div>

      </div>

      {/* Payments Table */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        <PaymentsTable
          payments={payments}
          loading={paymentsLoading}
          pagination={paymentsPagination}
          onPageChange={fetchPayments}
        />
      </div>
    </div>
  );
};

export default PaymentPage;