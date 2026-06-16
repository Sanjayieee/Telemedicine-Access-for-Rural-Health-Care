import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  role: string;
  context?: {
    patientId?: string;
    previousMessages?: string[];
  };
}

interface ChatResponse {
  response: string;
  suggestions?: string[];
  quickActions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
  followUp?: string[];
}

// Medical knowledge base for more accurate responses
const MEDICAL_KEYWORDS = {
  symptoms: {
    fever: ['temperature', 'hot', 'chills', 'sweating'],
    pain: ['ache', 'hurt', 'sore', 'painful', 'discomfort'],
    breathing: ['breathe', 'breath', 'cough', 'wheeze', 'chest'],
    digestive: ['stomach', 'nausea', 'vomit', 'diarrhea', 'constipation'],
    neurological: ['headache', 'dizzy', 'confusion', 'seizure', 'weakness'],
  },
  urgency: {
    emergency: ['chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious', 'seizure', 'stroke'],
    urgent: ['high fever', 'severe pain', 'persistent vomiting', 'dehydration'],
    routine: ['mild pain', 'common cold', 'minor cuts', 'preventive care']
  }
};

function analyzeSymptoms(message: string): { urgency: 'emergency' | 'urgent' | 'routine', symptoms: string[] } {
  const lowerMessage = message.toLowerCase();
  const foundSymptoms: string[] = [];
  let urgency: 'emergency' | 'urgent' | 'routine' = 'routine';

  // Check for emergency keywords
  for (const emergencyTerm of MEDICAL_KEYWORDS.urgency.emergency) {
    if (lowerMessage.includes(emergencyTerm)) {
      urgency = 'emergency';
      foundSymptoms.push(emergencyTerm);
    }
  }

  // Check for urgent keywords
  if (urgency === 'routine') {
    for (const urgentTerm of MEDICAL_KEYWORDS.urgency.urgent) {
      if (lowerMessage.includes(urgentTerm)) {
        urgency = 'urgent';
        foundSymptoms.push(urgentTerm);
      }
    }
  }

  // Extract general symptoms
  Object.entries(MEDICAL_KEYWORDS.symptoms).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        foundSymptoms.push(keyword);
      }
    });
  });

  return { urgency, symptoms: foundSymptoms };
}

function generateDoctorResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('high risk') || lowerMessage.includes('triage')) {
    return {
      response: "Based on current data, here are your priority patients:\n\n• Elderly patients with diabetes complications\n• Patients with recent cardiac events\n• Those with multiple chronic conditions\n\nThe ML triage system has identified 5 high-risk patients requiring immediate attention. Would you like detailed risk analysis?",
      suggestions: [
        "Show detailed risk factors",
        "Export triage list for rounds",
        "Set up patient monitoring alerts"
      ],
      quickActions: [
        { label: 'View Triage Panel', action: 'open_triage', icon: '⚠️' },
        { label: 'Risk Assessment Details', action: 'risk_details', icon: '📊' }
      ]
    };
  }

  if (lowerMessage.includes('drug') || lowerMessage.includes('medication') || lowerMessage.includes('prescription')) {
    return {
      response: "I can help with:\n\n• Drug interaction checking\n• Dosage calculations for special populations\n• Alternative medications for allergies\n• Clinical guidelines and protocols\n\nWhat specific medication information do you need?",
      suggestions: [
        "Check interactions for multiple drugs",
        "Pediatric dosing guidelines",
        "Geriatric medication adjustments"
      ]
    };
  }

  if (lowerMessage.includes('guideline') || lowerMessage.includes('protocol')) {
    return {
      response: "Clinical guidelines available:\n\n• Emergency care protocols\n• Chronic disease management\n• Preventive care recommendations\n• Referral criteria\n\nWhich clinical area do you need guidance on?",
      suggestions: [
        "Hypertension management",
        "Diabetes care protocol",
        "Emergency assessment"
      ]
    };
  }

  return {
    response: "I'm here to support your clinical decisions. I can help with patient triage, drug information, clinical guidelines, and administrative tasks. What do you need assistance with?",
    suggestions: [
      "Show today's high-risk patients",
      "Check drug interactions",
      "Access clinical protocols"
    ]
  };
}

function generateHealthWorkerResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('symptom') || lowerMessage.includes('assess')) {
    const analysis = analyzeSymptoms(message);
    
    if (analysis.urgency === 'emergency') {
      return {
        response: "🚨 URGENT: The symptoms you described suggest an emergency situation. Please:\n\n1. Call 108 immediately\n2. Prepare for immediate transport to hospital\n3. Monitor vital signs closely\n4. Ensure airway is clear\n\nDo NOT delay seeking emergency care.",
        quickActions: [
          { label: 'Call 108 Now', action: 'call_emergency', icon: '📞' },
          { label: 'Emergency Protocols', action: 'emergency_guide', icon: '📋' }
        ]
      };
    }

    if (analysis.urgency === 'urgent') {
      return {
        response: "This requires prompt medical attention. Based on the symptoms:\n\n• Arrange referral to nearest health facility\n• Monitor vital signs\n• Provide supportive care\n• Document symptoms and timeline\n\nWould you like specific referral guidance?",
        suggestions: [
          "Referral letter template",
          "Transport arrangements",
          "Interim care instructions"
        ]
      };
    }

    return {
      response: "Based on the symptoms described, this appears to be routine care. You can:\n\n• Provide basic treatment\n• Health education\n• Schedule follow-up\n• Monitor for changes\n\nWould you like specific care instructions?",
      suggestions: [
        "Basic treatment guidelines",
        "Health education materials",
        "Follow-up protocols"
      ]
    };
  }

  if (lowerMessage.includes('referral')) {
    return {
      response: "Referral Guidelines:\n\n🔴 IMMEDIATE REFERRAL:\n• Chest pain, difficulty breathing\n• Severe bleeding, trauma\n• Altered consciousness\n• High fever in children\n\n🟡 URGENT REFERRAL (24-48h):\n• Persistent symptoms\n• Worsening condition\n• Failed treatment response\n\n🟢 ROUTINE REFERRAL:\n• Specialist consultation\n• Non-urgent procedures",
      quickActions: [
        { label: 'Referral Form', action: 'referral_form', icon: '📝' },
        { label: 'Transport Help', action: 'transport', icon: '🚗' }
      ]
    };
  }

  return {
    response: "I can assist with symptom assessment, referral decisions, health education, and field protocols. What patient situation are you dealing with?",
    suggestions: [
      "Assess patient symptoms",
      "Referral guidelines",
      "Health education topics"
    ]
  };
}

function generatePharmacyResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
    return {
      response: "Current Stock Status:\n\n🔴 CRITICAL:\n• ORS Packets: 8 remaining\n• Adrenaline: 5 remaining\n\n🟡 LOW STOCK:\n• Paracetamol 650mg: 15 remaining\n• Metformin 500mg: 35 remaining\n\n✅ ADEQUATE:\n• Aspirin, Vitamins, Iron tablets\n\nReorder recommendations available in stock forecast.",
      quickActions: [
        { label: 'Full Stock Report', action: 'stock_report', icon: '📊' },
        { label: 'Reorder List', action: 'reorder_list', icon: '📝' },
        { label: 'Usage Forecast', action: 'forecast', icon: '📈' }
      ]
    };
  }

  if (lowerMessage.includes('dosage') || lowerMessage.includes('dose')) {
    return {
      response: "Dosage Calculator available for:\n\n• Pediatric weight-based dosing\n• Geriatric dose adjustments\n• Renal/hepatic impairment\n• Drug concentration calculations\n\nWhich medication and patient population?",
      suggestions: [
        "Paracetamol pediatric dosing",
        "Antibiotic dose adjustment",
        "Insulin calculation"
      ]
    };
  }

  if (lowerMessage.includes('interaction') || lowerMessage.includes('drug')) {
    return {
      response: "Drug interaction checking:\n\n• Major contraindications\n• Moderate interactions requiring monitoring\n• Minor interactions with precautions\n• Food and supplement interactions\n\nEnter the medications to check for interactions.",
      suggestions: [
        "Common hypertension drug combinations",
        "Diabetes medication interactions",
        "Antibiotic interactions"
      ]
    };
  }

  return {
    response: "I can help with medication management, stock control, dosage calculations, and drug interactions. What pharmacy task do you need assistance with?",
    suggestions: [
      "Check current stock levels",
      "Calculate medication dosage",
      "Review drug interactions"
    ]
  };
}

