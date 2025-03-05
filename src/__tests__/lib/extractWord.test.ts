import { extractWordInfo } from '@/lib/extractWord';

describe('extractWordInfo', () => {
  it('should extract word and pronunciation correctly', () => {
    const completion = '**Apple** (ˈæpəl) *Noun*\n\nA round fruit with red, yellow, or green skin and a white inside.';
    const result = extractWordInfo(completion);

    expect(result).toEqual({
      word: 'Apple',
      pronunciation: 'ˈæpəl'
    });
  });

  it('should extract word without pronunciation', () => {
    const completion = '**Apple** *Noun*\n\nA round fruit with red, yellow, or green skin and a white inside.';
    const result = extractWordInfo(completion);

    expect(result).toEqual({
      word: 'Apple',
      pronunciation: undefined
    });
  });

  it('should handle non-English characters', () => {
    const completion = '**आलस्य** (ālasya) *नाम*\n\nनिष्क्रियताको अवस्था वा स्थिति';
    const result = extractWordInfo(completion);

    expect(result).toEqual({
      word: 'आलस्य',
      pronunciation: 'ālasya'
    });
  });

  it('should return null for invalid input', () => {
    expect(extractWordInfo('')).toBeNull();
    expect(extractWordInfo('No word in bold here')).toBeNull();
  });

  it('should handle complex formatting', () => {
    const completion = '# Word of the Day\n\n**Serendipity** (ˌserənˈdɪpɪti) *Noun*\n\nThe occurrence of events by chance in a happy or beneficial way.';
    const result = extractWordInfo(completion);

    expect(result).toEqual({
      word: 'Serendipity',
      pronunciation: 'ˌserənˈdɪpɪti'
    });
  });
}); 