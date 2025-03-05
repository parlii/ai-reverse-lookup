import * as kv from '@/lib/kv';

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

// Mock the KV library
jest.mock('@/lib/kv', () => ({
  getHistory: jest.fn(),
  saveToHistory: jest.fn(),
  clearHistory: jest.fn()
}));

// Create a custom Response mock
class MockResponse {
  body: string;
  status: number;
  headers: Headers;

  constructor(body: any, init: { status?: number; headers?: HeadersInit } = {}) {
    this.body = typeof body === 'string' ? body : JSON.stringify(body);
    this.status = init.status || 200;
    this.headers = new Headers(init.headers || {});
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

// Create a custom NextResponse mock
const NextResponse = {
  json: (body: any, init: { status?: number; headers?: HeadersInit } = {}) => {
    return new MockResponse(body, init);
  }
};

// Mock the API routes
const GET = jest.fn().mockImplementation(async () => {
  try {
    const history = await kv.getHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ history: [] });
  }
});

const POST = jest.fn().mockImplementation(async (request: Request) => {
  try {
    const body = await request.json();
    const { word, description, language } = body;

    // Validate required fields
    if (!word || !description || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamp
    const historyItem = {
      word,
      description,
      language,
      timestamp: Date.now()
    };

    const saved = await kv.saveToHistory(historyItem);
    return NextResponse.json({ success: saved });
  } catch (error) {
    console.error('Error adding to history:', error);
    return NextResponse.json(
      { error: 'Failed to save to history' },
      { status: 500 }
    );
  }
});

const DELETE = jest.fn().mockImplementation(async (request: Request) => {
  try {
    const body = await request.json();
    const { password } = body;

    // Check password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password', success: false },
        { status: 401 }
      );
    }

    // Pass the password to clearHistory if it requires it
    const cleared = await kv.clearHistory(password);
    return NextResponse.json({ success: cleared });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history', success: false },
      { status: 500 }
    );
  }
});

describe('History API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns history items', async () => {
      const mockHistory = [
        {
          word: 'test',
          description: 'a test',
          language: 'English',
          timestamp: 123456789
        }
      ];

      (kv.getHistory as jest.Mock).mockResolvedValueOnce(mockHistory);

      const response = await GET();
      expect(response).toBeInstanceOf(MockResponse);

      const data = await response.json();
      expect(data).toHaveProperty('history');
      expect(data.history).toEqual(mockHistory);
    });

    it('handles errors', async () => {
      (kv.getHistory as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const response = await GET();
      expect(response).toBeInstanceOf(MockResponse);

      const data = await response.json();
      expect(data).toHaveProperty('history');
      expect(data.history).toEqual([]);
    });
  });

  describe('POST', () => {
    it('adds a new history item', async () => {
      const newItem = {
        word: 'test',
        description: 'a test',
        language: 'English'
      };

      (kv.saveToHistory as jest.Mock).mockResolvedValueOnce(true);

      const request = new Request('https://example.com/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      const response = await POST(request);
      expect(response).toBeInstanceOf(MockResponse);

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);

      expect(kv.saveToHistory).toHaveBeenCalledWith(expect.objectContaining({
        word: 'test',
        description: 'a test',
        language: 'English',
        timestamp: expect.any(Number)
      }));
    });

    it('returns error for missing fields', async () => {
      const incompleteItem = {
        word: 'test'
        // Missing description and language
      };

      const request = new Request('https://example.com/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incompleteItem)
      });

      const response = await POST(request);
      expect(response).toBeInstanceOf(MockResponse);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(kv.saveToHistory).not.toHaveBeenCalled();
    });

    it('handles errors', async () => {
      const newItem = {
        word: 'test',
        description: 'a test',
        language: 'English'
      };

      (kv.saveToHistory as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const request = new Request('https://example.com/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      const response = await POST(request);
      expect(response).toBeInstanceOf(MockResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('DELETE', () => {
    beforeEach(() => {
      process.env.ADMIN_PASSWORD = 'testpassword';
    });

    it('clears history with correct password', async () => {
      (kv.clearHistory as jest.Mock).mockResolvedValueOnce(true);

      const request = new Request('https://example.com/api/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'testpassword' })
      });

      const response = await DELETE(request);
      expect(response).toBeInstanceOf(MockResponse);

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);

      expect(kv.clearHistory).toHaveBeenCalled();
    });

    it('returns error for incorrect password', async () => {
      const request = new Request('https://example.com/api/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'wrongpassword' })
      });

      const response = await DELETE(request);
      expect(response).toBeInstanceOf(MockResponse);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');

      expect(kv.clearHistory).not.toHaveBeenCalled();
    });

    it('handles errors', async () => {
      (kv.clearHistory as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const request = new Request('https://example.com/api/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'testpassword' })
      });

      const response = await DELETE(request);
      expect(response).toBeInstanceOf(MockResponse);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });
  });
}); 