function generatePatientResponse(message: string): ChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('symptom') || lowerMessage.includes('sick') || lowerMessage.includes('pain')) {
    const analysis = analyzeSymptoms(message);
    
    if (analysis.urgency === 'emergency') {
      return {
        response: "🚨 MEDICAL EMERGENCY\n\nYour symptoms suggest you need immediate medical attention. Please:\n\n1. Call 108 (ambulance) NOW\n2. Go to the nearest hospital immediately\n3. If possible, have someone come with you\n\nDo NOT wait or try home remedies for these symptoms.",
        quickActions: [
          { label: 'Call 108 Emergency', action: 'call_108', icon: '📞' },
          { label: 'Find Nearest Hospital', action: 'hospital_locator', icon: '🏥' }
        ]
      };
    }

    if (analysis.urgency === 'urgent') {
      return {
        response: "Your symptoms need medical attention within 24 hours. Please:\n\n• Visit a doctor or clinic today\n• Monitor your symptoms closely\n• Seek immediate help if symptoms worsen\n• Stay hydrated and rest\n\nWould you like help finding nearby healthcare?",
        quickActions: [
          { label: 'Find Nearby Clinic', action: 'clinic_locator', icon: '🏥' },
          { label: 'Symptom Monitoring Guide', action: 'monitoring', icon: '📋' }
        ]
      };
    }

    return {
      response: "Based on your symptoms, you might consider:\n\n• Rest and home care\n• Over-the-counter medications if appropriate\n• Monitor symptoms for changes\n• See a doctor if symptoms persist or worsen\n\n⚠️ This is not medical advice. Consult a healthcare professional for proper diagnosis and treatment.",
      suggestions: [
        "Home care recommendations",
        "When to see a doctor",
        "Symptom monitoring tips"
      ]
    };
  }

  if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor') || lowerMessage.includes('clinic')) {
    return {
      response: "I can help you find healthcare services:\n\n🏥 Primary Health Centers\n👨‍⚕️ Specialist Doctors\n🚑 Emergency Services\n💊 Pharmacies\n\nWhat type of healthcare service do you need?",
      quickActions: [
        { label: 'Find Nearby Clinic', action: 'clinic_search', icon: '🏥' },
        { label: 'Emergency Services', action: 'emergency_info', icon: '🚨' },
        { label: 'Specialist Referral', action: 'specialist_search', icon: '👨‍⚕️' }
      ]
    };
  }

  if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
    return {
      response: "Medication Information:\n\n• How to take medications safely\n• Common side effects to watch for\n• Drug interactions and precautions\n• Storage and handling\n\n⚠️ Always follow your doctor's or pharmacist's instructions. Never stop or change medications without consulting them first.",
      suggestions: [
        "Safe medication practices",
        "Understanding prescription labels",
        "When to contact your doctor"
      ]
    };
  }

  if (lowerMessage.includes('prevent') || lowerMessage.includes('health tips')) {
    return {
      response: "Health Prevention Tips:\n\n💧 Stay hydrated - drink clean water\n🥗 Eat balanced meals with fruits & vegetables\n🚶‍♀️ Regular physical activity\n😴 Adequate sleep (7-8 hours)\n🧼 Practice good hygiene\n💉 Keep vaccinations up to date\n🚭 Avoid tobacco and limit alcohol",
      suggestions: [
        "Nutrition guidelines",
        "Exercise recommendations",
        "Preventive health screenings"
      ]
    };
  }

  return {
    response: "I'm here to help with your health questions! I can assist with:\n\n• Symptom assessment and guidance\n• Finding nearby healthcare services\n• General health information\n• Medication questions\n• Prevention and wellness tips\n\nWhat would you like to know?",
    suggestions: [
      "Check my symptoms",
      "Find a doctor near me",
      "Learn about prevention",
      "Medication questions"
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message, role, context }: ChatRequest = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let response: ChatResponse;

    switch (role) {
      case 'doctor':
        response = generateDoctorResponse(message);
        break;
      case 'health_worker':
        response = generateHealthWorkerResponse(message);
        break;
      case 'pharmacy':
        response = generatePharmacyResponse(message);
        break;
      default:
        response = generatePatientResponse(message);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { 
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support if the problem persists.",
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}