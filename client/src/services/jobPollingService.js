// client/src/services/jobPollingService.js
import quoteApi from './quoteApi';

class JobPollingService {
  constructor() {
    this.activePolls = new Map();
    this.pollingInterval = 2000; // 2 seconds
    this.maxPollingTime = 300000; // 5 minutes
  }

  // Start polling a job
  async startPolling(jobId, onUpdate, onComplete, onError) {
    if (this.activePolls.has(jobId)) {
      console.warn(`Already polling job ${jobId}`);
      return;
    }

    const startTime = Date.now();

    const poll = async () => {
      try {
        // Check if polling should stop
        if (Date.now() - startTime > this.maxPollingTime) {
          this.stopPolling(jobId);
          onError?.(new Error('Job processing timeout'));
          return;
        }

        const status = await quoteApi.getJobStatus(jobId);

        // Notify update
        onUpdate?.(status);

        // Check if job is complete
        if (status.status === 'completed') {
          this.stopPolling(jobId);

          // Retry fetching result a few times with small delays
          // This handles database propagation delays in production
          let result = null;
          let retries = 3;
          let delay = 1000;

          while (retries > 0) {
            try {
              result = await quoteApi.getJobResult(jobId);
              if (result) break;
            } catch (err) {
              retries--;
              if (retries === 0) throw err;
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
            }
          }

          onComplete?.(result);
          return;
        }

        // Check if job failed
        if (status.status === 'failed') {
          this.stopPolling(jobId);
          onError?.(new Error('Job processing failed'));
          return;
        }

        // Continue polling
        if (this.activePolls.has(jobId)) {
          setTimeout(poll, this.pollingInterval);
        }
      } catch (error) {
        this.stopPolling(jobId);
        onError?.(error);
      }
    };

    this.activePolls.set(jobId, poll);
    poll();
  }

  // Stop polling a job
  stopPolling(jobId) {
    this.activePolls.delete(jobId);
  }

  // Check if a job is being polled
  isPolling(jobId) {
    return this.activePolls.has(jobId);
  }

  // Get all active polls
  getActivePolls() {
    return Array.from(this.activePolls.keys());
  }

  // Stop all polling
  stopAllPolls() {
    this.activePolls.clear();
  }
}

export default new JobPollingService();