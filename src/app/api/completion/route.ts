import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});

const openai = new OpenAIApi(apiConfig);

function buildPrompt(prompt: string, language: string) {
  const system_message = `Using language: ${language}. As a reverse dictionary in the target language, you'll be given descriptors of a single word. From these, suggest a single word that closely matches the given descriptors in ${language}. In your response, include the following for that one word, nicely formatted in Markdown:

  **Single Word** (Pronunciation) *Part of Speech*
  --*new line *--
  Definition in ${language}
  *new line*
  --*blank new line*--
  *Suggest an example sentence in ${language} using the word*
  *empty new line*
  --*blank new line*--
  Etymology: A brief explanation of the word's origin.
  --*blank new line*--
  Alternatives (underline, include "Alternatives" simply the alternatives in ${language}, each alternative in a single line separated by a comma)

The entire response should be formatted in Markdown and in the language: ${language}. Do not include any word in any other language. Delineate response as appropriate and use line breaks for better readability.

${language !== "English"
      ? `Please note that the response should be in the target language ${language}, not English. For example, if the target language is Spanish, the response should be in Spanish, not English. The response should also not include any English translations!`
      : ""
    }

For example, a response might look like this for a word in the Nepali language:

**आलस्य** (ālasya) *नाम*

निष्क्रियताको अवस्था वा स्थिति, विशेष गतिविहीनता वा कार्यक्षमताहीनता जस्तो कि मानिसहरूले आमतौरमा आत्मीय वा शारीरिक क्षमता वा इच्छा देखाउँदैनन्। 

*मलाई आज आलस्य छ।*

व्युत्पत्ति: यस शब्दको मूल भाषा संस्कृत हो। "आलस्य" भन्नाले संस्कृतमा "अलस्य" अर्थात "अलस्य" भन्ने अर्थ छ, जुन सामान्यतया आलस्य, काम वा कठिनाईलाई जन्म दिने गर्दछ। 

_वैकल्पिकहरू_: सुस्ती, अकर्मण्यता, निष्क्रियता
`;

  const systemMessage = {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: system_message,
  };

  const userPrompt = {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: prompt,
  };

  return [systemMessage, userPrompt];
}

async function parseRequest(req: Request) {
  const { prompt, language } = await req.json();
  return { prompt, language };
}

function generateKey(prompt: string) {
  return JSON.stringify(prompt);
}

async function requestOpenAI(messages: any) {
  const response = await openai.createChatCompletion({
    model: "gpt-4o-mini",
    stream: true,
    messages: messages,
    max_tokens: 1000,
    temperature: 0.1,
  });
  return response;
}

function handleOpenAIResponse(response: any, key: string) {
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}

export async function POST(req: Request) {
  const { prompt, language } = await parseRequest(req);
  const key = generateKey(prompt);
  const messages = buildPrompt(prompt, language);
  const response = await requestOpenAI(messages);
  return handleOpenAIResponse(response, key);
}
