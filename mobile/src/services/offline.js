import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineService {
  constructor() {
    this.pendingQueue = [];
    this.isOnline = true;

    // Monitor network status
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.processPendingQueue();
      }
    });
  }

  async checkConnection() {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected;
    return this.isOnline;
  }

  // Cache data locally
  async cacheData(key, data) {
    try {
      const cacheKey = `cached_${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      console.error('Cache error:', error);
      return false;
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const cacheKey = `cached_${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);

        // Check if cache is still valid (24 hours)
        const cacheAge = new Date() - new Date(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (cacheAge < maxAge) {
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Get cache error:', error);
      return null;
    }
  }

  // Clear all cache
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cached_'));
      await AsyncStorage.multiRemove(cacheKeys);
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  }

  // Queue operation for later (offline mode)
  async queueOperation(operation) {
    try {
      const queue = await this.getPendingQueue();
      queue.push({
        ...operation,
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem('pending_operations', JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Queue error:', error);
      return false;
    }
  }

  // Get pending operations
  async getPendingQueue() {
    try {
      const queue = await AsyncStorage.getItem('pending_operations');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Get queue error:', error);
      return [];
    }
  }

  // Process pending operations when back online
  async processPendingQueue() {
    try {
      const queue = await this.getPendingQueue();

      if (queue.length === 0) return;

      console.log(`Processing ${queue.length} pending operations...`);

      for (const operation of queue) {
        try {
          // Process the operation (call the API)
          await this.executeOperation(operation);

          // Remove from queue
          await this.removeFromQueue(operation);
        } catch (error) {
          console.error('Failed to process operation:', error);
          // Keep in queue for retry
        }
      }
    } catch (error) {
      console.error('Process queue error:', error);
    }
  }

  async executeOperation(operation) {
    // This would call your API service with the operation details
    // Implement based on your API service structure
    console.log('Executing operation:', operation);
  }

  async removeFromQueue(operation) {
    try {
      const queue = await this.getPendingQueue();
      const filtered = queue.filter(op => op.timestamp !== operation.timestamp);
      await AsyncStorage.setItem('pending_operations', JSON.stringify(filtered));
    } catch (error) {
      console.error('Remove from queue error:', error);
    }
  }

  // Get offline status
  getOfflineStatus() {
    return !this.isOnline;
  }
}

export default new OfflineService();
