import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import WordHistory from '@/components/WordHistory';

// Silence the act() warnings specifically for this test file
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning: The current testing environment is not configured to support act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('WordHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = jest.fn();
    window.prompt = jest.fn();
  });

  it('renders history items after loading', async () => {
    // Mock fetch response for loading history
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [
          { word: 'Apple', description: 'A round fruit with red skin', language: 'English', timestamp: 1623456789000 },
          { word: 'Gato', description: 'Un animal doméstico', language: 'Spanish', timestamp: 1623456789001 }
        ]
      })
    });

    await act(async () => {
      render(<WordHistory onSelectWord={() => { }} />);
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Gato')).toBeInTheDocument();
    });

    // Check if fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith('/api/history');
  });

  it('calls onSelectWord with description and language when a history item is clicked', async () => {
    const mockSelectWord = jest.fn();
    const historyItem = {
      word: 'Apple',
      description: 'A round fruit with red skin',
      language: 'English',
      timestamp: 1623456789000
    };

    // Mock fetch response for loading history
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [historyItem]
      })
    });

    const user = userEvent.setup();

    await act(async () => {
      render(<WordHistory onSelectWord={mockSelectWord} />);
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Click on the history item
    await act(async () => {
      await user.click(screen.getByText('Apple'));
    });

    // Check if onSelectWord was called with the correct description and language
    expect(mockSelectWord).toHaveBeenCalledWith(historyItem.description, historyItem.language, undefined);
  });

  it('passes completion to onSelectWord when available', async () => {
    const mockSelectWord = jest.fn();
    const historyItem = {
      word: 'Apple',
      description: 'A round fruit with red skin',
      language: 'English',
      timestamp: 1623456789000,
      completion: 'The word is "apple". It refers to a round fruit with red or green skin and a white interior.'
    };

    // Mock fetch response for loading history
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [historyItem]
      })
    });

    const user = userEvent.setup();

    await act(async () => {
      render(<WordHistory onSelectWord={mockSelectWord} />);
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Click on the history item
    await act(async () => {
      await user.click(screen.getByText('Apple'));
    });

    // Check if onSelectWord was called with all three parameters: description, language, and completion
    expect(mockSelectWord).toHaveBeenCalledWith(
      historyItem.description,
      historyItem.language,
      historyItem.completion
    );
  });

  it('clears history when clear button is clicked and password is correct', async () => {
    // Setup window.prompt to return the correct password
    (window.prompt as jest.Mock).mockReturnValueOnce('correct-password');

    // Mock fetch responses
    (window.fetch as jest.Mock)
      // First call - loading history
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          history: [
            { word: 'Apple', description: 'A round fruit with red skin', language: 'English', timestamp: 1623456789000 }
          ]
        })
      })
      // Second call - clearing history
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    const user = userEvent.setup();

    await act(async () => {
      render(<WordHistory onSelectWord={() => { }} />);
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Click the clear button
    await act(async () => {
      await user.click(screen.getByText('Clear'));
    });

    // Check if prompt was called with the correct message
    expect(window.prompt).toHaveBeenCalledWith('Enter admin password to clear history:');

    // Check if fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'correct-password' })
    });

    // Wait for history to be cleared
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });
}); 