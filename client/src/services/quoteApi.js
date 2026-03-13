// client/src/services/quoteApi.js
import api from './api';

class QuoteApi {
  // Get all user jobs (quote analyses)
  async getUserJobs() {
    const response = await api.get('/jobs');
    return response.data.data;
  }

  // Create a new job (upload quote for analysis)
  async createJob({ email, file, tier = 'free', metadata = {}, exhaust = false }) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('email', email);
    formData.append('tier', tier);
    formData.append('exhaust', String(exhaust));
    formData.append('metadata', JSON.stringify(metadata));

    const response = await api.post('/jobs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }

  // Get a specific job
  async getJob(jobId) {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data.data;
  }

  // Get job results/analysis
  async getJobResult(jobId) {
    const response = await api.get(`/jobs/${jobId}/result`);
    return response.data.data;
  }

  // Delete a job
  async deleteJob(jobId) {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data.data;
  }

  // Download a document
  async downloadDocument(jobId, documentId) {
    const response = await api.get(`/jobs/${jobId}/documents/${documentId}/download`);
    return response.data.data;
  }

  // Get job processing status
  async getJobStatus(jobId) {
    const response = await api.get(`/jobs/${jobId}/status`);
    return response.data.data;
  }

  // Poll job status (for real-time updates)
  async pollJobStatus(jobId, interval = 2000, timeout = 120000) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getJobStatus(jobId);

          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }

          if (Date.now() - startTime > timeout) {
            reject(new Error('Job processing timeout'));
            return;
          }

          setTimeout(checkStatus, interval);
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  }

  // Get user statistics
  async getUserStats() {
    const response = await api.get('/users/me/stats');
    return response.data.data;
  }

  // Get user subscription info
  async getSubscription() {
    const response = await api.get('/users/me/subscription');
    return response.data.data;
  }

  // Submit rating for a job
  async submitRating(jobId, rating) {
    const response = await api.patch(`/jobs/${jobId}/rating`, { rating });
    return response.data;
  }

  // Upgrade Tier (Mock Payment)
  async upgradeTier(tier) {
    const response = await api.post('/payments/mock-upgrade', { tier });
    return response.data;
  }

  // Generate Professional PDF Report
  async generateReport(jobId) {
    const response = await api.get(`/jobs/${jobId}/report`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Compare multiple quotes (Premium only)
  async compareQuotes(jobIds) {
    const response = await api.post('/jobs/compare', { jobIds });
    return response.data.data;
  }

  // Generate Technical Text Report
  async generateTextReport(jobId) {
    const response = await api.get(`/jobs/${jobId}/text-report`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new QuoteApi();
