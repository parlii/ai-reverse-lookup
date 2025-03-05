import { createClient } from 'redis';

// Define interfaces for better testability
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string | null>;
  del(key: string): Promise<number>;
  isOpen: boolean;
}

export interface WordHistoryItem {
  id: string;
  word: string;
  description: string;
  language: string;
  timestamp: number;
  pronunciation?: string;
  completion?: string; // Store full AI completion response
}

// Redis client with connection pooling for serverless environments
let redisClient: ReturnType<typeof createClient> | null = null;
let isConnecting = false;
let connectionPromise: Promise<ReturnType<typeof createClient> | null> | null = null;

// Exported for testing purposes
export async function getRedisClient(): Promise<RedisClient | null> {
  // If we already have a connected client, return it
  if (redisClient?.isOpen) {
    return redisClient;
  }

  // If we're already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Start a new connection
  isConnecting = true;
  connectionPromise = (async () => {
    try {
      const url = process.env.REDIS_URL;
      if (!url) {
        throw new Error('REDIS_URL is not defined');
      }

      // Close any existing client that might be in a bad state
      if (redisClient) {
        try {
          await redisClient.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
      }

      // Create a new client
      redisClient = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            // Exponential backoff with max delay of 5 seconds
            return Math.min(retries * 100, 5000);
          }
        }
      });

      // Set up error handler
      redisClient.on('error', (err) => {
        console.error('Redis error:', err);
        // Don't set to null here, let reconnection strategy work
      });

      // Connect to Redis
      await redisClient.connect();
      return redisClient;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      redisClient = null;
      return null;
    } finally {
      isConnecting = false;
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

// Core data operations that can be tested independently
export class KVOperations {
  constructor(private clientProvider: () => Promise<RedisClient | null>) { }

  // Function to save word lookup to history
  async saveToHistory(item: Omit<WordHistoryItem, 'id'>): Promise<boolean> {
    try {
      const client = await this.clientProvider();
      if (!client) return false;

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const historyItem: WordHistoryItem = {
        ...item,
        id
      };

      // Get current history
      const history = await this.getHistory();

      // Always add new history item to ensure the completion is saved
      // Add new item at the beginning (most recent first)
      const updatedHistory = [historyItem, ...history]
        // Remove duplicates (same word and language)
        .filter((item, index, self) => {
          const firstIndex = self.findIndex(i =>
            i.word.toLowerCase() === item.word.toLowerCase() &&
            i.language === item.language
          );
          return firstIndex === index; // Keep only the first occurrence
        })
        .slice(0, 20); // Keep only 20 most recent items

      await client.set('wordHistory', JSON.stringify(updatedHistory));

      return true;
    } catch (error) {
      console.error('Error saving to history:', error);
      return false;
    }
  }

  // Function to get word history
  async getHistory(): Promise<WordHistoryItem[]> {
    try {
      const client = await this.clientProvider();
      if (!client) return [];

      const history = await client.get('wordHistory');
      if (!history) return [];

      return JSON.parse(history);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  // Function to clear all history - protected with password
  async clearHistory(password: string): Promise<boolean> {
    // Use the same password as in the API route
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    if (password !== adminPassword) {
      return false;
    }

    try {
      const client = await this.clientProvider();
      if (!client) return false;

      await client.del('wordHistory');
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  }
}

// Create a singleton instance with the default Redis client provider
const kvOperations = new KVOperations(getRedisClient);

// Export the functions with the same interface as before for backward compatibility
export const saveToHistory = (item: Omit<WordHistoryItem, 'id'>): Promise<boolean> =>
  kvOperations.saveToHistory(item);

export const getHistory = (): Promise<WordHistoryItem[]> =>
  kvOperations.getHistory();

export const clearHistory = (password: string): Promise<boolean> =>
  kvOperations.clearHistory(password);