import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '@/components/LanguageSelector';

describe('LanguageSelector Component', () => {
  const mockOnLanguageChange = jest.fn();

  beforeEach(() => {
    mockOnLanguageChange.mockClear();
  });

  it('renders with the correct initial language', () => {
    render(<LanguageSelector language="English" onLanguageChange={mockOnLanguageChange} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue('English');
  });

  it('displays all language options', () => {
    render(<LanguageSelector language="English" onLanguageChange={mockOnLanguageChange} />);

    const expectedLanguages = [
      'English', 'Spanish', 'French', 'German', 'Italian',
      'Portuguese', 'Japanese', 'Korean', 'Chinese',
      'Hindi', 'Russian', 'Nepali'
    ];

    const selectElement = screen.getByRole('combobox');
    const options = Array.from(selectElement.querySelectorAll('option'));

    expect(options.length).toBe(expectedLanguages.length);

    options.forEach((option, index) => {
      expect(option.textContent).toBe(expectedLanguages[index]);
      expect(option.value).toBe(expectedLanguages[index]);
    });
  });

  it('calls onLanguageChange when a different language is selected', () => {
    render(<LanguageSelector language="English" onLanguageChange={mockOnLanguageChange} />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'Nepali' } });

    expect(mockOnLanguageChange).toHaveBeenCalledTimes(1);
  });
}); 