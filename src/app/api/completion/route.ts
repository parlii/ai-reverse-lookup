// app/api/completion/route.ts

import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
})

const openai = new OpenAIApi(apiConfig)

function buildPrompt(prompt: string, language: string) {

  const system_message = `Using language: ${language}. As a reverse dictionary in the target language, you'll be given descriptors of a single word in English. From these, suggest a single word that closely matches the given descriptors in ${language}. In your response, include the following for that one word, nicely formatted in Markdown:

  **Word** (Pronunciation) *Part of Speech*
  --*new line *--
  Definition in ${language}
  *new line*
  --*blank new line*--
  *Suggest an example sentence in ${language} using the word*
  *empty new line*
  --*blank new line*--
  Etymology: A brief explanation of the word's origin.
  --*blank new line*--
  Alternatives (underline, include "Alternatives" simply the alternatives in ${language}, each alternative in new line)

The entire response should be formatted in Markdown and in the language: ${language}. Do not include any word in any other language. No need to include English translations. Delineate response as appropriate and use appropriate line breaks for better readability.

Please note that the response should be in the target language, if not English. For example, if the target language is Spanish, the response should be in Spanish, not English. The response should also not include any English translations!

For example, a response might look like this for a word in the Nepali language:

**आलस्य** (Pronunciation: ālasya) *नाम*

निष्क्रियताको अवस्था वा स्थिति, विशेष गतिविहीनता वा कार्यक्षमताहीनता जस्तो कि मानिसहरूले आमतौरमा आत्मीय वा शारीरिक क्षमता वा इच्छा देखाउँदैनन्। 

*मलाई आज आलस्य छ।*

व्युत्पत्ति: यस शब्दको मूल भाषा संस्कृत हो। "आलस्य" भन्नाले संस्कृतमा "अलस्य" अर्थात "अलस्य" भन्ने अर्थ छ, जुन सामान्यतया आलस्य, काम वा कठिनाईलाई जन्म दिने गर्दछ। 

_वैकल्पिकहरू_: सुस्ती, अकर्मण्यता, निष्क्रियता
`;


const system_message_english = `Using language: ${language}. As a reverse dictionary in the target language, you'll be given descriptors of a single word in English. From these, suggest a single word that closely matches the given descriptors in ${language}. In your response, include the following for that one word, nicely formatted in Markdown:

**Word** (Pronunciation) *Part of Speech*
--*new line *--
Definition in ${language}
*new line*
--*blank new line*--
*Suggest an example sentence in ${language} using the word*
*empty new line*
--*blank new line*--
Etymology: A brief explanation of the word's origin.
--*blank new line*--
Alternatives (underline, include "Alternatives" simply the alternatives in ${language}, each alternative in new line)

The entire response should be formatted in Markdown and in the language: ${language}. Do not include any word in any other language. Delineate response as appropriate and use appropriate line breaks for better readability.

For example, a response might look like this for a word in the Nepali language:

**Laziness** (Pronunciation: ālasya) *noun*

A state or condition of inactivity or sluggishness, specifically such a lack of energy or vitality that people generally do not exhibit mental or physical ability or desire. 

*I feel lazy today.*

Etymology: The root language of this word is Sanskrit. "आलस्य" means "laziness" in Sanskrit, which generally gives rise to laziness, reluctance, or difficulty. 

Alternatives: Inactivity, Idle, Lethargy
`;

// const system_message = `Language in use: ${language}. As a reverse dictionary for ${language}, you'll be provided with descriptors of a word in English. Your task is to identify a single word in ${language} that aligns closely with these descriptors. 

// In your response, adhere to the following format in Markdown:

//   **Word** (Pronunciation) *Part of Speech*

//   Definition in ${language}

//   *Example sentence in ${language}*

//   Etymology: A brief explanation of the word's origin, possibly tracing it to its root in the parent language.

//   _Alternatives_: List of similar words in ${language} (if any)

// The entire response should be exclusively in ${language}, without any translations to other languages. Be careful to structure your response for optimal readability using appropriate line breaks.`;

const system_message_to_use = (language: string) => {
  if (language === 'English') {
    return system_message_english;
  } else {
    return system_message;
  }
}

  const systemMessage = {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: system_message_to_use(language),
  }

  const userPrompt = {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content: prompt,
  }

  console.log(systemMessage);

  return [systemMessage, userPrompt];
}


export async function POST(req: Request) {
  
  // Extract the `prompt` from the body of the request
  const { prompt, language } = await req.json();

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages: buildPrompt(prompt, language),
    max_tokens: 500,
    temperature: 0.1,
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)

  // Respond with the stream
  return new StreamingTextResponse(stream)
}
