// client/src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  FileText,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  CheckCircle,
  Edit2,
  Camera,
  ChevronRight,
  Star,
  Download,
  Calendar,
  Eye,
  EyeOff,
  X,
  Save,
  Upload,
  Key,
  Mail,
  Phone,
  MapPin,
  Award,
  BarChart,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Crown,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // or use your AuthContext
import api from '../services/api';
import profileApi from '../services/profileApi';

const Profile = () => {
  const { user, logout, updateUser } = useAuth(); // Assuming your auth hook provides these
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const fileInputRef = useRef(null);

  // Dynamic user data - initially populated from auth context
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
    subscription: {
      plan: 'Free',
      status: 'active',
      expiresAt: null,
      reportsUsed: 0,
      reportsTotal: 1 // Default for free plan (1 per month)
    },
    notifications: {
      email: true,
      reportReady: true,
      promotional: false,
      reminders: true
    },
    security: {
      twoFactor: false,
      lastLogin: new Date().toLocaleString(),
      devices: []
    }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize with user data from auth context
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl || '',
        subscription: user.subscription || prev.subscription,
        notifications: user.notifications || prev.notifications // Load notifications
      }));
    }
  }, [user]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'reports', label: 'My Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> }
  ];

  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);

  // ... (payments state handling continues below)

  const handleNotificationToggle = async (key) => {
    // Optimistic UI update
    const newSettings = {
      ...userData.notifications,
      [key]: !userData.notifications[key]
    };

    setUserData(prev => ({
      ...prev,
      notifications: newSettings
    }));

    // Debounced API call or direct call
    try {
      // Assuming endpoint supports partial updates or full profile update including notifications
      // If backend expects /users/me with notifications object:
      await api.put('/users/me', { notifications: newSettings });

      if (updateUser) {
        // Update context
        // We preserve other user fields by spreading (handled by context usually) or just passing what changed
        updateUser({ notifications: newSettings });
      }
    } catch (err) {
      console.error('Failed to update notifications:', err);
      // Revert on failure
      setUserData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: !newSettings[key]
        }
      }));
      // Assuming 'toast' is defined elsewhere or needs to be imported
      // toast.error('Failed to update settings');
    }
  };
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

  // Fetch user reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/jobs');
        const sortedReports = (response.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReports(sortedReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  // Fetch user payments
  useEffect(() => {
    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const response = await api.get('/payments');
        setPayments(response.data.data.payments || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoadingPayments(false);
      }
    };

    if (activeTab === 'subscription') {
      fetchPayments();
    }
  }, [activeTab]);

  // Handle profile picture upload
  const handleImageUpload = async (event) => {
    // ... existing upload logic ...
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          avatarUrl: response.data.avatarUrl
        }));

        // Update auth context if available
        if (updateUser) {
          updateUser({ avatarUrl: response.data.avatarUrl });
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // ... (keeping other handlers same) ...


  // Remove profile picture
  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      setUploadingImage(true);
      setError(null);
      const response = await api.delete('/users/me/avatar');

      if (response.data?.success) {
        setUserData(prev => ({
          ...prev,
          avatarUrl: ''
        }));

        if (updateUser) {
          updateUser({ avatarUrl: '' });
        }

        setImagePreview(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove image');
      console.error('Remove avatar error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    // This function is used for personal info and now for notifications.
    // It should ideally send all updatable fields.
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        notifications: userData.notifications // Include notifications in the save
      };

      const response = await api.put('/users/me', updateData);

      if (response.data.success) {
        // Update auth context
        if (updateUser) {
          updateUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: userData.address,
            notifications: userData.notifications
          });
        }

        setIsEditing(false); // Only set false if saving personal info
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (data) {
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.delete('/users/me', {
        data: { confirmPassword: deletePassword }
      });

      if (response.data.success) {
        // Clear local storage and state immediately
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');

        // Finalize logout (clears state) and redirect
        logout();
        navigate('/', { replace: true });

        // Use window.location as backup for full cleanup if needed, 
        // but navigate + logout should be enough
      }
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const total = userData.subscription?.reportsTotal || 1;
    const credits = userData.subscription?.credits || 0;
    const used = Math.max(0, total - credits);
    return (used / total) * 100;
  };

  const getAvatarInitials = () => {
    if (userData.firstName && userData.lastName) {
      return (userData.firstName.charAt(0) + userData.lastName.charAt(0)).toUpperCase();
    }
    if (userData.firstName) return userData.firstName.charAt(0).toUpperCase();
    if (userData.name) return userData.name.charAt(0).toUpperCase();
    return 'U';
  };

  const getSubscriptionData = () => {
    const plan = userData.subscription?.plan || 'Free';
    const plans = {
      'Free': { price: '0', reportsTotal: 1, label: 'Free', color: 'from-gray-500 to-gray-600' },
      'Standard': { price: '7.99', reportsTotal: 1, label: 'per report', color: 'from-orange-500 to-amber-600' },
      'Premium': { price: '9.99', reportsTotal: 3, label: 'for 3 reports', color: 'from-gray-800 to-gray-900' }
    };

    return plans[plan] || plans['Free'];
  };

  // Render functions for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Profile updated successfully!</p>
                    <p className="text-sm text-green-700">Your changes have been saved.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {userData.avatarUrl || imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || userData.avatarUrl}
                        alt={userData.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl relative group">
                      {getAvatarInitials()}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Change photo"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-gray-600" />
                      )}
                    </button>

                    {(userData.avatarUrl || imagePreview) && (
                      <button
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                        className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{userData.name || 'User'}</h2>
                  <p className="text-gray-600">{userData.email || 'No email provided'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>

            {/* Upload Progress */}
            {uploadingImage && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">Uploading image...</p>
                    <p className="text-sm text-blue-700">Please wait while we upload your profile picture</p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.firstName || ''}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="John"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userData.firstName || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.lastName || ''}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Doe"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userData.lastName || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Field (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{userData.email || 'No email'}</span>
                    <span className="ml-auto px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      Cannot change
                    </span>
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (AU)
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => {
                        // Allow formatting like +61 4... or 04...
                        const val = e.target.value.replace(/[^\d+\s\-]/g, '');
                        setUserData({ ...userData, phone: val });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="+61 412 345 678"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{userData.phone || 'Not set'}</span>
                      {user?.phoneVerified && (
                        <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.address}
                      onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="123 Main Street, Sydney NSW 2000"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{userData.address || 'Not set'}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Password & Security</h3>
                <p className="text-gray-600 mb-6">Update your password and manage security settings</p>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h3>
                <p className="text-gray-600 mb-6">Permanently delete your account and all data</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <X className="w-4 h-4" />
                    <span>Delete Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-8">
            {/* Reports Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-medium">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{reports.length}</p>
                <p className="text-xs text-gray-500 mt-2">Generated analysis reports</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500 mt-2">Ready to download</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-medium">Processing</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {reports.filter(r => r.status === 'processing').length}
                </p>
                <p className="text-xs text-gray-500 mt-2">Being analyzed</p>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showAllReports ? 'All Reports' : 'Recent Reports'}
                </h3>
                {reports.length > 5 && (
                  <button
                    onClick={() => setShowAllReports(!showAllReports)}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    {showAllReports ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No reports yet. Start by uploading a document.</p>
                  <Link to="/check-quote" className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Analyze a Quote
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(showAllReports ? reports : reports.slice(0, 5)).map(report => (
                    <Link
                      to={`/analysis/${report.jobId}`}
                      key={report._id}
                      className={`group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl transition-all duration-300 hover:shadow-sm ${report.tier?.toLowerCase() === 'premium'
                        ? 'hover:bg-slate-50 hover:border-slate-300'
                        : report.tier?.toLowerCase() === 'standard'
                          ? 'hover:bg-orange-50/50 hover:border-orange-200'
                          : 'hover:border-gray-200' // Free tier: Keep bg as is
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${report.status === 'completed' ? 'bg-green-50 text-green-600' :
                        report.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`font-bold text-sm transition-colors truncate ${report.tier?.toLowerCase() === 'premium' ? 'text-gray-900 group-hover:text-black' :
                            report.tier?.toLowerCase() === 'standard' ? 'text-gray-900 group-hover:text-orange-600' :
                              'text-gray-900'
                            }`}>
                            {report.title || 'Quote Analysis'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-gray-400 font-medium">{new Date(report.createdAt).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm border ${report.tier?.toLowerCase() === 'premium'
                            ? 'bg-gradient-to-r from-gray-900 to-black text-amber-400 border-amber-500/30'
                            : report.tier?.toLowerCase() === 'standard'
                              ? 'bg-orange-500 text-white border-orange-600/20'
                              : 'bg-white text-gray-400 border-gray-100'
                            }`}>
                            {report.tier?.toLowerCase() === 'premium' && <Crown className="w-2.5 h-2.5" />}
                            {report.tier?.toLowerCase() === 'standard' && <Zap className="w-2.5 h-2.5" />}
                            {report.tier || 'Free'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-colors ${report.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                          report.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                          {report.status?.toUpperCase() || 'PENDING'}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-all transform group-hover:translate-x-1 ${report.tier?.toLowerCase() === 'premium' ? 'text-gray-500 group-hover:text-black' :
                          report.tier?.toLowerCase() === 'standard' ? 'text-gray-300 group-hover:text-orange-500' :
                            'text-gray-400'
                          }`} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {reports.length > 5 && !showAllReports && (
                <button
                  onClick={() => setShowAllReports(true)}
                  className="w-full mt-6 py-3 text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors border border-dashed border-orange-200"
                >
                  View All {reports.length} Reports
                </button>
              )}
            </div>
          </div>
        );

      case 'notifications':
        const notificationItems = [
          { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
          { key: 'reportReady', label: 'Report Ready', description: 'Get notified when your analysis reports are ready' },
          { key: 'security', label: 'Security Alerts', description: 'Important security and account alerts' },
          { key: 'promotional', label: 'Product Updates', description: 'New features and improvements' }
        ];

        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Notification Preferences</h3>

              <div className="space-y-4">
                {notificationItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-200 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userData.notifications[item.key] ? 'bg-orange-600' : 'bg-gray-300'
                        }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userData.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setUserData(prev => ({ ...prev, notifications: { email: true, reportReady: true, security: true, promotional: false } }))}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => handleSaveProfile()} // Using generic save for now as it updates whole user usually
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Updated modals for password change and delete account
  const renderModals = () => (
    <>
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
              </p>
              <p className="text-sm text-red-600 mb-6 font-medium">
                Warning: This will delete all your reports and data permanently!
              </p>

              <div className="text-left mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password to Delete
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already Premium Modal */}
      {showPremiumPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl animate-scale-up border-[3px] border-amber-400/30 ring-4 ring-amber-100/50">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 drop-shadow-sm"><path d="m2 4 3 12h14l3-12-6 7-4-3-4 3-6-7z" /><circle cx="12" cy="19" r="2" /></svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">You're All Set!</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You have already upgraded to the <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Premium Version</span>. Enjoy your exclusive features!
            </p>

            <button
              onClick={() => setShowPremiumPopup(false)}
              className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.98] transition-all duration-200"
            >
              Start Using Premium
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* User Summary */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={userData.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getAvatarInitials()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{userData.name || 'User'}</div>
                  <div className="text-sm text-gray-500">{userData.email || 'No email'}</div>
                </div>
              </div>

              {/* Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      } disabled:opacity-50`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full mt-8 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>

            {/* Quick Stats Removed */}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {renderModals()}
    </div>
  );
};

export default Profile;