import React, { FC } from "react";

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LanguageSelector = ({
  language,
  onLanguageChange,
}: {
  language: string;
  onLanguageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
  return (
    <div className="flex items-center">
      <select
        id="language"
        name="language"
        value={language}
        onChange={onLanguageChange}
        className="block w-full px-3 py-2 text-white bg-navy border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-shadow font-chillax font-semibold"
      >
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
        <option value="German">German</option>
        <option value="Italian">Italian</option>
        <option value="Portuguese">Portuguese</option>
        <option value="Japanese">Japanese</option>
        <option value="Korean">Korean</option>
        <option value="Chinese">Chinese</option>
        <option value="Hindi">Hindi</option>
        <option value="Russian">Russian</option>
        <option value="Nepali">Nepali</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
