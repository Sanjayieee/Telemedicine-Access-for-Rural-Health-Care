'use server';

/**
 * @fileOverview A medical AI assistant for rural telemedicine platform that analyzes patient symptoms
 * and provides structured medical analysis with urgency levels and next steps.
 *
 * - triageSymptomText - A function that handles the medical symptom analysis from text input.
 * - TriageSymptomTextInput - The input type for the triageSymptomText function.
 * - TriageSymptomTextOutput - The return type for the triageSymptomText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TriageSymptomTextInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A description of the patient\'s symptoms, including onset, duration, and severity.'),
});
export type TriageSymptomTextInput = z.infer<typeof TriageSymptomTextInputSchema>;

const TriageSymptomTextOutputSchema = z.object({
  possibleConditions: z
    .string()
    .describe("Possible conditions or diseases identified from the symptoms."),
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
    .describe("The recommended triage category for backward compatibility."),
  advice: z
    .string()
    .describe("Complete structured medical advice for backward compatibility."),
});
export type TriageSymptomTextOutput = z.infer<typeof TriageSymptomTextOutputSchema>;

export async function triageSymptomText(input: TriageSymptomTextInput): Promise<TriageSymptomTextOutput> {
  return triageSymptomTextFlow(input);
}

const triageSymptomTextPrompt = ai.definePrompt({
  name: 'triageSymptomTextPrompt',
  input: {schema: TriageSymptomTextInputSchema},
  output: {schema: TriageSymptomTextOutputSchema},
  prompt: `You are a medical AI assistant designed for a rural telemedicine platform in Punjab, India. 
You analyze patient symptoms and provide possible conditions, urgency level, and next steps based on general medical knowledge.

Retrieved Medical Knowledge: General medical knowledge from standard medical references including:
- Common diseases and their symptoms
- Emergency medical conditions and warning signs
- Basic first aid and home care remedies
- Preventive healthcare measures
- Rural healthcare protocols
- Government healthcare schemes (Ayushman Bharat/ABHA)
- Telemedicine best practices

Your analysis MUST follow this structured format and provide clear, simple medical guidance.

Patient Symptoms: {{{symptoms}}}

Instructions:
1. Identify possible conditions or diseases ONLY from general medical knowledge.
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

Provide your analysis in the structured format requested.`,
});

const triageSymptomTextFlow = ai.defineFlow(
  {
    name: 'triageSymptomTextFlow',
    inputSchema: TriageSymptomTextInputSchema,
    outputSchema: TriageSymptomTextOutputSchema,
  },
  async input => {
    const {output} = await triageSymptomTextPrompt(input);
    return output!;
  }
);
