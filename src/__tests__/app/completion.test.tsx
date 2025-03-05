import { render, screen } from '@testing-library/react';
import Completion from '@/app/completion';

// Mock the Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Mock Header</header>;
  };
});

// Mock the ReverseLookupForm component
jest.mock('@/components/ReverseLookupForm', () => {
  return function MockReverseLookupForm() {
    return <div data-testid="mock-reverse-lookup-form">Mock Reverse Lookup Form</div>;
  };
});

describe('Completion Component', () => {
  it('renders the header and form', () => {
    render(<Completion />);

    // Check if the header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

    // Check if the form is rendered
    expect(screen.getByTestId('mock-reverse-lookup-form')).toBeInTheDocument();
  });

  it('renders the footer with project information', () => {
    render(<Completion />);

    // Check if the footer is rendered with open source text
    const footerText = screen.getByText(/Word Finder - Open Source Project/i);
    expect(footerText).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    render(<Completion />);

    // Check if the main container has the correct classes
    const mainContainer = screen.getByTestId('mock-reverse-lookup-form').parentElement?.parentElement;
    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('flex-col');
    expect(mainContainer).toHaveClass('items-center');
    expect(mainContainer).toHaveClass('min-h-screen');
  });
}); 