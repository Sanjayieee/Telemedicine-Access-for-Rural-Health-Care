"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot,
  User,
  Stethoscope,
  Activity,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: number;
  suggestions?: string[];
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

export function ChatBot() {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setMessages([welcomeMessage]);
    }
  }, [isOpen, role]);

  const getWelcomeMessage = (): ChatMessage => {
    const baseActions: QuickAction[] = [
      { label: 'Emergency Help', action: 'emergency', icon: '🚨' },
      { label: 'Find Nearby Clinic', action: 'location', icon: '📍' },
      { label: 'Appointment Booking', action: 'appointment', icon: '📅' },
    ];

    let roleSpecificActions: QuickAction[] = [];
    let welcomeText = "Hello! I'm your healthcare assistant. How can I help you today?";

    switch (role) {
      case 'doctor':
        welcomeText = "Welcome, Doctor! I can help you with patient management, clinical decisions, and administrative tasks.";
        roleSpecificActions = [
          { label: 'High-Risk Patients', action: 'triage', icon: '⚠️' },
          { label: 'Drug Interactions', action: 'drug_check', icon: '💊' },
          { label: 'Clinical Guidelines', action: 'guidelines', icon: '📋' },
        ];
        break;
      case 'health_worker':
        welcomeText = "Hi there, Health Worker! I'm here to assist with patient care and field operations.";
        roleSpecificActions = [
          { label: 'Symptom Assessment', action: 'symptom_check', icon: '🩺' },
          { label: 'Referral Guidelines', action: 'referral', icon: '🔄' },
          { label: 'Health Education', action: 'education', icon: '📚' },
        ];
        break;
      case 'pharmacy':
        welcomeText = "Welcome, Pharmacist! I can help with medication management and inventory.";
        roleSpecificActions = [
          { label: 'Stock Alerts', action: 'stock_check', icon: '📦' },
          { label: 'Drug Information', action: 'drug_info', icon: '💊' },
          { label: 'Dosage Calculator', action: 'dosage', icon: '🧮' },
        ];
        break;
      default:
        roleSpecificActions = [
          { label: 'Symptom Checker', action: 'symptom_check', icon: '🩺' },
          { label: 'Health Tips', action: 'health_tips', icon: '💡' },
          { label: 'Medication Info', action: 'drug_info', icon: '💊' },
        ];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: welcomeText,
      timestamp: Date.now(),
      quickActions: [...baseActions, ...roleSpecificActions]
    };
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: message.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate API call delay
    setTimeout(async () => {
      const botResponse = await getBotResponse(message.trim());
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = async (userMessage: string): Promise<ChatMessage> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          role: role,
          context: {
            previousMessages: messages.slice(-5).map(m => m.message) // Last 5 messages for context
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: Date.now().toString(),
          type: 'bot',
          message: data.response,
          timestamp: Date.now(),
          suggestions: data.suggestions,
          quickActions: data.quickActions
        };
      }
    } catch (error) {
      console.error('Chat API error:', error);
    }

    // Fallback to local responses if API fails
    return getLocalBotResponse(userMessage);
  };

  const getLocalBotResponse = (userMessage: string): ChatMessage => {
    const message = userMessage.toLowerCase();
    
    // Emergency keywords
    if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "🚨 For medical emergencies, please call 108 (ambulance) or visit the nearest hospital immediately. If this is not an emergency, I'm here to help with your healthcare questions.",
        timestamp: Date.now(),
        quickActions: [
          { label: 'Call Emergency (108)', action: 'call_108', icon: '📞' },
          { label: 'Find Nearest Hospital', action: 'nearest_hospital', icon: '🏥' },
          { label: 'Continue Chat', action: 'continue', icon: '💬' }
        ]
      };
    }

    // Role-specific responses
    if (role === 'doctor') {
      return getDoctorResponse(message);
    } else if (role === 'health_worker') {
      return getHealthWorkerResponse(message);
    } else if (role === 'pharmacy') {
      return getPharmacyResponse(message);
    }

    // General patient responses
    return getPatientResponse(message);
  };

  const getDoctorResponse = (message: string): ChatMessage => {
    if (message.includes('triage') || message.includes('high risk')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "Here are your high-risk patients that need attention. The triage panel shows patients sorted by ML risk scores. Would you like me to show specific risk factors?",
        timestamp: Date.now(),
        suggestions: [
          "Show patients with diabetes complications",
          "List elderly patients with multiple conditions",
          "Show recent high-risk admissions"
        ]
      };
    }

    if (message.includes('drug') || message.includes('medication') || message.includes('prescription')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "I can help with drug interactions, dosing guidelines, and prescription management. What specific medication information do you need?",
        timestamp: Date.now(),
        suggestions: [
          "Check drug interactions for multiple medications",
          "Dosing guidelines for elderly patients",
          "Common side effects and contraindications"
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: "As a doctor, I can assist you with clinical decision support, patient management, drug information, and administrative tasks. What would you like to know?",
      timestamp: Date.now(),
      suggestions: [
        "Show me today's high-risk patients",
        "Drug interaction checker",
        "Clinical practice guidelines"
      ]
    };
  };

  const getHealthWorkerResponse = (message: string): ChatMessage => {
    if (message.includes('symptom') || message.includes('check')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "I can help assess symptoms and provide referral guidance. Please describe the patient's main symptoms, age, and any known medical history.",
        timestamp: Date.now(),
        suggestions: [
          "Patient has fever and cough",
          "Elderly patient with chest pain",
          "Child with stomach pain and vomiting"
        ]
      };
    }

    if (message.includes('referral') || message.includes('refer')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "Here are the referral guidelines based on symptom severity. Red flags that require immediate referral include severe pain, difficulty breathing, or altered consciousness.",
        timestamp: Date.now(),
        quickActions: [
          { label: 'Emergency Referral Criteria', action: 'emergency_referral', icon: '🚨' },
          { label: 'Routine Referral Process', action: 'routine_referral', icon: '📋' },
          { label: 'Specialist Referrals', action: 'specialist', icon: '👨‍⚕️' }
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: "As a health worker, I can help with symptom assessment, referral decisions, health education, and field protocols. What do you need assistance with?",
      timestamp: Date.now(),
      suggestions: [
        "Assess patient symptoms",
        "Referral guidelines",
        "Health education materials"
      ]
    };
  };

  const getPharmacyResponse = (message: string): ChatMessage => {
    if (message.includes('stock') || message.includes('inventory')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "Current stock alerts show critical levels for ORS packets (8 remaining) and Adrenaline (5 remaining). Would you like to see the full stock forecast?",
        timestamp: Date.now(),
        quickActions: [
          { label: 'View Stock Forecast', action: 'stock_forecast', icon: '📊' },
          { label: 'Critical Stock Items', action: 'critical_stock', icon: '⚠️' },
          { label: 'Reorder Recommendations', action: 'reorder', icon: '📝' }
        ]
      };
    }

    if (message.includes('drug') || message.includes('medication') || message.includes('dosage')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "I can provide drug information, dosage calculations, and interaction checks. Which medication do you need information about?",
        timestamp: Date.now(),
        suggestions: [
          "Paracetamol dosing for children",
          "Metformin drug interactions",
          "Amoxicillin allergy alternatives"
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: "As a pharmacist, I can help with medication information, stock management, dosage calculations, and drug interactions. How can I assist you?",
      timestamp: Date.now(),
      suggestions: [
        "Check current stock levels",
        "Drug information lookup",
        "Dosage calculator"
      ]
    };
  };

  const getPatientResponse = (message: string): ChatMessage => {
    if (message.includes('symptom') || message.includes('sick') || message.includes('pain')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "I can help assess your symptoms, but remember this doesn't replace professional medical advice. Please describe your symptoms, how long you've had them, and your age.",
        timestamp: Date.now(),
        suggestions: [
          "I have fever and headache for 2 days",
          "Stomach pain after eating",
          "Difficulty breathing and chest tightness"
        ]
      };
    }

    if (message.includes('appointment') || message.includes('booking') || message.includes('doctor')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "I can help you find nearby healthcare facilities and guide you through the appointment process. What type of care do you need?",
        timestamp: Date.now(),
        quickActions: [
          { label: 'Find Nearby Clinic', action: 'find_clinic', icon: '🏥' },
          { label: 'Emergency Services', action: 'emergency', icon: '🚨' },
          { label: 'Specialist Referral', action: 'specialist', icon: '👨‍⚕️' }
        ]
      };
    }

    if (message.includes('medication') || message.includes('medicine') || message.includes('drug')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        message: "I can provide general information about medications, but always consult your doctor or pharmacist for specific medical advice. Which medication do you want to know about?",
        timestamp: Date.now(),
        suggestions: [
          "How to take Paracetamol safely",
          "Side effects of common antibiotics",
          "When to take blood pressure medication"
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: "I'm here to help with your healthcare questions, symptom guidance, appointment booking, and general health information. What would you like to know?",
      timestamp: Date.now(),
      suggestions: [
        "Check my symptoms",
        "Find a nearby doctor",
        "Learn about medications",
        "Health tips and prevention"
      ]
    };
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'emergency':
        sendMessage("I need emergency help");
        break;
      case 'symptom_check':
        sendMessage("I want to check my symptoms");
        break;
      case 'appointment':
        sendMessage("I need to book an appointment");
        break;
      case 'triage':
        sendMessage("Show me high-risk patients");
        break;
      case 'stock_check':
        sendMessage("Check current stock levels");
        break;
      case 'drug_info':
        sendMessage("I need drug information");
        break;
      default:
        sendMessage(action);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'}`}>
      <Card className="w-full h-full flex flex-col shadow-xl overflow-hidden">
        <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <CardTitle className="text-sm">Healthcare Assistant</CardTitle>
                <p className="text-xs opacity-90">
                  {role === 'doctor' ? 'Clinical Support' : 
                   role === 'health_worker' ? 'Field Support' :
                   role === 'pharmacy' ? 'Pharmacy Support' : 'Patient Care'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-[350px] w-full">
                <div className="space-y-3 p-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg p-2 text-sm`}>
                        <div className="flex items-start gap-2">
                          {msg.type === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          {msg.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            
                            {msg.suggestions && (
                              <div className="mt-2 space-y-1">
                                {msg.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => sendMessage(suggestion)}
                                    className="block w-full text-left p-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {msg.quickActions && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {msg.quickActions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuickAction(action.action)}
                                    className="h-6 px-2 text-xs bg-white/10 hover:bg-white/20 border border-white/20"
                                  >
                                    {action.icon} {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Type your message..."
                  className="flex-1 text-sm"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => sendMessage(input)}
                  size="sm"
                  disabled={!input.trim() || isTyping}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                AI Assistant • Not a replacement for professional medical advice
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}