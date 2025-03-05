import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import WordHistory from '@/components/WordHistory';
import '@testing-library/jest-dom';

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

// Mock fetch for all tests
global.fetch = jest.fn().mockImplementation((url) => {
  if (url === '/api/history') {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        history: [
          {
            id: '1',
            word: 'Apple',
            description: 'A round fruit with red skin',
            language: 'English',
            timestamp: 1623456789000
          },
          {
            id: '2',
            word: 'Banana',
            description: 'A long curved fruit with yellow skin',
            language: 'English',
            timestamp: 1623456789000
          }
        ]
      })
    });
  }
  return Promise.resolve({
    ok: true,
    json: async () => ({})
  });
});

describe('WordHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state while fetching history', async () => {
    // Delay the fetch response to test loading state
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              history: []
            })
          });
        }, 100);
      });
    });

    await act(async () => {
      render(<WordHistory onSelectWord={jest.fn()} />);
    });

    // Check for placeholder content during loading
    const placeholderElements = document.querySelectorAll('.animate-pulse');
    expect(placeholderElements.length).toBeGreaterThan(0);
  });

  it('displays history items after loading', async () => {
    await act(async () => {
      render(<WordHistory onSelectWord={jest.fn()} />);
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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

  // New tests for modal behavior
  it('renders as a modal when isModal is true', async () => {
    const mockOnClose = jest.fn();

    await act(async () => {
      render(
        <WordHistory
          onSelectWord={jest.fn()}
          isModal={true}
          onClose={mockOnClose}
        />
      );
    });

    // Check for modal-specific classes
    const modalContainer = document.querySelector('.fixed.inset-0.z-50');
    expect(modalContainer).toBeInTheDocument();

    // Check for close button
    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders as a sidebar when isModal is false', async () => {
    await act(async () => {
      render(<WordHistory onSelectWord={jest.fn()} isModal={false} />);
    });

    // Check that it doesn't have modal-specific classes
    const modalContainer = document.querySelector('.fixed.inset-0.z-50');
    expect(modalContainer).not.toBeInTheDocument();

    // Check that close button is not present
    const closeButton = screen.queryByText('Close');
    expect(closeButton).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked in modal mode', async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    await act(async () => {
      render(
        <WordHistory
          onSelectWord={jest.fn()}
          isModal={true}
          onClose={mockOnClose}
        />
      );
    });

    // Find and click the close button
    const closeButton = screen.getByText('Close');
    await act(async () => {
      await user.click(closeButton);
    });

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when a history item is clicked in modal mode', async () => {
    const mockSelectWord = jest.fn();
    const mockOnClose = jest.fn();

    // Mock fetch response for loading history
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [{
          word: 'Apple',
          description: 'A round fruit with red skin',
          language: 'English',
          timestamp: 1623456789000
        }]
      })
    });

    const user = userEvent.setup();

    await act(async () => {
      render(
        <WordHistory
          onSelectWord={mockSelectWord}
          isModal={true}
          onClose={mockOnClose}
        />
      );
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Click on the history item
    await act(async () => {
      await user.click(screen.getByText('Apple'));
    });

    // Check if both onSelectWord and onClose were called
    expect(mockSelectWord).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when a history item is clicked in non-modal mode', async () => {
    const mockSelectWord = jest.fn();
    const mockOnClose = jest.fn();

    // Mock fetch response for loading history
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [{
          word: 'Apple',
          description: 'A round fruit with red skin',
          language: 'English',
          timestamp: 1623456789000
        }]
      })
    });

    const user = userEvent.setup();

    await act(async () => {
      render(
        <WordHistory
          onSelectWord={mockSelectWord}
          isModal={false}
          onClose={mockOnClose}
        />
      );
    });

    // Wait for history items to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Click on the history item
    await act(async () => {
      await user.click(screen.getByText('Apple'));
    });

    // Check if onSelectWord was called but onClose was not
    expect(mockSelectWord).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('has proper modal styling with rounded corners and shadow', async () => {
    await act(async () => {
      render(
        <WordHistory
          onSelectWord={jest.fn()}
          isModal={true}
          onClose={jest.fn()}
        />
      );
    });

    // Check for modal-specific styling
    const modalContent = document.querySelector('.max-w-md.flex.flex-col.rounded-lg.shadow-xl');
    expect(modalContent).toBeInTheDocument();
  });

  it('prevents flickering by keeping previous history while loading new items', async () => {
    // Mock initial history load
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          history: [
            {
              id: '1',
              word: 'Initial',
              description: 'Initial item',
              language: 'English',
              timestamp: Date.now(),
            }
          ]
        })
      });
    });

    const { rerender } = render(<WordHistory onSelectWord={jest.fn()} />);

    // Wait for initial history to load
    await waitFor(() => {
      expect(screen.getByText('Initial')).toBeInTheDocument();
    });

    // Set up a mock for a refresh that will be triggered
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          history: [
            {
              id: '2',
              word: 'New',
              description: 'New item',
              language: 'English',
              timestamp: Date.now(),
            },
            {
              id: '1',
              word: 'Initial',
              description: 'Initial item',
              language: 'English',
              timestamp: Date.now(),
            }
          ]
        })
      });
    });

    // Trigger a refresh by changing the refreshTrigger prop
    rerender(<WordHistory onSelectWord={jest.fn()} refreshTrigger={true} />);

    // The initial item should still be visible during the update
    await waitFor(() => {
      const initialElements = screen.getAllByText('Initial');
      expect(initialElements.length).toBeGreaterThan(0);
    });
  });
}); 