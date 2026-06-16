import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle,
  Bot,
  Stethoscope,
  User,
  Activity,
  HelpCircle
} from 'lucide-react';

export default function ChatDemoPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">AI Healthcare Chatbot</h1>
        <p className="text-muted-foreground text-lg">
          Intelligent assistance for patients, doctors, health workers, and pharmacists
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Patients
            </CardTitle>
            <CardDescription>General healthcare guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">Symptom Assessment</Badge>
              <Badge variant="secondary" className="text-xs">Emergency Detection</Badge>
              <Badge variant="secondary" className="text-xs">Healthcare Finder</Badge>
              <Badge variant="secondary" className="text-xs">Health Education</Badge>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Try asking:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"I have fever and headache"</li>
                <li>"Find a doctor near me"</li>
                <li>"Is this an emergency?"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5" />
              Doctors
            </CardTitle>
            <CardDescription>Clinical decision support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">Patient Triage</Badge>
              <Badge variant="secondary" className="text-xs">Drug Interactions</Badge>
              <Badge variant="secondary" className="text-xs">Clinical Guidelines</Badge>
              <Badge variant="secondary" className="text-xs">Risk Assessment</Badge>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Try asking:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Show high-risk patients"</li>
                <li>"Check drug interactions"</li>
                <li>"Hypertension protocols"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              Health Workers
            </CardTitle>
            <CardDescription>Field care assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">Symptom Assessment</Badge>
              <Badge variant="secondary" className="text-xs">Referral Guidelines</Badge>
              <Badge variant="secondary" className="text-xs">Emergency Protocols</Badge>
              <Badge variant="secondary" className="text-xs">Health Education</Badge>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Try asking:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Patient has chest pain"</li>
                <li>"When to refer urgently?"</li>
                <li>"Emergency assessment"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5" />
              Pharmacists
            </CardTitle>
            <CardDescription>Medication management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">Stock Management</Badge>
              <Badge variant="secondary" className="text-xs">Dosage Calculator</Badge>
              <Badge variant="secondary" className="text-xs">Drug Information</Badge>
              <Badge variant="secondary" className="text-xs">Inventory Forecast</Badge>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Try asking:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Check current stock"</li>
                <li>"Pediatric dosing guide"</li>
                <li>"Drug interactions"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">🚨 Emergency Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically identifies urgent symptoms and provides immediate guidance for emergency situations.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">🎯 Role-Based Responses</h4>
                <p className="text-sm text-muted-foreground">
                  Tailored responses based on user role - patients get simple guidance, healthcare workers get clinical protocols.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">📊 Data Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Connected to patient records, stock management, and ML risk assessments for contextual responses.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">🌍 Multilingual Support</h4>
                <p className="text-sm text-muted-foreground">
                  Supports multiple Indian languages and can translate medical terms for better understanding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-sm">Click the Chat Button</h4>
                  <p className="text-sm text-muted-foreground">
                    Look for the blue chat button in the bottom-right corner
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-sm">Choose Quick Actions</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the suggested buttons or type your question directly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-sm">Get Personalized Help</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive role-appropriate guidance and follow-up suggestions
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> This chatbot provides information and guidance but is not a substitute for professional medical advice. Always consult healthcare professionals for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Ready to Try It Out?</CardTitle>
          <CardDescription>
            The chatbot is now active on every page. Look for the chat button in the bottom-right corner!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>AI-powered • Role-aware • Available 24/7</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}