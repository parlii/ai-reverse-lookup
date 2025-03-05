import { render } from '@testing-library/react';
import Page from '@/app/page';

// Mock the Completion component since we're only testing that Page renders it correctly
jest.mock('@/app/completion', () => {
  return function MockCompletion() {
    return <div data-testid="mock-completion">Mocked Completion Component</div>;
  };
});

describe('Page Component', () => {
  it('renders the Completion component', () => {
    const { getByTestId } = render(<Page />);
    expect(getByTestId('mock-completion')).toBeInTheDocument();
  });
}); 