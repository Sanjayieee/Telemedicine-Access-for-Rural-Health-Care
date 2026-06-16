
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, ArrowRight, Loader2, Volume2 } from "lucide-react";
import { translateText } from "@/lib/actions";
import { textToSpeech } from "@/lib/actions";
import { useLanguage } from "@/context/language-context";

const pastConsultations = [
  {
    doctor: "Dr. Anjali Sharma",
    specialty: "Cardiologist",
    date: "July 15, 2024",
    avatar: "https://picsum.photos/100/100?random=1",
    dataAiHint: "doctor woman"
  },
  {
    doctor: "Dr. Vikram Singh",
    specialty: "General Physician",
    date: "June 28, 2024",
    avatar: "https://picsum.photos/100/100?random=2",
    dataAiHint: "doctor man"
  },
  {
    doctor: "Dr. Priya Desai",
    specialty: "Dermatologist",
    date: "May 10, 2024",
    avatar: "https://picsum.photos/100/100?random=3",
    dataAiHint: "doctor woman"
  },
];

export default function ConsultationsPage() {
    const { t } = useLanguage();
    const [textToTranslate, setTextToTranslate] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const handleTranslate = async () => {
        if (!textToTranslate) return;

        setIsTranslating(true);
        setTranslatedText("");
        setAudioData(null);

        try {
            const result = await translateText({
                text: textToTranslate,
                sourceLanguage: 'English',
                targetLanguage: 'Hindi'
            });
            setTranslatedText(result.translatedText);
        } catch (error) {
            console.error("Translation failed", error);
            setTranslatedText("Error: Could not translate text.");
        } finally {
            setIsTranslating(false);
        }
    };
    
    const handleTextToSpeech = async () => {
        if (!translatedText) return;
        setIsGeneratingAudio(true);
        setAudioData(null);
        try {
            const result = await textToSpeech(translatedText);
            setAudioData(result.media);
        } catch (error) {
            console.error("Text to speech failed", error);
        } finally {
            setIsGeneratingAudio(false);
        }
    };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t('consultations.title')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('consultations.description')}
        </p>
      </div>

       <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('consultations.pastConsultations')}</CardTitle>
                        <CardDescription>{t('consultations.reviewRecords')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pastConsultations.map((consult, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={consult.avatar} alt={consult.doctor} data-ai-hint={consult.dataAiHint} />
                                            <AvatarFallback>{consult.doctor.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{consult.doctor}</p>
                                            <p className="text-sm text-muted-foreground">{consult.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{consult.date}</p>
                                        <Button variant="link" className="h-auto p-0 text-primary">{t('consultations.viewDetails')}</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('consultations.realtimeTranslation')}</CardTitle>
                        <CardDescription>{t('consultations.simulateTranslation')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="text-to-translate" className="text-sm font-medium">{t('consultations.yourMessage')}</label>
                            <Textarea id="text-to-translate" placeholder={t('consultations.messagePlaceholder')} className="mt-1" value={textToTranslate} onChange={(e) => setTextToTranslate(e.target.value)} />
                        </div>
                        <div className="flex justify-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                             <label className="text-sm font-medium">{t('consultations.translatedMessage')}</label>
                             <div className="mt-1 min-h-[100px] w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
                               {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : (translatedText || t('consultations.translationPlaceholder'))}
                             </div>
                        </div>
                         {translatedText && !isTranslating && (
                            <div className="flex flex-col gap-2">
                                <Button onClick={handleTextToSpeech} disabled={isGeneratingAudio}>
                                    {isGeneratingAudio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                                    {t('consultations.listenToTranslation')}
                                </Button>
                                {audioData && (
                                    <audio controls src={audioData} className="w-full">
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                            </div>
                        )}
                        <Button className="w-full" onClick={handleTranslate} disabled={isTranslating || !textToTranslate}>
                             {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('consultations.translate')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
       </div>

    </div>
  );
}
