// Heuristic risk scoring (Phase 1) - replace with trained model later.
// Decision support only – NOT a diagnosis.

export interface RiskInput {
  age: number;
  symptoms: string[]; // normalized tokens
  hasChronic: boolean;
  vitals?: {
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    spo2?: number;
    tempC?: number;
  };
  followUpDays?: number; // days since last follow up / visit
}

export interface RiskScore {
  score: number;           // 0-100
  level: 'low' | 'moderate' | 'high';
  factors: string[];
  model_version: string;
  disclaimer: string;
}

const MODEL_VERSION = 'heuristic_v1';

export function computeRisk(input: RiskInput): RiskScore {
  let score = 0;
  const factors: string[] = [];

  if (input.age >= 65) { score += 20; factors.push('age_65_plus'); }
  if (input.hasChronic) { score += 15; factors.push('chronic_condition'); }
  if (input.followUpDays && input.followUpDays > 60) { score += 15; factors.push('followup_gap'); }

  const s = new Set(input.symptoms.map(x => x.toLowerCase().trim()).filter(Boolean));
  const critical = ['chest_pain','shortness_of_breath','unconscious','severe_bleeding'];
  critical.forEach(c => { if (s.has(c)) { score += 35; factors.push(`symptom_${c}`); } });

  if (input.vitals?.spo2 !== undefined && input.vitals.spo2 < 93) { score += 25; factors.push('low_spo2'); }
  if (input.vitals?.systolic !== undefined && input.vitals.systolic > 170) { score += 15; factors.push('high_bp'); }
  if (input.vitals?.tempC !== undefined && input.vitals.tempC > 39) { score += 10; factors.push('high_fever'); }

  if (score > 100) score = 100;
  let level: RiskScore['level'] = 'low';
  if (score >= 70) level = 'high'; else if (score >= 40) level = 'moderate';

  return {
    score,
    level,
    factors,
    model_version: MODEL_VERSION,
    disclaimer: 'Decision support only – not a medical diagnosis.'
  };
}

// Naive symptom extraction from free-text clinical note.
export function extractSymptomsFromNote(note: string): string[] {
  if (!note) return [];
  const vocab = ['cough','fever','chest pain','shortness of breath','dizziness','fatigue','vomiting','diarrhea','bleeding'];
  const lowered = note.toLowerCase();
  const found: string[] = [];
  for (const term of vocab) {
    if (lowered.includes(term)) {
      found.push(term.replace(/\s+/g,'_'));
    }
  }
  return found;
}
