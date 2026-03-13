// client/src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  BarChart,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/me/reports');
      setReports(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search and status
  const filteredReports = reports
    .filter(report => {
      const matchesSearch =
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.documentType?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'processing': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Loader2 className="w-4 h-4 animate-spin" />
      },
      'pending': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <Clock className="w-4 h-4" />
      },
      'failed': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <AlertCircle className="w-4 h-4" />
      }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return config;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    processing: reports.filter(r => r.status === 'processing').length,
    failed: reports.filter(r => r.status === 'failed').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-2">View and download your analysis reports</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Processing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.processing}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Failed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.failed}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Error Loading Reports</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading your reports...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredReports.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Create your first analysis to generate a report'}
            </p>
          </div>
        )}


        {/* Reports List */}
        {!loading && filteredReports.length > 0 && (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const statusConfig = getStatusBadge(report.status);

              // Tier-based card styling
              const getTierCardClass = (tier) => {
                switch (tier?.toLowerCase()) {
                  case 'premium':
                    return 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white border-gray-700';
                  case 'standard':
                    return 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200';
                  default:
                    return 'bg-white border-gray-200';
                }
              };

              const getTierIconBg = (tier) => {
                switch (tier?.toLowerCase()) {
                  case 'premium':
                    return 'bg-gradient-to-r from-yellow-400 to-amber-500';
                  case 'standard':
                    return 'bg-gradient-to-r from-orange-100 to-amber-100';
                  default:
                    return 'bg-gradient-to-r from-gray-100 to-gray-200';
                }
              };

              const getTierTextColor = (tier) => {
                return tier?.toLowerCase() === 'premium' ? 'text-gray-200' : 'text-gray-600';
              };

              return (
                <div
                  key={report._id}
                  className={`${getTierCardClass(report.tier)} rounded-xl border p-6 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Report Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 ${getTierIconBg(report.tier)} rounded-lg flex items-center justify-center shadow-sm`}>
                          <FileText className={`w-5 h-5 ${report.tier?.toLowerCase() === 'premium' ? 'text-white' : 'text-orange-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold text-lg ${report.tier?.toLowerCase() === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                              {report.title || 'Untitled Report'}
                            </h3>
                            {report.tier && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.tier.toLowerCase() === 'premium'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                                : report.tier.toLowerCase() === 'standard'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-400 text-white'
                                }`}>
                                {report.tier}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${getTierTextColor(report.tier)}`}>
                            {report.documentType || 'Document Analysis'}
                          </p>
                        </div>
                      </div>

                      {report.description && (
                        <p className={`text-sm mt-2 ${getTierTextColor(report.tier)}`}>{report.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                        <div className={`flex items-center gap-2 ${getTierTextColor(report.tier)}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full flex items-center gap-2 font-medium`}>
                            {statusConfig.icon}
                            <span className="capitalize">{report.status || 'Pending'}</span>
                          </div>
                        </div>

                        {report.score && (
                          <div className={`flex items-center gap-2 ${getTierTextColor(report.tier)}`}>
                            <BarChart className="w-4 h-4" />
                            <span>Score: {report.score}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {report.status === 'completed' && (
                        <>
                          <button
                            onClick={() => {
                              // Handle view report
                              console.log('View report:', report._id);
                            }}
                            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          <button
                            onClick={() => {
                              // Handle download report
                              console.log('Download report:', report._id);
                            }}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </>
                      )}

                      {report.status === 'processing' && (
                        <button disabled className="px-4 py-2 bg-gray-50 text-gray-500 rounded-lg font-medium">
                          Processing...
                        </button>
                      )}

                      {report.status === 'failed' && (
                        <button
                          onClick={() => {
                            // Handle retry
                            console.log('Retry report:', report._id);
                          }}
                          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-colors"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Info */}
        {!loading && filteredReports.length > 0 && (
          <div className="mt-8 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredReports.length} of {reports.length} reports</span>
            <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
              Load More
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
