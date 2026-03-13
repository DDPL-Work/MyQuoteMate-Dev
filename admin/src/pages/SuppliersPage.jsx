import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Shield,
    AlertTriangle,
    CheckCircle,
    Phone,
    Mail,
    MapPin,
    TrendingDown,
    TrendingUp,
    BarChart3,
    X,
    Clock,
    DollarSign,
    Info
} from 'lucide-react';
import api from '../services/api';

const SupplierDetailsModal = ({ supplierId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/admin/suppliers/${supplierId}`);
                setData(response.data.data);
            } catch (err) {
                console.error('Failed to fetch supplier details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [supplierId]);

    if (loading) return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600">Loading Scoreboard Intelligence...</p>
            </div>
        </div>
    );

    if (!data) return null;

    const { supplier, stats, history } = data;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{supplier.supplierName}</h2>
                        <p className="text-gray-500">ABN: {supplier.abn || 'N/A'} • {supplier.tradingName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <p className="text-sm text-orange-600 font-medium">Confidence Rating</p>
                            <p className="text-3xl font-bold text-orange-700">{supplier.confidence}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 font-medium">Median Quote</p>
                            <p className="text-3xl font-bold text-blue-700">
                                ${stats?.medianTotalAmount?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-sm text-purple-600 font-medium">Price Drift</p>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-purple-700">
                                    {stats?.priceChangePctVsLast > 0 ? '+' : ''}{stats?.priceChangePctVsLast?.toFixed(1)}%
                                </p>
                                {stats?.priceChangePctVsLast > 0 ? <TrendingUp className="text-red-500" /> : <TrendingDown className="text-green-500" />}
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown (Simulation of 0-1000) */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-orange-500" />
                            Scoring Intelligence (0-1000)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">Aggregate Score</span>
                                    <span className="text-sm font-bold">{supplier.score}/1000</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div
                                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${(supplier.score / 1000) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historical Quotes */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Quote History (Last 10)
                        </h3>
                        <div className="border border-gray-100 rounded-xl overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Score</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map((q) => (
                                        <tr key={q._id}>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(q.createdAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">
                                                ${q.totalAmount?.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${q.scores?.total > 700 ? 'bg-green-100 text-green-700' :
                                                    q.scores?.total > 400 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {q.scores?.total}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {q.tradeCategory || 'General'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800"
                    >
                        Close Intelligence Report
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSuppliers, setTotalSuppliers] = useState(0);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/admin/suppliers', {
                params: { search: searchTerm, page, limit: 10 }
            });
            setSuppliers(response.data.data);
            setCurrentPage(response.data.pagination.page);
            setTotalPages(response.data.pagination.pages);
            setTotalSuppliers(response.data.pagination.total);
        } catch (err) {
            console.error('Failed to fetch suppliers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSuppliers(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchSuppliers(page);
    };

    const getScoreColor = (score) => {
        if (score >= 700) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 400) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const getConfidenceBadge = (confidence) => {
        switch (confidence) {
            case 'HIGH': return 'bg-green-100 text-green-700';
            case 'MED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-orange-500" />
                        Supplier Scoreboard
                    </h1>
                    <p className="text-gray-600 mt-2">Internal intelligence ranking contractors based on quote transparency and risk.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Total Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalSuppliers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Avg Score</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                        {suppliers.length > 0
                            ? Math.round(suppliers.reduce((acc, s) => acc + s.score, 0) / suppliers.length)
                            : 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Quotes Tracked</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {suppliers.reduce((acc, s) => acc + s.quoteCount, 0)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">High Confidence</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {suppliers.filter(s => s.confidence === 'HIGH').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by supplier name or ABN..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600">
                    Search
                </button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Supplier / ABN</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Score (0-1000)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Volume</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Confidence</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900">Last Seen</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading Scoreboard...</td>
                            </tr>
                        ) : suppliers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No supplier data found.</td>
                            </tr>
                        ) : (
                            suppliers.map((supplier) => (
                                <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{supplier.supplierName}</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-tighter">
                                                ABN: {supplier.abn || 'NOT EXTRACTED'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getScoreColor(supplier.score)}`}>
                                            {supplier.score >= 700 ? <CheckCircle className="w-3 h-3" /> :
                                                supplier.score >= 400 ? <Shield className="w-3 h-3" /> :
                                                    <AlertTriangle className="w-3 h-3" />}
                                            {supplier.score}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                            <BarChart3 className="w-4 h-4 text-blue-400" />
                                            {supplier.quoteCount} Quotes
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-widest ${getConfidenceBadge(supplier.confidence)}`}>
                                            {supplier.confidence}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Mail className="w-3 h-3" />
                                            {new Date(supplier.lastSeenAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedSupplierId(supplier._id)}
                                            className="px-3 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-bold text-sm transition-colors border border-orange-100"
                                        >
                                            Intelligence
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${currentPage === pageNum
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Details Modal */}
            {selectedSupplierId && (
                <SupplierDetailsModal
                    supplierId={selectedSupplierId}
                    onClose={() => setSelectedSupplierId(null)}
                />
            )}
        </div>
    );
};

export default SuppliersPage;
