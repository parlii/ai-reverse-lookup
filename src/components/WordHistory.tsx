import { useEffect, useState } from 'react';
import { WordHistoryItem } from '@/lib/kv';

interface WordHistoryProps {
  refreshTrigger?: boolean;
  onSelectWord: (description: string, language: string, completion?: string) => void;
}

const WordHistory: React.FC<WordHistoryProps> = ({ refreshTrigger, onSelectWord }) => {
  const [history, setHistory] = useState<WordHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch word history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/history');

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data.history || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching word history:', err);
        setError('Unable to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshTrigger]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear all history with password protection
  const handleClearHistory = async () => {
    const password = window.prompt('Enter admin password to clear history:');
    if (!password) return;
    
    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory([]);
        } else {
          setError('Invalid password');
        }
      } else {
        setError('Failed to clear history');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history');
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Word History</h2>
        <button 
          onClick={handleClearHistory}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
          title="Admin only"
        >
          Clear All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-gray-500">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No search history yet.</p>
          <p className="text-sm mt-2">Your word lookups will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => onSelectWord(item.description, item.language, item.completion)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-lg">{item.word}</div>
                <div className="text-xs text-gray-500">{formatDate(item.timestamp)}</div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                {item.description}
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full">
                  {item.language}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const utterance = new SpeechSynthesisUtterance(item.word);

                    // Set language based on the item's language
                    switch (item.language) {
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
                    if (item.language === "Nepali") {
                      // For Nepali, directly use English voice
                      utterance.lang = "en-US";
                    }
                    
                    // Fallback for any language that fails
                    utterance.onerror = (e) => {
                      console.warn("Speech synthesis failed, trying fallback voice", e);
                      // Try with English voice as fallback
                      const fallbackUtterance = new SpeechSynthesisUtterance(item.word);
                      fallbackUtterance.lang = "en-US";
                      window.speechSynthesis.speak(fallbackUtterance);
                    };
                    
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Listen to pronunciation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordHistory;