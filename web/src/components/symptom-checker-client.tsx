
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { checkSymptomsText, checkSymptomsImage } from "@/lib/actions";
import { Loader2, AlertTriangle, Lightbulb, Upload } from "lucide-react";
import { Badge } from "./ui/badge";
import Image from 'next/image';
import { useLanguage } from "@/context/language-context";

const textSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
});

const imageSchema = z.object({
  photo: z.any().refine((file) => file instanceof File, "Please upload an image file."),
  additionalDetails: z.string().optional(),
});

type TriageResult = {
  possibleConditions: string;
  urgency: "🚨 Emergency" | "⚠️ Medium" | "✅ Low";
  recommendedActions: string;
  source: string;
  triageCategory: "urgent" | "routine" | "home-care";
  advice: string;
};

export function SymptomCheckerClient() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("text");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const textForm = useForm<z.infer<typeof textSchema>>({
    resolver: zodResolver(textSchema),
    defaultValues: { symptoms: "" },
  });

  const imageForm = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
    defaultValues: { photo: undefined, additionalDetails: "" },
  });

  const handleTextSubmit = async (values: z.infer<typeof textSchema>) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await checkSymptomsText(values);
      setResult(response);
    } catch (e) {
      setError(t('symptomChecker.errorAnalyzing'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async (values: z.infer<typeof imageSchema>) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(values.photo);
    reader.onload = async () => {
      const photoDataUri = reader.result as string;
      try {
        const response = await checkSymptomsImage({
          photoDataUri,
          additionalDetails: values.additionalDetails,
        });
        setResult(response);
      } catch (e) {
        setError(t('symptomChecker.errorAnalyzing'));
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the image file. Please try another file.");
        setIsLoading(false);
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      imageForm.setValue("photo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getBadgeVariant = (category: TriageResult["triageCategory"]) => {
    switch (category) {
        case "urgent":
            return "destructive";
        case "routine":
            return "default";
        case "home-care":
            return "secondary";
        default:
            return "outline";
    }
  };

  const getTriageCategoryText = (category: TriageResult['triageCategory']) => {
    switch (category) {
        case "urgent":
            return t('symptomChecker.urgent');
        case "routine":
            return t('symptomChecker.routine');
        case "home-care":
            return t('symptomChecker.homeCare');
    }
  }


  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">{t('symptomChecker.textInput')}</TabsTrigger>
              <TabsTrigger value="image">{t('symptomChecker.imageUpload')}</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="p-6">
              <Form {...textForm}>
                <form
                  onSubmit={textForm.handleSubmit(handleTextSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={textForm.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('symptomChecker.describeSymptoms')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('symptomChecker.symptomsPlaceholder')}
                            rows={8}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('symptomChecker.analyzeSymptoms')}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="image" className="p-6">
              <Form {...imageForm}>
                <form
                  onSubmit={imageForm.handleSubmit(handleImageSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={imageForm.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('symptomChecker.uploadPhoto')}</FormLabel>
                         <FormControl>
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80">
                                {preview ? (
                                    <Image src={preview} alt="Image preview" width={192} height={192} className="object-contain h-full p-2" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('symptomChecker.uploadCTA')}</span> {t('symptomChecker.uploadOrDrag')}</p>
                                        <p className="text-xs text-muted-foreground">{t('symptomChecker.uploadFormat')}</p>
                                    </div>
                                )}
                                <Input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                            </label>
                          </div> 
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={imageForm.control}
                    name="additionalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('symptomChecker.additionalDetails')}</FormLabel>
                        <FormControl>
                           <Textarea
                            placeholder={t('symptomChecker.additionalDetailsPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('symptomChecker.analyzeImage')}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Medical Analysis Report</CardTitle>
          <CardDescription>Structured medical assessment with conditions, urgency, and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
          {error && (
             <div className="text-center text-destructive">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                <p className="font-semibold">{t('symptomChecker.analysisFailed')}</p>
                <p className="text-sm">{error}</p>
            </div>
          )}
          {!isLoading && !error && !result && (
             <div className="text-center text-muted-foreground">
                <Lightbulb className="mx-auto h-8 w-8 mb-2" />
                <p>{t('symptomChecker.resultsAppearHere')}</p>
            </div>
          )}
          {result && (
            <div className="w-full space-y-4">
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">{t('symptomChecker.recommendedAction')}</p>
                    <Badge variant={getBadgeVariant(result.triageCategory)} className="text-lg px-4 py-1 mt-1">{result.urgency}</Badge>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <h3 className="font-semibold text-base mb-2 text-primary">Possible Conditions:</h3>
                        <p className="text-sm text-foreground/90 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">{result.possibleConditions}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-base mb-2 text-amber-700 dark:text-amber-500">Recommended Actions:</h3>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">{result.recommendedActions}</p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-base mb-2 text-green-700 dark:text-green-500">Medical Reference:</h3>
                        <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md italic">{result.source}</p>
                    </div>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">{t('symptomChecker.footerDisclaimer')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
