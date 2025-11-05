import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure your API base URL here
// For development: use your computer's IP address (not localhost)
// Example: http://192.168.1.100:5000/api
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Pumping endpoints
  async getPumpingSessions(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await this.client.get('/pumping', { params });
    return response.data;
  }

  async addPumpingSession(data) {
    const response = await this.client.post('/pumping', data);
    return response.data;
  }

  async updatePumpingSession(id, data) {
    const response = await this.client.put(`/pumping/${id}`, data);
    return response.data;
  }

  async deletePumpingSession(id) {
    const response = await this.client.delete(`/pumping/${id}`);
    return response.data;
  }

  // Feeding endpoints
  async getFeedings(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await this.client.get('/feeding', { params });
    return response.data;
  }

  async addFeeding(data) {
    const response = await this.client.post('/feeding', data);
    return response.data;
  }

  async updateFeeding(id, data) {
    const response = await this.client.put(`/feeding/${id}`, data);
    return response.data;
  }

  async deleteFeeding(id) {
    const response = await this.client.delete(`/feeding/${id}`);
    return response.data;
  }

  // Statistics endpoints
  async getDailyStats(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await this.client.get('/stats/daily', { params });
    return response.data;
  }

  async getSummaryStats(days = 30) {
    const response = await this.client.get('/stats/summary', { params: { days } });
    return response.data;
  }

  async getTodayStats() {
    const response = await this.client.get('/stats/today');
    return response.data;
  }

  // Export data
  async exportData() {
    const response = await this.client.get('/export');
    return response.data;
  }

  // Offline storage helpers
  async saveToCache(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  async getFromCache(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Update API base URL (for settings)
  setBaseUrl(url) {
    this.client.defaults.baseURL = url;
    AsyncStorage.setItem('api_base_url', url);
  }

  async loadSavedBaseUrl() {
    const savedUrl = await AsyncStorage.getItem('api_base_url');
    if (savedUrl) {
      this.client.defaults.baseURL = savedUrl;
    }
  }
}

export default new ApiService();
