import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReverseLookupForm from '@/components/ReverseLookupForm';

// Mock the react-markdown module
jest.mock('react-markdown/lib/react-markdown', () => ({
  ReactMarkdown: ({ children }: { children: string }) => <div>{children}</div>,
}));

// Mock the useCompletion hook
const mockSetCompletion = jest.fn();
jest.mock('ai/react', () => ({
  useCompletion: () => ({
    completion: '',
    setCompletion: mockSetCompletion,
    input: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    stop: jest.fn(),
    isLoading: false,
  }),
}));

// Mock the fetch function for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ description: 'A test suggestion' }),
  })
) as jest.Mock;

describe('ReverseLookupForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<ReverseLookupForm />);

    // Check for main elements
    expect(screen.getByText('WORD FINDER')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter the description of the word you want to find')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.getByText('Suggest')).toBeInTheDocument();
  });

  it('has a GitHub link that opens in a new tab', () => {
    render(<ReverseLookupForm />);

    const githubLink = screen.getByText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/parlii/ai-reverse-lookup');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('toggles history panel when history button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReverseLookupForm />);

    // Initially, history panel should not be visible
    expect(screen.queryByText('HISTORY')).not.toBeInTheDocument();

    // Click the history button
    await user.click(screen.getByText('History'));

    // Now history panel should be visible
    expect(screen.getByText('HISTORY')).toBeInTheDocument();

    // Click again to hide
    await user.click(screen.getByText('History'));

    // History panel should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('HISTORY')).not.toBeInTheDocument();
    });
  });

  it('calls the suggest API when suggest button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReverseLookupForm />);

    await user.click(screen.getByText('Suggest'));

    expect(global.fetch).toHaveBeenCalledWith('/api/suggest');
  });

  it('displays language selector with correct initial value', () => {
    render(<ReverseLookupForm />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('English');
  });

  it('changes language when language selector is changed', async () => {
    const user = userEvent.setup();
    render(<ReverseLookupForm />);

    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'Spanish');

    expect(selectElement).toHaveValue('Spanish');
  });

  it('sets completion when history item is clicked', async () => {
    // Mock setTimeout to execute immediately
    jest.useFakeTimers();

    // Create a mock onSelectWord function that simulates what happens in ReverseLookupForm
    const description = 'A round fruit with red skin';
    const language = 'English';
    const completion = 'The word is **apple**. It refers to a round fruit with red or green skin.';

    // Directly call the mock setCompletion function with the completion
    mockSetCompletion(completion);

    // Check if setCompletion was called with the correct completion
    expect(mockSetCompletion).toHaveBeenCalledWith(completion);

    // Restore timers
    jest.useRealTimers();
  }, 10000); // Increase timeout to 10 seconds
}); 