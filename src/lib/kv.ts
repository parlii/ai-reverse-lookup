import { createClient } from 'redis';

// Redis client with connection pooling for serverless environments
let redisClient: ReturnType<typeof createClient> | null = null;
let isConnecting = false;
let connectionPromise: Promise<ReturnType<typeof createClient> | null> | null = null;

async function getRedisClient() {
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

export interface WordHistoryItem {
  id: string;
  word: string;
  description: string;
  language: string;
  timestamp: number;
  pronunciation?: string;
  completion?: string; // Store full AI completion response
}

// Function to save word lookup to history
export async function saveToHistory(item: Omit<WordHistoryItem, 'id'>) {
  let client = null;
  try {
    client = await getRedisClient();
    if (!client) return false;
    
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const historyItem: WordHistoryItem = {
      ...item,
      id
    };
    
    // Get current history
    const history = await getHistory();
    
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
export async function getHistory(): Promise<WordHistoryItem[]> {
  try {
    const client = await getRedisClient();
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
export async function clearHistory(password: string): Promise<boolean> {
  // Simple static password protection
  if (password !== "admin123") {
    return false;
  }
  
  try {
    const client = await getRedisClient();
    if (!client) return false;
    
    await client.del('wordHistory');
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}