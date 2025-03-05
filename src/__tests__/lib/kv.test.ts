// Import the functions
import { KVOperations, WordHistoryItem, RedisClient } from '../../lib/kv';

describe('KV Library', () => {
  // Create a mock Redis client
  const mockRedisClient: jest.Mocked<RedisClient> = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    isOpen: true
  };

  // Create a mock client provider that returns our mock client
  const mockClientProvider = jest.fn().mockResolvedValue(mockRedisClient);

  // Create an instance of KVOperations with our mock provider
  const kvOperations = new KVOperations(mockClientProvider);

  // Store original console.error
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    // Save original console.error
    originalConsoleError = console.error;
    // Replace with silent version for tests
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('returns an empty array when no history exists', async () => {
      // Setup mock to return null (no history)
      mockRedisClient.get.mockResolvedValueOnce(null);

      const result = await kvOperations.getHistory();

      expect(result).toEqual([]);
      expect(mockRedisClient.get).toHaveBeenCalledWith('wordHistory');
    });

    it('returns parsed history when it exists', async () => {
      const mockHistory: WordHistoryItem[] = [{
        id: '123456789-abc123',
        word: 'test',
        description: 'a test',
        language: 'English',
        timestamp: 123456789
      }];

      // Setup mock to return JSON string
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockHistory));

      const result = await kvOperations.getHistory();

      expect(result).toEqual(mockHistory);
      expect(mockRedisClient.get).toHaveBeenCalledWith('wordHistory');
    });

    it('returns an empty array when there is an error', async () => {
      // Setup mock to throw an error
      mockRedisClient.get.mockRejectedValueOnce(new Error('Test error'));

      const result = await kvOperations.getHistory();

      expect(result).toEqual([]);
      expect(mockRedisClient.get).toHaveBeenCalledWith('wordHistory');
    });
  });

  describe('saveToHistory', () => {
    it('saves a new history item', async () => {
      // Setup mock to return empty array (no existing history)
      mockRedisClient.get.mockResolvedValueOnce(null);

      const newItem = {
        word: 'test',
        description: 'a test',
        language: 'English',
        timestamp: 123456789
      };

      const result = await kvOperations.saveToHistory(newItem);

      expect(result).toBe(true);
      expect(mockRedisClient.get).toHaveBeenCalledWith('wordHistory');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'wordHistory',
        expect.any(String)
      );

      // Verify the saved data structure
      const savedJson = JSON.parse(mockRedisClient.set.mock.calls[0][1]);
      expect(savedJson).toHaveLength(1);
      expect(savedJson[0]).toMatchObject({
        ...newItem,
        id: expect.any(String)
      });
    });

    it('adds new item to the beginning of existing history', async () => {
      const existingHistory: WordHistoryItem[] = [{
        id: 'existing-id',
        word: 'existing',
        description: 'existing test',
        language: 'English',
        timestamp: 100000
      }];

      // Setup mock to return existing history
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(existingHistory));

      const newItem = {
        word: 'test',
        description: 'a test',
        language: 'English',
        timestamp: 123456789
      };

      const result = await kvOperations.saveToHistory(newItem);

      expect(result).toBe(true);
      expect(mockRedisClient.get).toHaveBeenCalledWith('wordHistory');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'wordHistory',
        expect.any(String)
      );

      // Parse the saved JSON to check the structure
      const savedJson = JSON.parse(mockRedisClient.set.mock.calls[0][1]);
      expect(savedJson).toHaveLength(2);
      expect(savedJson[0]).toMatchObject({
        ...newItem,
        id: expect.any(String)
      });
      expect(savedJson[1]).toEqual(existingHistory[0]);
    });

    it('returns false when there is an error', async () => {
      // Mock the client provider to return null for this test
      mockClientProvider.mockResolvedValueOnce(null);

      const newItem = {
        word: 'test',
        description: 'a test',
        language: 'English',
        timestamp: 123456789
      };

      const result = await kvOperations.saveToHistory(newItem);
      expect(result).toBe(false);
    });
  });

  describe('clearHistory', () => {
    it('clears history with correct password', async () => {
      const result = await kvOperations.clearHistory('admin123');

      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('wordHistory');
    });

    it('returns false with incorrect password', async () => {
      const result = await kvOperations.clearHistory('wrong-password');

      expect(result).toBe(false);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('returns false when there is an error', async () => {
      // Setup mock to throw an error
      mockRedisClient.del.mockRejectedValueOnce(new Error('Test error'));

      const result = await kvOperations.clearHistory('admin123');

      expect(result).toBe(false);
      expect(mockRedisClient.del).toHaveBeenCalledWith('wordHistory');
    });
  });
}); 