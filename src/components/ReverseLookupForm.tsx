import LanguageSelector from "./LanguageSelector";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { response_format } from "@/app/constants";
import { useCompletion } from "ai/react";
import { useState, useRef, useEffect, ReactNode } from "react";
import { extractWordInfo } from "@/lib/extractWord";
import WordHistory from "./WordHistory";

interface ReactMarkdownWithPronunciationProps {
  children: string;
  language: string;
}

// Simplified version that just passes through to ReactMarkdown
const ReactMarkdownWithPronunciation = ({ children, language }: ReactMarkdownWithPronunciationProps) => {
  return (
    <ReactMarkdown>{children}</ReactMarkdown>
  );
};

const ReverseLookupForm = () => {
  const [language, setLanguage] = useState<string>("English");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyUpdated, setHistoryUpdated] = useState<boolean>(false);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const handleSuggest = async () => {
    try {
      const response = await fetch('/api/suggest');
      const data = await response.json();
      if (data.description) {
        // Create the input change event
        const event = {
          target: { value: data.description }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        // Update the input field
        handleInputChange(event);
      }
    } catch (error) {
      console.error('Failed to fetch suggestion:', error);
    }
  };

  const {
    completion,
    setCompletion,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading,
  } = useCompletion({
    api: "/api/completion",
    body: {
      language: language,
    },
    onFinish: async (prompt, completion) => {
      // Try to save to history when we get a completion
      try {
        const wordInfo = extractWordInfo(completion);
        if (wordInfo && wordInfo.word) {
          const response = await fetch('/api/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              word: wordInfo.word,
              pronunciation: wordInfo.pronunciation,
              description: prompt,
              language: language,
              completion: completion // Save the full completion response
            }),
          });

          if (response.ok) {
            // Trigger history component to refresh
            setHistoryUpdated(prev => !prev);
          }
        }
      } catch (error) {
        console.error('Failed to save to history:', error);
        // App continues to work even if history saving fails
      }
    }
  });

  return (
    <div className="flex flex-col items-center w-full max-w-7xl">
      <div className="flex flex-row w-full justify-center gap-5">
        {/* Word History Panel - Left side - No animation, just display/hide */}
        {showHistory && (
          <div className="w-[35rem]">
            <WordHistory
              refreshTrigger={historyUpdated}
              onSelectWord={(description, lang, completion) => {
                if (description) {
                  console.log("History item selected:", { description, lang, completion });

                  // Set the language and input based on the history item
                  setLanguage(lang);

                  // Create the input change event
                  const event = {
                    target: { value: description }
                  } as React.ChangeEvent<HTMLTextAreaElement>;

                  // Update the input field
                  handleInputChange(event);

                  // Set completion if available (from history)
                  if (completion) {
                    console.log("Loading saved completion:", completion);

                    // Directly set the completion state
                    setCompletion(completion);

                    // If direct setting doesn't work, try with a timeout
                    // to ensure React state updates have processed
                    if (!completion) {
                      setTimeout(() => {
                        console.log("Setting completion with timeout");
                        setCompletion(completion);
                      }, 100);
                    }
                  }
                }
              }}
            />
          </div>
        )}

        {/* Word Finder - Center - Fixed width to prevent resizing */}
        <div className="w-full max-w-2xl flex-shrink-0">
          <div className="bg-dark rounded-t-lg p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-accent font-chillax tracking-wide uppercase">WORD FINDER</h2>
            <div className="flex gap-2">
              <a
                href="https://github.com/parlii/ai-reverse-lookup"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-medium text-cream hover:bg-opacity-90 transition-all shadow-sm font-chillax font-semibold flex items-center"
                aria-label="View on GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 rounded-lg bg-medium text-cream hover:bg-opacity-90 transition-all shadow-sm font-chillax font-semibold"
              >
                History
              </button>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-medium p-5 shadow-md font-chillax"
          >
            <div className="flex flex-col space-y-3">
              <textarea
                id="input"
                name="input"
                value={input}
                onChange={handleInputChange}
                rows={3}
                required
                className="block flex-grow px-3 py-2 border-2 border-accent bg-dark text-white rounded-lg resize-none focus:border-accent focus:outline-none transition-shadow font-satoshi"
                placeholder="Enter the description of the word you want to find"
                style={{ borderColor: 'var(--color-accent-yellow)' }}
              />
            </div>
            <div className="flex flex-row items-center justify-between mt-4">
              <div className="w-auto">
                <LanguageSelector
                  language={language}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-opacity-90 active:bg-opacity-100 shadow-sm transition-all font-chillax font-semibold"
                >
                  Suggest
                </button>
                {isLoading ? (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-red-500 text-cream hover:bg-red-600 active:bg-red-700 shadow-sm transition-all font-chillax font-semibold"
                    onClick={stop}
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-accent text-navy hover:bg-opacity-90 active:bg-opacity-100 shadow-sm transition-all font-chillax font-semibold"
                    disabled={isLoading}
                  >
                    Find
                  </button>
                )}
              </div>
            </div>
          </form>
          <div className="bg-medium p-5 rounded-b-lg shadow-md whitespace-pre-wrap overflow-auto text-white font-satoshi">
            {completion ? (
              <div className="text-white font-satoshi">
                {(() => {
                  // Parse the markdown to find the word and its surrounding context
                  // Fix markdown spacing without adding too many line breaks
                  const formattedCompletion = completion
                    .replace(/\n\n\n+/g, '\n\n') // Normalize multiple line breaks to just two
                    .replace(/\n\s*\n/g, '\n\n') // Normalize lines with only whitespace
                    .replace(/\*Suggest an example sentence/g, '\n*Suggest an example sentence'); // Add spacing before example

                  const lines = formattedCompletion.split('\n');
                  let result = [];
                  let foundWord = false;

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    // Check if this line contains the word pattern
                    const regex = /\*\*(.*?)\*\*/;
                    const match = line.match(regex);

                    if (!foundWord && match && match[1]) {
                      foundWord = true;
                      const word = match[1];

                      // Find the position of the word in the line
                      const wordStart = line.indexOf(`**${word}**`);
                      const wordEnd = wordStart + word.length + 4; // +4 for the ** markers

                      // Split the line into parts
                      const beforeWord = line.substring(0, wordEnd);
                      const afterWord = line.substring(wordEnd);

                      // Create element with the word and button
                      result.push(
                        <div key={i} className="flex items-baseline mb-2">
                          <div className="font-chillax font-semibold">
                            <ReactMarkdown components={{
                              strong: ({ node, ...props }) => <span className="font-chillax font-semibold" {...props} />
                            }}>{beforeWord}</ReactMarkdown>
                          </div>
                          {/* Show sound button for all languages, use Hindi for Nepali */}
                          <button
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(word);

                              // Set language
                              switch (language) {
                                case "Spanish": utterance.lang = "es-ES"; break;
                                case "French": utterance.lang = "fr-FR"; break;
                                case "German": utterance.lang = "de-DE"; break;
                                case "Italian": utterance.lang = "it-IT"; break;
                                case "Portuguese": utterance.lang = "pt-PT"; break;
                                case "Japanese": utterance.lang = "ja-JP"; break;
                                case "Korean": utterance.lang = "ko-KR"; break;
                                case "Chinese": utterance.lang = "zh-CN"; break;
                                case "Hindi": utterance.lang = "hi-IN"; break;
                                case "Russian": utterance.lang = "ru-RU"; break;
                                case "Nepali": utterance.lang = "hi-IN"; break; // Use Hindi for Nepali
                                default: utterance.lang = "en-US";
                              }

                              // Fallback for any language that fails
                              utterance.onerror = (e) => {
                                console.warn("Speech synthesis failed, trying fallback voice", e);
                                // Try with English voice as fallback
                                const fallbackUtterance = new SpeechSynthesisUtterance(word);
                                fallbackUtterance.lang = "en-US";
                                window.speechSynthesis.speak(fallbackUtterance);
                              };

                              window.speechSynthesis.speak(utterance);
                            }}
                            className="mx-1 p-1.5 inline-flex items-center justify-center bg-[#deec13] text-navy rounded-full hover:bg-opacity-90 shadow-sm transition-all focus:outline-none font-chillax font-semibold"
                            style={{ width: '24px', height: '24px' }}
                            title="Listen to pronunciation"
                            aria-label="Listen to pronunciation"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                          <ReactMarkdown>{afterWord}</ReactMarkdown>
                        </div>
                      );
                    } else if (line.trim() === '') {
                      // Add proper spacing for empty lines
                      result.push(<div key={i} className="h-4"></div>);
                    } else {
                      // For other lines, render with proper margin
                      result.push(
                        <div key={i} className="mb-2">
                          <ReactMarkdown>{line}</ReactMarkdown>
                        </div>
                      );
                    }
                  }

                  return <div className="space-y-1">{result}</div>;
                })()}
              </div>
            ) : (
              <div className="text-gray-400 space-y-2 font-satoshi">
                {/* Empty state - no text needed */}
              </div>
            )}
          </div>
        </div>

        {/* Add a spacer div when history is shown to maintain centering */}
        {showHistory && <div className="w-[35rem]"></div>}
      </div>
    </div>
  );
};

export default ReverseLookupForm;
