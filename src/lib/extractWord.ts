/**
 * Extracts the word and pronunciation from the completion text
 * Example: "**Seaweed** (ˈsiːwiːd) *Noun*" -> { word: "Seaweed", pronunciation: "ˈsiːwiːd" }
 */
export function extractWordInfo(completion: string): { word: string; pronunciation?: string } | null {
  if (!completion) return null;
  
  // Find the word in the first line of the completion (in bold)
  const wordMatch = completion.match(/\*\*(.*?)\*\*/);
  if (!wordMatch || !wordMatch[1]) return null;
  
  const word = wordMatch[1];
  
  // Try to extract pronunciation if available
  const pronunciationMatch = completion.match(/\*\*.*?\*\*\s*\((.*?)\)/);
  const pronunciation = pronunciationMatch ? pronunciationMatch[1] : undefined;
  
  return { word, pronunciation };
}