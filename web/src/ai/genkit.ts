import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Warn if the required API key isn't present so the developer knows why AI calls fail.
if (!process.env.GOOGLE_GENAI_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[genkit] GOOGLE_GENAI_API_KEY is not set. AI flows will fail until you add it to your .env file.');
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
