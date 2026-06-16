import { NextRequest, NextResponse } from 'next/server';
import { listPatients } from '@/lib/db';

// Simple string similarity using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  if (norm1 === norm2) return 1.0;
  if (norm1.length === 0 || norm2.length === 0) return 0.0;
  
  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  
  return 1 - (distance / maxLength);
}

interface DuplicateCandidate {
  id: string;
  name: string;
  age: number;
  gender?: string;
  similarity: {
    overall: number;
    name: number;
    demographics: number;
  };
  reasons: string[];
}

interface DuplicatesResponse {
  ok: boolean;
  patientId?: string;
  candidates: DuplicateCandidate[];
  totalChecked: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, name, age, gender } = body;
    
    if (patientId) {
      // Find duplicates for existing patient
      const patients = listPatients();
      const targetPatient = patients.find(p => p.id === patientId);
      
      if (!targetPatient) {
        return NextResponse.json({ ok: false, error: 'Patient not found' }, { status: 404 });
      }
      
      const candidates = findDuplicates(targetPatient, patients.filter(p => p.id !== patientId));
      
      return NextResponse.json({
        ok: true,
        patientId,
        candidates,
        totalChecked: patients.length - 1
      });
    } else if (name && age) {
      // Check for duplicates before creating new patient
      const patients = listPatients();
      const mockPatient = { id: 'temp', name, age: Number(age), gender };
      const candidates = findDuplicates(mockPatient, patients);
      
      return NextResponse.json({
        ok: true,
        candidates,
        totalChecked: patients.length
      });
    } else {
      return NextResponse.json(
        { ok: false, error: 'Either patientId or name+age required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return NextResponse.json(
      { ok: false, error: 'Duplicate detection failed' },
      { status: 500 }
    );
  }
}

function findDuplicates(
  target: { name: string; age: number; gender?: string },
  candidates: { id: string; name: string; age: number; gender?: string }[]
): DuplicateCandidate[] {
  const duplicates: DuplicateCandidate[] = [];
  
  for (const candidate of candidates) {
    const nameSimilarity = calculateSimilarity(target.name, candidate.name);
    const ageDiff = Math.abs(target.age - candidate.age);
    const genderMatch = !target.gender || !candidate.gender || target.gender === candidate.gender;
    
    // Demographic similarity based on age difference and gender match
    let demographicScore = 1.0;
    if (ageDiff > 0) demographicScore -= Math.min(ageDiff * 0.1, 0.8);
    if (!genderMatch) demographicScore -= 0.3;
    demographicScore = Math.max(0, demographicScore);
    
    // Overall similarity (weighted combination)
    const overallSimilarity = (nameSimilarity * 0.7) + (demographicScore * 0.3);
    
    // Only consider as potential duplicate if overall similarity > 0.6
    if (overallSimilarity > 0.6) {
      const reasons = [];
      if (nameSimilarity > 0.8) reasons.push('Very similar name');
      else if (nameSimilarity > 0.6) reasons.push('Similar name');
      
      if (ageDiff === 0) reasons.push('Same age');
      else if (ageDiff <= 2) reasons.push('Similar age');
      
      if (genderMatch && target.gender && candidate.gender) {
        reasons.push('Same gender');
      }
      
      duplicates.push({
        id: candidate.id,
        name: candidate.name,
        age: candidate.age,
        gender: candidate.gender,
        similarity: {
          overall: Math.round(overallSimilarity * 100) / 100,
          name: Math.round(nameSimilarity * 100) / 100,
          demographics: Math.round(demographicScore * 100) / 100
        },
        reasons
      });
    }
  }
  
  // Sort by similarity (highest first)
  return duplicates.sort((a, b) => b.similarity.overall - a.similarity.overall);
}