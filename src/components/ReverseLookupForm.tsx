import LanguageSelector from "./LanguageSelector";
import { Noto_Serif_Devanagari } from "next/font/google";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { response_format } from "@/app/constants";
import { useCompletion } from "ai/react";
import { useState, useRef, useEffect, ReactNode } from "react";
import { extractWordInfo } from "@/lib/extractWord";
import WordHistory from "./WordHistory";

const noto = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"] });

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

  const {
    completion,
    setCompletion, // Use the setCompletion function directly
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
    <div className="flex flex-row w-full max-w-6xl gap-4">
      {/* Word History Panel - Left side */}
      <div className={`transition-all duration-300 ease-in-out ${showHistory ? 'w-80' : 'w-0 overflow-hidden'}`}>
        {showHistory && (
          <WordHistory
            refreshTrigger={historyUpdated}
            onSelectWord={(description, lang, completion) => {
              if (description) {
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

                  // We need to use a timeout to ensure React state updates have processed
                  // before we try to set the completion
                  setTimeout(() => {
                    // Directly setting the completion state
                    setCompletion(completion);
                  }, 100);
                }
              }
            }}
          />
        )}
      </div>

      {/* Word Finder - Center */}
      <div className="p-2 rounded-lg shadow-md w-full max-w-2xl text-lg mb-4 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Word Finder</h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1 text-sm border rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            History
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="border dark:border:white p-4 rounded-lg"
        >
          <div className="flex flex-col space-y-2">
            <textarea
              id="input"
              name="input"
              value={input}
              onChange={handleInputChange}
              rows={2}
              required
              className="block flex-grow px-2 py-1 border rounded-md resize-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter the description of the word you want to find"
            />
          </div>
          <div className="flex flex-row items-center justify-between items-end space-x-2 md:space-x-2 mt-4 md:mt-2">
            <LanguageSelector
              language={language}
              onLanguageChange={handleLanguageChange}
            />
            {isLoading ? (
              <button
                type="button"
                className="px-2 py-1 border rounded-md bg-red-500 text-white hover:bg-red-700 active:bg-red-800 sm:w-auto whitespace-nowrap"
                onClick={stop}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="px-3 py-1 border rounded-md bg-green-700 text-white hover:bg-green-800 active:bg-green-900 sm:w-auto whitespace-nowrap"
                disabled={isLoading}
              >
                Find me a word!
              </button>
            )}
          </div>
        </form>
        <div className="p-4 rounded-lg shadow-md mt-4 w-full whitespace-pre-wrap overflow-auto text-xl">
          {completion ? (
            <div className={noto.className}>
              {/* Enhanced markdown rendering with proper spacing */}
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
                        <ReactMarkdown>{beforeWord}</ReactMarkdown>
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
                              case "Nepali": utterance.lang = "ne-NP"; break;
                              default: utterance.lang = "en-US";
                            }

                            // Immediate fallback for Nepali since browser support is limited
                            if (language === "Nepali") {
                              // For Nepali, directly use English voice
                              utterance.lang = "en-US";
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
                          className="mx-1 p-1 inline-flex items-center justify-center bg-green-700 text-white rounded-full hover:bg-green-800 focus:outline-none"
                          style={{ width: '24px', height: '24px' }}
                          title="Listen to pronunciation"
                          aria-label="Listen to pronunciation"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="text-gray-500 space-y-2">
              <ReactMarkdown>{response_format}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReverseLookupForm;
