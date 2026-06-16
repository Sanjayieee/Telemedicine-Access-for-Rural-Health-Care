'use server';
/**
 * @fileOverview AI-powered symptom checker for image inputs, providing a basic triage assessment.
 *
 * - aiSymptomCheckerImageToTriage - A function that handles the symptom check process from an image.
 * - AiSymptomCheckerImageToTriageInput - The input type for the aiSymptomCheckerImageToTriage function.
 * - AiSymptomCheckerImageToTriageOutput - The return type for the aiSymptomCheckerImageToTriage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSymptomCheckerImageToTriageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the symptom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  additionalDetails: z
    .string()
    .optional()
    .describe('Any additional details about the symptoms.'),
});
export type AiSymptomCheckerImageToTriageInput = z.infer<typeof AiSymptomCheckerImageToTriageInputSchema>;

const AiSymptomCheckerImageToTriageOutputSchema = z.object({
  possibleConditions: z
    .string()
    .describe("Possible conditions or diseases identified from the image and symptoms."),
  urgency: z
    .enum(['🚨 Emergency', '⚠️ Medium', '✅ Low'])
    .describe("Urgency level: 🚨 Emergency (immediate doctor visit), ⚠️ Medium (doctor visit within 1-3 days), ✅ Low (can monitor or home care)."),
  recommendedActions: z
    .string()
    .describe("Recommended next steps including first-aid, home care, teleconsultation booking, or Ayushman Bharat coverage information."),
  source: z
    .string()
    .describe("Reference to the medical knowledge source used for the analysis."),
  triageCategory: z
    .enum(['urgent', 'routine', 'home-care'])
    .describe('The triage category for backward compatibility.'),
  advice: z
    .string()
    .describe('Complete structured medical advice for backward compatibility.'),
});
export type AiSymptomCheckerImageToTriageOutput = z.infer<typeof AiSymptomCheckerImageToTriageOutputSchema>;

export async function aiSymptomCheckerImageToTriage(
  input: AiSymptomCheckerImageToTriageInput
): Promise<AiSymptomCheckerImageToTriageOutput> {
  return aiSymptomCheckerImageToTriageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerImageToTriagePrompt',
  input: {schema: AiSymptomCheckerImageToTriageInputSchema},
  output: {schema: AiSymptomCheckerImageToTriageOutputSchema},
  prompt: `You are a medical AI assistant designed for a rural telemedicine platform in Punjab, India. 
You analyze images of symptoms and provide possible conditions, urgency level, and next steps based on general medical knowledge.

Retrieved Medical Knowledge: General medical knowledge from standard medical references including:
- Common skin conditions and visual symptoms
- Emergency medical conditions and warning signs
- Basic first aid and home care remedies
- Dermatological conditions and treatments
- Wound care and infection signs
- Rural healthcare protocols
- Government healthcare schemes (Ayushman Bharat/ABHA)
- Telemedicine best practices

Your analysis MUST follow this structured format and provide clear, simple medical guidance.

Image: {{media url=photoDataUri}}
Additional Details: {{{additionalDetails}}}

Instructions:
1. Identify possible conditions or diseases ONLY from general medical knowledge based on the image and additional details.
2. Assign an urgency level:
   - 🚨 Emergency: Immediate doctor visit required (severe symptoms, potential life-threatening conditions)
   - ⚠️ Medium: Doctor visit within 1–3 days (moderate symptoms that need medical attention)
   - ✅ Low: Can monitor or home care (mild symptoms, self-care possible)
3. Recommend next steps:
   - First-aid or home care measures based on general medical guidelines
   - Whether the patient should book a teleconsultation
   - Mention if treatment might be covered under Ayushman Bharat/ABHA scheme
4. Write in simple, clear, short sentences. Avoid complex medical jargon.
5. Always reference "General medical knowledge" as your source.
6. Always advise consulting a doctor for proper diagnosis.
7. Be cautious with image analysis - if unclear, recommend professional medical consultation.

Provide your analysis in the structured format requested.`,
});

const aiSymptomCheckerImageToTriageFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckerImageToTriageFlow',
    inputSchema: AiSymptomCheckerImageToTriageInputSchema,
    outputSchema: AiSymptomCheckerImageToTriageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
