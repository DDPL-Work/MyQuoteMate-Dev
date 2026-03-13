// client/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Eye as EyeIcon,
  AlertCircle,
  CheckCircle,
  Toggle,
  X,
  Save,
  Loader2,
  Key,
  Clock,
  LogOut,
  Trash2,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import profileApi from '../services/profileApi';

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    reportReady: true,
    promotionalEmails: false,
    weeklyDigest: true,
    productUpdates: true,
    securityAlerts: true
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private', // private, public, registered
    showActivityStatus: true,
    allowComments: false,
    dataCollection: true
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  // Session Management
  const [sessions, setSessions] = useState([
    {
      id: 1,
      deviceName: 'Windows Chrome',
      deviceType: 'desktop',
      lastActive: new Date(Date.now() - 3600000),
      ipAddress: '192.168.1.100',
      location: 'Sydney, NSW',
      isCurrent: true
    },
    {
      id: 2,
      deviceName: 'iPhone 14',
      deviceType: 'mobile',
      lastActive: new Date(Date.now() - 86400000),
      ipAddress: '203.0.113.42',
      location: 'Sydney, NSW',
      isCurrent: false
    },
    {
      id: 3,
      deviceName: 'iPad Pro',
      deviceType: 'tablet',
      lastActive: new Date(Date.now() - 604800000),
      ipAddress: '203.0.113.55',
      location: 'Melbourne, VIC',
      isCurrent: false
    }
  ]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // const response = await api.get('/users/me/settings');
      // setNotifications(response.data.notifications);
      // setPrivacy(response.data.privacy);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, save to API
      // await api.put('/users/me/settings', {
      //   notifications,
      //   privacy
      // });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false
      });
      setShowChangePassword(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleLogoutAllSessions = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    setShowSessionModal(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SettingToggle = ({ label, checked, onChange, description }) => (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${checked ? 'bg-orange-600' : 'bg-gray-300'
          }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Settings saved successfully</p>
                <p className="text-sm text-green-700">Your preferences have been updated</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-8">
              <nav className="space-y-1 p-4">
                {[
                  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                  { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
                  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
                  { id: 'sessions', label: 'Sessions', icon: <Smartphone className="w-4 h-4" /> }
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.label}</span>
                    {activeSection === section.id && (
                      <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                <div className="space-y-2 border-b border-gray-200 pb-6 mb-6">
                  <SettingToggle
                    label="Email Notifications"
                    checked={notifications.emailNotifications}
                    onChange={(value) => setNotifications({ ...notifications, emailNotifications: value })}
                    description="Receive notifications via email"
                  />
                </div>

                <div className="space-y-2 border-b border-gray-200 pb-6 mb-6">
                  <h3 className="font-semibold text-gray-900 px-4 py-2">Email Alerts</h3>
                  <SettingToggle
                    label="Report Ready"
                    checked={notifications.reportReady}
                    onChange={(value) => setNotifications({ ...notifications, reportReady: value })}
                    description="Get notified when your analysis reports are ready"
                  />
                  <SettingToggle
                    label="Security Alerts"
                    checked={notifications.securityAlerts}
                    onChange={(value) => setNotifications({ ...notifications, securityAlerts: value })}
                    description="Important security and account alerts"
                  />
                  <SettingToggle
                    label="Weekly Digest"
                    checked={notifications.weeklyDigest}
                    onChange={(value) => setNotifications({ ...notifications, weeklyDigest: value })}
                    description="Summary of your weekly activity"
                  />
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-gray-900 px-4 py-2">Marketing & Updates</h3>
                  <SettingToggle
                    label="Product Updates"
                    checked={notifications.productUpdates}
                    onChange={(value) => setNotifications({ ...notifications, productUpdates: value })}
                    description="New features and improvements"
                  />
                  <SettingToggle
                    label="Promotional Emails"
                    checked={notifications.promotionalEmails}
                    onChange={(value) => setNotifications({ ...notifications, promotionalEmails: value })}
                    description="Special offers and promotions"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Profile Visibility
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'private', label: 'Private', description: 'Only you can see your profile' },
                        { value: 'registered', label: 'Registered Users', description: 'Visible to registered members' },
                        { value: 'public', label: 'Public', description: 'Anyone can view your profile' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={privacy.profileVisibility === option.value}
                            onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                            className="w-4 h-4 text-orange-600"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900">{option.label}</p>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <SettingToggle
                      label="Show Activity Status"
                      checked={privacy.showActivityStatus}
                      onChange={(value) => setPrivacy({ ...privacy, showActivityStatus: value })}
                      description="Let others see when you are active"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <SettingToggle
                      label="Allow Comments"
                      checked={privacy.allowComments}
                      onChange={(value) => setPrivacy({ ...privacy, allowComments: value })}
                      description="Allow others to comment on your public reports"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <SettingToggle
                      label="Data Collection"
                      checked={privacy.dataCollection}
                      onChange={(value) => setPrivacy({ ...privacy, dataCollection: value })}
                      description="Help us improve by collecting anonymous usage data"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
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
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Change Password
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Update your password regularly to keep your account secure</p>
                      </div>
                      <button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        {showChangePassword ? 'Cancel' : 'Change'}
                      </button>
                    </div>

                    {showChangePassword && (
                      <div className="mt-6 space-y-4 pt-6 border-t border-gray-200">
                        {/* Current Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={passwordData.showCurrent ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              onClick={() => setPasswordData({ ...passwordData, showCurrent: !passwordData.showCurrent })}
                              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                              {passwordData.showCurrent ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={passwordData.showNew ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pr-10"
                              placeholder="Enter new password"
                            />
                            <button
                              onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })}
                              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                              {passwordData.showNew ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <input
                              type={passwordData.showConfirm ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pr-10"
                              placeholder="Confirm new password"
                            />
                            <button
                              onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })}
                              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                              {passwordData.showConfirm ? <EyeOff className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            onClick={() => setShowChangePassword(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          Not Enabled
                        </span>
                      </div>
                      <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        Enable
                      </button>
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4" />
                      Last Login
                    </h3>
                    <p className="text-gray-600">
                      {new Date().toLocaleDateString('en-AU', {
                        timeZone: 'Australia/Sydney',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Management */}
            {activeSection === 'sessions' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
                    <p className="text-gray-600 mt-2">Manage devices accessing your account</p>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={() => setShowSessionModal(true)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                      Sign Out All
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{session.deviceName}</p>
                              <p className="text-sm text-gray-600">
                                Last active: {formatDate(session.lastActive)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>IP: {session.ipAddress}</span>
                            <span>{session.location}</span>
                            {session.isCurrent && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                Current
                              </span>
                            )}
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <button
                            onClick={() => handleLogoutSession(session.id)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      Don't recognize a session? Sign it out and consider changing your password.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out All Sessions?</h3>
                <p className="text-gray-600 mb-6">
                  You will be signed out from all devices except this one. You'll need to sign in again on other devices.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutAllSessions}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Sign Out All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
