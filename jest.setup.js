// Import jest-dom extensions
import '@testing-library/jest-dom';

// Mock global objects for Next.js API routes
class MockResponse {
  constructor(body = '', init = {}) {
    this.body = body;
    this.init = init;
    this.headers = new Headers(init.headers || {});
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
}

// Define global Request class
global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Headers(init.headers || {});
    this.body = init.body || null;
    this._json = null;

    if (init.body && typeof init.body === 'string') {
      try {
        this._json = JSON.parse(init.body);
      } catch (e) {
        // Not JSON, leave as is
      }
    }
  }

  async json() {
    return this._json;
  }
};

global.Response = MockResponse;
global.Headers = jest.fn().mockImplementation(() => ({}));
global.ReadableStream = jest.fn().mockImplementation(() => ({}));

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body, options = {}) => {
        const response = new MockResponse(JSON.stringify(body), {
          status: options.status || 200,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          }
        });

        // Add json method to the response object
        response.json = jest.fn().mockResolvedValue(body);

        return response;
      }),
      redirect: (url) => {
        return new Response(null, {
          status: 302,
          headers: { Location: url }
        });
      },
      next: () => {
        return new Response(null);
      }
    }
  };
});

// Mock OpenAI
jest.mock('openai-edge', () => {
  const mockCreateChatCompletion = jest.fn().mockResolvedValue({
    status: 200,
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            JSON.stringify({
              choices: [
                {
                  delta: { content: 'Test response' },
                  index: 0,
                  finish_reason: null
                }
              ]
            })
          )
        );
        controller.close();
      }
    })
  });

  const mockOpenAI = {
    createChatCompletion: mockCreateChatCompletion
  };

  return {
    Configuration: jest.fn().mockImplementation(() => ({})),
    OpenAIApi: jest.fn().mockImplementation(() => mockOpenAI),
    ChatCompletionRequestMessageRoleEnum: {
      System: 'system',
      User: 'user',
      Assistant: 'assistant'
    }
  };
});

// Mock Redis
jest.mock('redis', () => {
  const mockRedisClient = {
    on: jest.fn().mockImplementation((event, callback) => {
      if (event === 'connect') {
        callback();
      }
      return mockRedisClient;
    }),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1)
  };

  return {
    createClient: jest.fn().mockReturnValue(mockRedisClient)
  };
});

// Mock AI package
jest.mock('ai', () => {
  return {
    OpenAIStream: jest.fn().mockImplementation(() => {
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Test stream response'));
          controller.close();
        }
      });
    }),
    StreamingTextResponse: jest.fn().mockImplementation((stream) => {
      return new Response(stream);
    })
  };
});

// Mock OpenAI ChatCompletionRequestMessageRoleEnum
global.ChatCompletionRequestMessageRoleEnum = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant',
};

// Set up environment variables for tests
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ADMIN_PASSWORD = 'testpassword';
process.env.OPENAI_API_KEY = 'test-api-key'; 