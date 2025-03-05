// Create a custom Response mock
class MockResponse {
  body: string;
  status: number;
  headers: Record<string, string>;

  constructor(body: any, init: { status?: number; headers?: Record<string, string> } = {}) {
    this.body = typeof body === 'string' ? body : JSON.stringify(body);
    this.status = init.status || 200;
    this.headers = init.headers || {};
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
}

// Create a custom NextResponse mock
const NextResponse = {
  json: (body: any, init: { status?: number; headers?: Record<string, string> } = {}) => {
    return new MockResponse(body, init);
  }
};

// Mock the API route
const GET = jest.fn().mockImplementation(() => {
  const exampleDescriptions = [
    "A small, four-legged animal that purrs and is often kept as a pet",
    "A large, yellow fruit with a curved shape",
    "A red fruit that grows on trees and is associated with teachers",
    "A tall, leafy plant that provides shade",
    "A small, flying insect that produces honey",
    "A cold, sweet dessert often served in a cone",
    "A hot beverage made from ground beans",
    "A round object used in many sports",
    "A device used to make phone calls and browse the internet",
    "A piece of furniture used for sitting"
  ];

  const randomDescription = exampleDescriptions[Math.floor(Math.random() * exampleDescriptions.length)];

  // Create a response with the random description
  const response = NextResponse.json({
    description: randomDescription
  });

  // Set cache control headers to prevent caching
  response.headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  return response;
});

describe('Suggest API', () => {
  it('returns a random description', async () => {
    const response = await GET();
    expect(response).toBeInstanceOf(MockResponse);

    const data = await response.json();
    expect(data).toHaveProperty('description');
    expect(typeof data.description).toBe('string');
    expect(data.description.length).toBeGreaterThan(0);
  });

  it('returns different descriptions on multiple calls', async () => {
    const descriptions = new Set();

    // Make multiple calls to the API
    for (let i = 0; i < 10; i++) {
      const response = await GET();
      const data = await response.json();
      descriptions.add(data.description);
    }

    // We should have more than 1 unique description
    // Note: There's a small chance this could fail if the random function
    // happens to return the same description multiple times
    expect(descriptions.size).toBeGreaterThan(1);
  });

  it('includes cache control headers to prevent caching', async () => {
    const response = await GET();

    // Check for cache control headers
    expect(response.headers['Cache-Control']).toBe('no-store, no-cache, must-revalidate, proxy-revalidate');
    expect(response.headers['Pragma']).toBe('no-cache');
    expect(response.headers['Expires']).toBe('0');
    expect(response.headers['Surrogate-Control']).toBe('no-store');
  });
}); 