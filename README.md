# Reverse Lookup Dictionary with GPT4

Reverse Lookup Dictionary is an interactive application that uses OpenAI's GPT-4 model to perform reverse dictionary lookups. Given a detailed description of a word, it will suggest a matching word from the specified language.

## What it does

The application receives as input a detailed description of a word, along with a specified language. It then uses the GPT-4 model to generate a word in the chosen language that best matches the description.

The output is formatted in Markdown and includes:

- **Word** (Pronunciation) *Part of Speech*
- Definition in the chosen language
- An example sentence using the word in the chosen language
- A brief etymology of the word
- A list of alternatives or synonyms in the chosen language

The response is entirely in the target language and does not include translations to other languages. 

## How to use

The application is designed to be interacted with through a simple user interface where you can input a description and select a language.

You can follow these steps to use the application:

1. Input the description of the word in the text area provided
2. Select the language in which you want to find the word
3. Click on the "Generate" button to get the result
4. The result will be displayed in the output section in a nicely formatted markdown

## Getting Started

The application is built in TypeScript and uses Vercel's KV storage to store the results.

### Prerequisites

- Node.js
- TypeScript
- Vercel account (for KV storage)

### Installation

Clone the repo:
```
git clone https://github.com/parlii/ai-reverse-lookup.git
```
Navigate to the project directory and install dependencies:
```
cd ai-reverse-lookup
npm install
```
Create an `.env` file and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key
```
Start the development server:
```
npm run dev
```
The application is now running on [localhost:3000](http://localhost:3000).

## Tech Stack

The application is built with the following technologies:

- Next.js
- TypeScript
- Vercel KV
- OpenAI API

## Testing

This project uses Jest and React Testing Library for testing. The testing setup includes:

- Unit tests for components
- Integration tests for pages
- Mocking of external dependencies

### Running Tests

To run the tests, use the following commands:

```bash
# Run tests once
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

1. On every pull request and push to the main branch, tests are automatically run
2. Code coverage reports are generated and uploaded to Codecov
3. When tests pass on the main branch, the app is automatically deployed to Vercel

To set up the CI/CD pipeline, you need to add the following secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `CODECOV_TOKEN`: Your Codecov token (optional, for coverage reports)

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the terms of the MIT license.