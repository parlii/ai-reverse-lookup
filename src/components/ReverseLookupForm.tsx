import LanguageSelector from "./LanguageSelector";
import { Noto_Serif_Devanagari } from "next/font/google";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { response_format } from "@/app/constants";
import { useCompletion } from "ai/react";
import { useState } from "react";

const noto = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"] });

const ReverseLookupForm = () => {
  const [language, setLanguage] = useState<string>("English");

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const {
    completion,
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
  });

  return (
    <div className="p-2 rounded-lg shadow-md w-full md:max-w-md text-lg">
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
        <div className="flex flex-row md:flex-row justify-between items-end space-x-2 md:space-x-2 mt-4 md:mt-2">
          <div>
            <LanguageSelector
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
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
              className="px-2 py-1 border rounded-md bg-green-700 text-white hover:bg-green-800 active:bg-green-900 sm:w-auto whitespace-nowrap"
              disabled={isLoading}
            >
              Find me a word!
            </button>
          )}
        </div>
      </form>
      <div className="p-4 rounded-lg shadow-md mt-4 w-full md:max-w-md whitespace-pre-wrap overflow-auto text-xl">
        {completion ? (
          <div className={noto.className}>
            <ReactMarkdown>{completion}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500">
            <ReactMarkdown>{response_format}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReverseLookupForm;
