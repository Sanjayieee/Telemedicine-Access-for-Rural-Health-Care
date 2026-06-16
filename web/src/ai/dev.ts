
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-symptom-checker-image-triage.ts';
import '@/ai/flows/ai-symptom-checker-text-triage.ts';
import '@/ai/flows/realtime-translation.ts';
import '@/ai/flows/text-to-speech.ts';
