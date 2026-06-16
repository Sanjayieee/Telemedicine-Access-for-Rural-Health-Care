
"use server";

import {
  aiSymptomCheckerImageToTriage,
  AiSymptomCheckerImageToTriageInput,
} from "@/ai/flows/ai-symptom-checker-image-triage";
import {
  triageSymptomText,
  TriageSymptomTextInput,
} from "@/ai/flows/ai-symptom-checker-text-triage";
import {
  translateText as translateTextFlow,
  TranslateTextInput,
} from "@/ai/flows/realtime-translation";
import { 
  textToSpeech as textToSpeechFlow, 
  TextToSpeechOutput 
} from "@/ai/flows/text-to-speech";

export async function checkSymptomsText(input: TriageSymptomTextInput) {
  try {
    const result = await triageSymptomText(input);
    return result;
  } catch (error) {
    console.error("Error in checkSymptomsText:", error);
    throw new Error("Failed to get triage from text.");
  }
}

export async function checkSymptomsImage(
  input: AiSymptomCheckerImageToTriageInput
) {
  try {
    const result = await aiSymptomCheckerImageToTriage(input);
    return result;
  } catch (error) {
    console.error("Error in checkSymptomsImage:", error);
    throw new Error("Failed to get triage from image.");
  }
}

export async function translateText(input: TranslateTextInput) {
  try {
    const result = await translateTextFlow(input);
    return result;
  } catch (error) {
    console.error("Error in translateText:", error);
    throw new Error("Failed to translate text.");
  }
}

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
    try {
        const result = await textToSpeechFlow(text);
        return result;
    } catch (error) {
        console.error("Error in textToSpeech:", error);
        throw new Error("Failed to convert text to speech.");
    }
}
