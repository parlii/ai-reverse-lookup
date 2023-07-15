"use client";

import { Anek_Devanagari, Noto_Serif_Devanagari } from "next/font/google";

import { ReactMarkdown } from "react-markdown/lib/react-markdown";
// import responseFormat from './response_format.md';
import { useCompletion } from "ai/react";
import { useState } from "react";

const anek = Anek_Devanagari({ subsets: ["devanagari", "latin"] });

const noto = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"] });

export default function Completion() {
  const [language, setLanguage] = useState<string>("en");

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

  const response_format = `
Example response:

**आलस्य** (ālasya) *नाम*

निष्क्रियताको अवस्था वा स्थिति, विशेष गतिविहीनता वा कार्यक्षमताहीनता जस्तो कि मानिसहरूले आमतौरमा आत्मीय वा शारीरिक क्षमता वा इच्छा देखाउँदैनन्। 

*मलाई आज आलस्य छ।*

Etymology: यस शब्दको मूल भाषा संस्कृत हो। "आलस्य" भन्नाले संस्कृतमा "अलस्य" अर्थात "अलस्य" भन्ने अर्थ छ, जुन सामान्यतया आलस्य, काम वा कठिनाईलाई जन्म दिने गर्दछ। 

Alternatives: सुस्ती, अकर्मण्यता, निष्क्रियता
`;

  return (
    <div className="flex flex-col items-center h-screen mt-4 overflow-y-auto">
      <h1 className="text-2xl font-bold">Reverse lookup dictionary using AI</h1>
      <div className="p-4 rounded-lg shadow-md m-4 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* // input field for the description of the word */}
          <label htmlFor="input" className="block">
            Enter the description of the word you want to find:
          </label>
          <div className="mt-1 flex flex-col">
            <textarea
              id="input"
              name="input"
              value={input}
              onChange={handleInputChange}
              rows={2}
              required
              className="block flex-grow mb-2 px-2 py-1 border rounded-md resize-none"
            />
          </div>
          <div className="flex flex-row justify-between">
            <div className="mb-2">
              <select
                id="language"
                name="language"
                value={language}
                onChange={handleLanguageChange}
                required
                className="block w-full px-2 py-1 border rounded-md"
              >
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            {isLoading ? (
              <button
                type="button"
                className="px-2 py-1 border rounded-md bg-red-500 text-white hover:bg-red-700 active:bg-red-800"
                onClick={stop}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="px-2 py-1 border rounded-md bg-green-700 text-white hover:bg-green-800 active:bg-green-900"
                disabled={isLoading}
              >
                Find me a word!
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="p-4 rounded-lg shadow-md m-4 w-full max-w-md whitespace-pre-wrap overflow-auto">
        {completion ? (
          <div className={noto.className}>
            <ReactMarkdown children={completion} />
          </div>
        ) : (
          <div className="text-gray-500">
            <ReactMarkdown children={response_format} />
          </div>
        )}
      </div>
    </div>
  );
}
