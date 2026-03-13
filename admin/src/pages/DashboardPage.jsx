// admin/src/pages/DashboardPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats, fetchUsers } from '../store/dashboardThunks';
import { Users, CreditCard, TrendingUp, Loader2, RefreshCw, FileText } from 'lucide-react';
import StatCard from '../components/StatCard';
import UsersTable from '../components/UsersTable';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, users, payments, loading, error, pagination } = useSelector(state => state.dashboard);

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  const refreshData = () => {
    dispatch(fetchAdminStats());
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  };

  if (loading && !stats.totalUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get dynamic names if available
  const standardInfo = stats.pricing?.find(p => p.tier === 'standard');
  const premiumInfo = stats.pricing?.find(p => p.tier === 'premium');

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your platform overview.</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<Users className="w-8 h-8" />}
          color="orange"
          trend={stats.userGrowth !== undefined ? `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth}% this month` : 'Loading...'}
        />
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs || 0}
          icon={<FileText className="w-8 h-8" />}
          color="indigo"
          trend={stats.jobGrowth !== undefined ? `${stats.jobGrowth >= 0 ? '+' : ''}${stats.jobGrowth}% this month` : 'Loading...'}
        />
        <StatCard
          title={`${standardInfo?.name || 'Standard'} Revenue`}
          value={`$${(stats.standardRevenue || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<CreditCard className="w-8 h-8" />}
          color="blue"
          trend={stats.standardGrowth !== undefined ? `${stats.standardGrowth >= 0 ? '+' : ''}${stats.standardGrowth}% this month` : 'Loading...'}
        />
        <StatCard
          title={`${premiumInfo?.name || 'Premium'} Revenue`}
          value={`$${(stats.premiumRevenue || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-8 h-8" />}
          color="green"
          trend={stats.premiumGrowth !== undefined ? `${stats.premiumGrowth >= 0 ? '+' : ''}${stats.premiumGrowth}% this month` : 'Loading...'}
        />
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        pagination={pagination.users}
        onPageChange={(page) => dispatch(fetchUsers({ page, limit: 10 }))}
      />
    </div>
  );
};

export default DashboardPage;
