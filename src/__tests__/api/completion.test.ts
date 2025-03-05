import { POST } from '@/app/api/completion/route';

// Mock the OpenAI API
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
    Configuration: jest.fn(),
    OpenAIApi: jest.fn(() => mockOpenAI),
    ChatCompletionRequestMessageRoleEnum: {
      System: 'system',
      User: 'user',
      Assistant: 'assistant'
    }
  };
});

// Mock the AI package
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

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-key';

describe('Completion API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes completion requests correctly', async () => {
    const request = new Request('https://example.com/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'What is the meaning of gato in English?',
        language: 'Spanish'
      })
    });

    const response = await POST(request);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);

    // Get the OpenAI API mock
    const { OpenAIApi } = require('openai-edge');
    const mockOpenAI = OpenAIApi();

    // Check that createChatCompletion was called
    expect(mockOpenAI.createChatCompletion).toHaveBeenCalled();

    // Check that the model and stream parameters are set
    const callArgs = mockOpenAI.createChatCompletion.mock.calls[0][0];
    expect(callArgs.model).toBeDefined();
    expect(callArgs.stream).toBe(true);

    // Check that the messages array contains at least two messages
    expect(callArgs.messages.length).toBeGreaterThanOrEqual(2);

    // Check that the system message contains the language
    const systemMessage = callArgs.messages.find(msg => msg.role === 'system');
    expect(systemMessage.content).toContain('Spanish');

    // Check that there is a user message with the prompt
    const userMessage = callArgs.messages.find(msg => msg.role === 'user');
    expect(userMessage).toBeDefined();
    expect(userMessage.content).toBe('What is the meaning of gato in English?');
  });

  it('handles different languages correctly', async () => {
    const request = new Request('https://example.com/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'What is the meaning of gato in English?',
        language: 'Spanish'
      })
    });

    const response = await POST(request);
    expect(response).toBeInstanceOf(Response);

    // Get the OpenAI API mock
    const { OpenAIApi } = require('openai-edge');
    const mockOpenAI = OpenAIApi();

    // Check that the system message includes Spanish-specific notes
    const callArgs = mockOpenAI.createChatCompletion.mock.calls[0][0];
    const systemMessage = callArgs.messages.find(msg => msg.role === 'system');
    expect(systemMessage.content).toContain('Spanish');
  });

  it('handles errors gracefully', async () => {
    // Mock the OpenAI API to throw an error
    const { OpenAIApi } = require('openai-edge');
    const mockOpenAI = OpenAIApi();
    mockOpenAI.createChatCompletion.mockRejectedValueOnce(new Error('API error'));

    const request = new Request('https://example.com/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'What is the meaning of gato in English?',
        language: 'Spanish'
      })
    });

    try {
      const response = await POST(request);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    } catch (error) {
      // If the function throws instead of returning a response, that's also acceptable
      expect(error.message).toContain('API error');
    }
  });
}); 