import { useEffect, useState } from 'react';
import { WordHistoryItem } from '@/lib/kv';

interface WordHistoryProps {
  refreshTrigger?: boolean;
  onSelectWord: (description: string, language: string, completion?: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

const WordHistory: React.FC<WordHistoryProps> = ({ refreshTrigger, onSelectWord, isModal = false, onClose }) => {
  const [history, setHistory] = useState<WordHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
        setIsInitialLoad(false);
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

  // Handle word selection and close modal if in modal mode
  const handleSelectWord = (description: string, language: string, completion?: string) => {
    onSelectWord(description, language, completion);
    if (isModal && onClose) {
      onClose();
    }
  };

  const containerClasses = isModal
    ? "fixed inset-0 z-50 flex items-start justify-center bg-navy bg-opacity-80 pt-4 px-4 overflow-y-auto"
    : "w-full max-w-md";

  const contentClasses = isModal
    ? "w-full max-w-md flex flex-col rounded-lg shadow-xl"
    : "w-full";

  // Placeholder content for consistent width during loading
  const placeholderContent = (
    <div className="py-16">
      <div className="h-12 bg-dark bg-opacity-50 rounded-lg mb-3 animate-pulse"></div>
      <div className="h-12 bg-dark bg-opacity-50 rounded-lg mb-3 animate-pulse"></div>
      <div className="h-12 bg-dark bg-opacity-50 rounded-lg animate-pulse"></div>
    </div>
  );

  // Keep the previous history while loading new items to prevent flickering
  const displayHistory = loading && !isInitialLoad ? history : history;

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="bg-dark rounded-t-lg p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-accent font-chillax tracking-wide uppercase">HISTORY</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-opacity-90 transition-all shadow-sm font-chillax font-semibold"
              disabled={history.length === 0}
            >
              Clear
            </button>
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-medium text-white hover:bg-opacity-90 transition-all shadow-sm font-chillax font-semibold"
              >
                Close
              </button>
            )}
          </div>
        </div>
        <div className="bg-medium p-5 rounded-b-lg shadow-md max-h-[500px] overflow-y-auto">
          {loading && isInitialLoad ? (
            <div>
              {placeholderContent}
            </div>
          ) : error ? (
            <div className="text-center py-4 text-white font-satoshi">{error}</div>
          ) : displayHistory.length === 0 ? (
            <p className="text-center text-white font-satoshi">No history yet</p>
          ) : (
            <ul className="space-y-2">
              {displayHistory.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelectWord(item.description, item.language, item.completion)}
                    className="w-full text-left p-3 rounded-lg bg-dark text-white hover:bg-opacity-80 transition-all font-satoshi"
                  >
                    <div className="font-chillax font-semibold">{item.word}</div>
                    <div className="text-sm text-white/80 truncate">{item.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordHistory;