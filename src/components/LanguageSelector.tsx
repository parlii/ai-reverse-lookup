import React, { FC } from "react";

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LanguageSelector: FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
}) => (
  <select
    id="language"
    name="language"
    value={language}
    onChange={onLanguageChange}
    required
    className="block w-full px-3 py-2 text-sm rounded-md border dark:bg-gray-700 dark:text-white"
    placeholder="Select a language"
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
);

export default LanguageSelector;
