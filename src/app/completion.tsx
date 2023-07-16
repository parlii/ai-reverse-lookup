"use client";

import { Anek_Devanagari, Noto_Serif_Devanagari } from "next/font/google";

import { FaGithub } from "react-icons/fa";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { useCompletion } from "ai/react";
import { useState } from "react";

const anek = Anek_Devanagari({ subsets: ["devanagari", "latin"] });

const noto = Noto_Serif_Devanagari({ subsets: ["devanagari", "latin"] });

export default function Completion() {
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

  const response_format = `
Example response:

**आलस्य** (ālasya) *नाम*

निष्क्रियताको अवस्था वा स्थिति, विशेष गतिविहीनता वा कार्यक्षमताहीनता जस्तो कि मानिसहरूले आमतौरमा आत्मीय वा शारीरिक क्षमता वा इच्छा देखाउँदैनन्। 

*मलाई आज आलस्य छ।*

Etymology: यस शब्दको मूल भाषा संस्कृत हो। "आलस्य" भन्नाले संस्कृतमा "अलस्य" अर्थात "अलस्य" भन्ने अर्थ छ, जुन सामान्यतया आलस्य, काम वा कठिनाईलाई जन्म दिने गर्दछ। 

Alternatives: सुस्ती, अकर्मण्यता, निष्क्रियता
`;

  return (
    <div className="flex flex-col items-center h-screen mt-4 mb-2 overflow-y-auto px-4 md:px-0">
      <div className="flex items-center justify-between justify-center space-x-4">
        <h1 className="text-2xl font-bold text-center mt-6 mb-4">
          AI reverse lookup dictionary
        </h1>
        <a
          href="https://github.com/parlii/ai-reverse-lookup"
        >
          <FaGithub className="inline-block" size={24} />
        </a>
      </div>
      <div className="p-4 rounded-lg shadow-md m-4 w-full md:max-w-md text-lg">
        <form onSubmit={handleSubmit}>
          {/* Textarea for the description of the word */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="input"
              className="block text-sm font-medium text-gray-700"
            >
              Enter the description of the word you want to find:
            </label>
            <textarea
              id="input"
              name="input"
              value={input}
              onChange={handleInputChange}
              rows={2}
              required
              className="block flex-grow px-2 py-1 border rounded-md resize-none"
            />
          </div>
          <div className="flex flex-row md:flex-row justify-between items-end space-x-2 md:space-x-2 mt-4">
            <div className="flex-grow">
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700"
              >
                Language:
              </label>
              <select
                id="language"
                name="language"
                value={language}
                onChange={handleLanguageChange}
                required
                className="mt-1 block w-full px-2 py-1 border rounded-md"
              >
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Chinese">Chinese</option>
                <option value="Arabic">Arabic</option>
                <option value="Hmong">Hmong</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Thai">Thai</option>
              </select>
            </div>
            {isLoading ? (
              <button
                type="button"
                className="mt-4 md:mt-0 px-2 py-1 border rounded-md bg-red-500 text-white hover:bg-red-700 active:bg-red-800"
                onClick={stop}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="mt-4 md:mt-0 px-2 py-1 border rounded-md bg-green-700 text-white hover:bg-green-800 active:bg-green-900"
                disabled={isLoading}
              >
                Find me a word!
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="p-4 rounded-lg shadow-md m-4 w-full md:max-w-md whitespace-pre-wrap overflow-auto text-lg">
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
}
