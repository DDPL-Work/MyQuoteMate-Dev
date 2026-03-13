import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Shield, CreditCard, Clock, MapPin, Activity } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !user) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'activity', label: 'Activity', icon: Activity },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-AU', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-4">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.firstName}
                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
                                {(user.firstName?.[0] || 'U').toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 text-orange-500" /> Personal Info
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Full Name</span>
                                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Email</span>
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Phone</span>
                                        <span className="font-medium">{user.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Location</span>
                                        <span className="font-medium">{user.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" /> Account Status
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Status</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${user.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.accountStatus}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Phone Verified</span>
                                        <span className={user.phoneVerified ? 'text-green-600 font-medium' : 'text-red-500'}>
                                            {user.phoneVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Joined Date</span>
                                        <span className="font-medium">{formatDate(user.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Last Updated</span>
                                        <span className="font-medium">{formatDate(user.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-900 text-lg">Current Plan</h4>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider ${user.subscription?.plan === 'Premium' ? 'bg-purple-100 text-purple-700' :
                                    user.subscription?.plan === 'Standard' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                    {user.subscription?.plan || 'Free'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <p className="text-sm text-gray-500 mb-1">Reports Used</p>
                                    <p className="text-2xl font-bold text-gray-900">{user.subscription?.reportsUsed || 0}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <p className="text-sm text-gray-500 mb-1">Total Reports</p>
                                    <p className="text-2xl font-bold text-gray-900">{user.subscription?.reportsTotal || 0}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <p className="text-sm text-gray-500 mb-1">Active Credits</p>
                                    <p className="text-2xl font-bold text-gray-900">{user.subscription?.credits || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4">Recent Jobs</h4>
                            <p className="text-gray-500 text-sm mb-4">Total Jobs Created: <span className="font-bold text-gray-900">{user.jobCount || user.jobStats?.count || 0}</span></p>

                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No recent activity logs available.</p>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-orange-500" /> Security Info
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Login Provider</span>
                                        <span className="font-medium capitalize">{user.authProvider || 'Email'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Last Login</span>
                                        <span className="font-medium">{formatDate(user.security?.lastLoginAt)}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                        <span className="text-gray-500 text-sm">Registration IP</span>
                                        <span className="font-medium font-mono text-xs">{user.metadata?.ipAddress || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
