// client/src/services/profileApi.js
import api from './api';

class ProfileApi {
  // Get user profile
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data.data;
  }

  // Update profile
  async updateProfile(profileData) {
    const response = await api.put('/users/me', profileData);
    return response.data.data;
  }

  // Change password
  async changePassword(passwordData) {
    const response = await api.put('/users/me/password', passwordData);
    return response.data.data;
  }

  // Upload avatar
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }

  // Remove avatar
  async removeAvatar() {
    const response = await api.delete('/users/me/avatar');
    return response.data.data;
  }

  // Get preferences
  async getPreferences() {
    const response = await api.get('/users/me/preferences');
    return response.data.data;
  }

  // Update preferences
  async updatePreferences(preferences) {
    const response = await api.put('/users/me/preferences', preferences);
    return response.data.data;
  }

  // Get security settings
  async getSecuritySettings() {
    const response = await api.get('/users/me/security');
    return response.data.data;
  }

  // Toggle two-factor authentication
  async toggleTwoFactor(enabled) {
    const response = await api.put('/users/me/security/two-factor', { enabled });
    return response.data.data;
  }

  // Get subscription
  async getSubscription() {
    const response = await api.get('/users/me/subscription');
    return response.data.data;
  }

  // Update subscription
  async updateSubscription(plan) {
    const response = await api.put('/users/me/subscription', { plan });
    return response.data.data;
  }

  // Get user stats
  async getStats() {
    const response = await api.get('/users/me/stats');
    return response.data.data;
  }

  // Delete account
  async deleteAccount(confirmPassword) {
    const response = await api.delete('/users/me', {
      data: { confirmPassword }
    });
    return response.data.data;
  }
}

export default new ProfileApi();