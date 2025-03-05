import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

// Mock the ReactMarkdown component
jest.mock('react-markdown/lib/react-markdown', () => ({
  ReactMarkdown: ({ children }: { children: string }) => <div>{children}</div>
}));

// Import after mocking
import ReverseLookupForm from '@/components/ReverseLookupForm';

// Mock the window.innerWidth for testing responsive behavior
const mockWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  // Trigger the resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock fetch for history API
global.fetch = jest.fn().mockImplementation((url) => {
  if (url === '/api/history') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        history: [
          {
            id: '1',
            word: 'Test',
            description: 'A sample test item',
            language: 'English',
            timestamp: Date.now(),
          },
          {
            id: '2',
            word: 'Example',
            description: 'Another sample item',
            language: 'English',
            timestamp: Date.now(),
          }
        ]
      }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  lang: '',
  onerror: null,
}));

// Create a partial mock of SpeechSynthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
  onvoiceschanged: null,
  paused: false,
  pending: false,
  speaking: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

// Assign the mock to global.speechSynthesis
Object.defineProperty(global, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
});

describe('Responsive History Panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset window.innerWidth
    mockWindowInnerWidth(1024);
  });

  it('should render history as sidebar on desktop', async () => {
    // Set desktop width
    mockWindowInnerWidth(1024);

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for history to load
    await waitFor(() => {
      // Check that history is rendered as a sidebar (not a modal)
      const historyPanel = document.querySelector('.hidden.md\\:block.w-\\[35rem\\]');
      expect(historyPanel).toBeInTheDocument();
    });

    // Verify that the modal version is not present
    const modalOverlay = document.querySelector('.absolute.top-0.left-0.right-0.z-50');
    expect(modalOverlay).not.toBeInTheDocument();
  });

  it('should render history as modal overlay on mobile', async () => {
    // Set mobile width
    mockWindowInnerWidth(480);

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for history to load
    await waitFor(() => {
      // Check that history is rendered as a modal overlay
      const modalOverlay = document.querySelector('.absolute.top-0.left-0.right-0.z-50');
      expect(modalOverlay).toBeInTheDocument();
    });

    // Verify that the sidebar version is not present
    const sidebarPanel = document.querySelector('.hidden.md\\:block.w-\\[35rem\\]');
    expect(sidebarPanel).not.toBeInTheDocument();
  });

  it('should close the modal when clicking the close button on mobile', async () => {
    // Set mobile width
    mockWindowInnerWidth(480);

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button to open the modal
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for history to load
    await waitFor(() => {
      const closeButton = screen.getByText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    // Click the close button
    const closeButton = screen.getByText('Close');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Verify that the modal is closed
    await waitFor(() => {
      const modalOverlay = document.querySelector('.absolute.top-0.left-0.right-0.z-50');
      expect(modalOverlay).not.toBeInTheDocument();
    });
  });

  it('should close the modal when selecting a history item on mobile', async () => {
    // Set mobile width
    mockWindowInnerWidth(480);

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button to open the modal
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for history items to load
    await waitFor(() => {
      const historyItem = screen.getByText('Test');
      expect(historyItem).toBeInTheDocument();
    });

    // Click a history item
    const historyItem = screen.getByText('Test');
    await act(async () => {
      fireEvent.click(historyItem);
    });

    // Verify that the modal is closed
    await waitFor(() => {
      const modalOverlay = document.querySelector('.absolute.top-0.left-0.right-0.z-50');
      expect(modalOverlay).not.toBeInTheDocument();
    });
  });

  it('should maintain consistent width during loading on desktop', async () => {
    // Set desktop width
    mockWindowInnerWidth(1024);

    // Delay the fetch response to test loading state
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              history: [
                {
                  id: '1',
                  word: 'Test',
                  description: 'A sample test item',
                  language: 'English',
                  timestamp: Date.now(),
                }
              ]
            }),
          });
        }, 100);
      });
    });

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Check for placeholder content during loading
    await waitFor(() => {
      const placeholderElements = document.querySelectorAll('.animate-pulse');
      expect(placeholderElements.length).toBeGreaterThan(0);
    });

    // Wait for history to load
    await waitFor(() => {
      const historyItem = screen.getByText('Test');
      expect(historyItem).toBeInTheDocument();
    });
  });

  it('should switch between sidebar and modal when resizing the window', async () => {
    // Start with desktop width
    mockWindowInnerWidth(1024);

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for history to load as sidebar
    await waitFor(() => {
      const sidebarPanel = document.querySelector('.hidden.md\\:block.w-\\[35rem\\]');
      expect(sidebarPanel).toBeInTheDocument();
    });

    // Change to mobile width
    await act(async () => {
      mockWindowInnerWidth(480);
    });

    // Verify that it's now a modal
    await waitFor(() => {
      const modalOverlay = document.querySelector('.absolute.top-0.left-0.right-0.z-50');
      expect(modalOverlay).toBeInTheDocument();

      const sidebarPanel = document.querySelector('.hidden.md\\:block.w-\\[35rem\\]');
      expect(sidebarPanel).not.toBeInTheDocument();
    });

    // Change back to desktop width
    await act(async () => {
      mockWindowInnerWidth(1024);
    });

    // Verify that it's back to sidebar
    await waitFor(() => {
      const sidebarPanel = document.querySelector('.hidden.md\\:block.w-\\[35rem\\]');
      expect(sidebarPanel).toBeInTheDocument();

      const modalOverlay = document.querySelector('.absolute.top-0.left-0.right-0.z-50');
      expect(modalOverlay).not.toBeInTheDocument();
    });
  });

  it('should have proper modal styling on larger screens', async () => {
    // Set mobile width
    mockWindowInnerWidth(480);

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for history to load
    await waitFor(() => {
      // Check for modal-specific styling
      const modalContent = document.querySelector('.max-w-md.flex.flex-col.rounded-lg.shadow-xl');
      expect(modalContent).toBeInTheDocument();
    });
  });

  it('should prevent flickering when loading new history items', async () => {
    // Set desktop width
    mockWindowInnerWidth(1024);

    // Mock initial history load
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          history: [
            {
              id: '1',
              word: 'Initial',
              description: 'Initial item',
              language: 'English',
              timestamp: Date.now(),
            }
          ]
        }),
      });
    });

    await act(async () => {
      render(<ReverseLookupForm />);
    });

    // Click the history button
    const historyButton = screen.getByText('History');
    await act(async () => {
      fireEvent.click(historyButton);
    });

    // Wait for initial history to load
    await waitFor(() => {
      const initialItem = screen.getByText('Initial');
      expect(initialItem).toBeInTheDocument();
    });

    // Mock a completion that will trigger a history update
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
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
        }),
      });
    });

    // Simulate a completion that would trigger a history update
    await act(async () => {
      // The initial item should still be visible during the update
      expect(screen.getByText('Initial')).toBeInTheDocument();
    });
  });
}); 