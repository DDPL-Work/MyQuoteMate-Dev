// admin/src/components/PaymentsTable.jsx
import React, { useState } from 'react';
import { CreditCard, ChevronRight, Loader2, DollarSign, Calendar, MoreVertical, User, X } from 'lucide-react';
import api from '../services/api';
import ReceiptModal from './ReceiptModal';

const PaymentsTable = ({ payments, loading, pagination, onPageChange }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [allPayments, setAllPayments] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // Receipt Modal State
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleViewReceipt = (payment) => {
    setReceiptPayment(payment);
    setShowReceiptModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewAll = async () => {
    setViewAllOpen(true);
    setLoadingAll(true);
    try {
      const response = await api.get('/admin/payments', { params: { limit: 100 } });
      setAllPayments(response.data.data);
    } catch (err) {
      console.error('Failed to fetch all payments:', err);
    } finally {
      setLoadingAll(false);
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.total <= pagination.limit) return null;
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-2 mt-4">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${p === pagination.page
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {p}
          </button>
        ))}
        {totalPages > 5 && <span className="text-gray-400">...</span>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-orange-600" />
          Recent Payments
        </h2>
        <button
          onClick={handleViewAll}
          className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
        >
          View All
        </button>
      </div>

      {loading && payments.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No payments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Transaction ID</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Tier</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <React.Fragment key={payment._id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-mono text-xs text-gray-500">{payment.stripePaymentId || payment._id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {payment.userId?.avatarUrl ? (
                          <img
                            src={payment.userId.avatarUrl}
                            alt={payment.userId.firstName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {payment.userId?.firstName
                              ? `${payment.userId.firstName} ${payment.userId.lastName || ''}`
                              : 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">{payment.userId?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-gray-900">{payment.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTierColor(payment.tier)}`}>
                        {payment.tier || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(payment.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === payment._id ? null : payment._id)}
                        className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                  {expandedId === payment._id && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan="7" className="py-4 px-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-semibold">User Details</p>
                              <p className="text-gray-900 mt-1 font-medium">
                                {payment.userId?.firstName
                                  ? `${payment.userId.firstName} ${payment.userId.lastName || ''}`
                                  : 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">{payment.userId?.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-semibold">Currency</p>
                              <p className="text-gray-900 mt-1 uppercase">{payment.currency || 'usd'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-semibold">Payment Method</p>
                              <p className="text-gray-900 mt-1 capitalize">{payment.paymentMethod || 'stripe'}</p>
                            </div>
                          </div>
                          {payment.refundAmount && (
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-semibold">Refund Amount</p>
                              <p className="text-gray-900 mt-1">${payment.refundAmount?.toFixed(2)}</p>
                            </div>
                          )}
                          <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleViewReceipt(payment)}
                              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              View Receipt
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}

      {/* View All Modal */}
      {viewAllOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
                All Payments ({pagination?.total || 0})
              </h3>
              <button
                onClick={() => setViewAllOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
              {loadingAll ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                  <p className="text-gray-500">Retrieving full transaction database...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Transaction ID</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">User</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allPayments.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50 text-sm">
                        <td className="py-4 px-4 font-mono text-xs text-gray-500">{p.stripePaymentId || p._id}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {p.userId?.avatarUrl ? (
                              <img
                                src={p.userId.avatarUrl}
                                alt={p.userId.firstName}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                                {(p.userId?.firstName?.[0] || 'U').toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{p.userId?.firstName || 'User'} {p.userId?.lastName || ''}</p>
                              <p className="text-xs text-gray-400">{p.userId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">${p.amount?.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusColor(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500">{formatDate(p.createdAt)}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleViewReceipt(p)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2 py-1 rounded-md hover:bg-orange-50 transition-colors"
                          >
                            RECEIPT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setViewAllOpen(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={receiptPayment}
      />
    </div>
  );
};

export default PaymentsTable;
