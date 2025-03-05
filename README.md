# Word Finder

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/parlii/ai-reverse-lookup/ci.yml?branch=main)

## 🔍 What Problem Does This Solve?

Have you ever experienced the frustrating "tip-of-the-tongue" phenomenon? You know exactly what a word means, but you just can't recall it. Word Finder solves this problem by allowing you to describe a word in natural language, and it will find the word you're looking for.

Unlike traditional dictionaries that require you to know the word to find its meaning, this reverse dictionary works the other way around - from meaning to word.

## ✨ Features

- **AI-Powered Word Finding**: Uses OpenAI's GPT-4 to find the perfect word based on your description
- **Multi-Language Support**: Find words in English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Hindi, and more
- **Audio Pronunciation**: Hear the correct pronunciation of found words with a single click
- **Word History**: Keep track of your previously found words for easy reference
- **Suggestion Feature**: Not sure what to look up? Get random word description suggestions
- **Beautiful UI**: Clean, responsive interface with dark mode for comfortable use
- **Markdown Formatting**: Results are beautifully formatted with word, pronunciation, definition, example usage, and etymology

## 🖼️ Screenshots

[Screenshots would be placed here]

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key
- Vercel account (for KV storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/parlii/ai-reverse-lookup.git
   cd ai-reverse-lookup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   REDIS_URL=your_redis_url_or_vercel_kv_url
   ADMIN_PASSWORD=password_for_clearing_history
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## 🧠 How It Works

1. **Enter a description** of the word you're looking for
2. **Select the language** you want the word in
3. **Click "Find"** to generate the result
4. The AI will return:
   - The word with pronunciation
   - Part of speech and definition
   - Example sentence using the word
   - Etymology information
   - Related words or synonyms
5. **Click the sound icon** next to the word to hear its pronunciation
6. Your search is automatically saved to your word history

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: CSS with custom design system
- **State Management**: React Hooks
- **API**: Next.js API Routes
- **AI**: OpenAI GPT-4
- **Storage**: Vercel KV (Redis)
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions, Vercel

## 📊 Testing

This project has comprehensive test coverage:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

1. **Automated Testing**: All tests run on every PR and push to main
2. **Code Quality**: Linting and type checking ensure code quality
3. **Deployment**: Automatic deployment to Vercel when changes are merged to main

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- OpenAI for the GPT-4 API
- Vercel for hosting and KV storage
- The Next.js team for the amazing framework
- All contributors who have helped improve this project