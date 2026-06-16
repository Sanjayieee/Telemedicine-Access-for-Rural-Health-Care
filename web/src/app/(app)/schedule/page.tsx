
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Star } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const doctors = [
    { 
        name: "Dr. Anjali Sharma", 
        specialty: "Cardiologist", 
        rating: 4.9,
        reviews: 124,
        availability: ["Mon", "Wed", "Fri"],
        avatar: "https://picsum.photos/150/150?random=1",
        dataAiHint: "doctor woman"
    },
    { 
        name: "Dr. Vikram Singh", 
        specialty: "General Physician", 
        rating: 4.8,
        reviews: 210,
        availability: ["Mon", "Tue", "Thu", "Fri"],
        avatar: "https://picsum.photos/150/150?random=2",
        dataAiHint: "doctor man"
    },
     { 
        name: "Dr. Priya Desai", 
        specialty: "Dermatologist", 
        rating: 4.9,
        reviews: 98,
        availability: ["Tue", "Thu", "Sat"],
        avatar: "https://picsum.photos/150/150?random=3",
        dataAiHint: "doctor female"
    },
     { 
        name: "Dr. Rohan Mehra", 
        specialty: "Pediatrician", 
        rating: 4.7,
        reviews: 150,
        availability: ["Mon", "Wed", "Sat"],
        avatar: "https://picsum.photos/150/150?random=4",
        dataAiHint: "doctor male"
    },
]

export default function SchedulePage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('schedule.title')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('schedule.description')}
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
                <Card key={doctor.name} className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
                    <CardHeader className="flex-row gap-4 items-start bg-secondary/30 p-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage src={doctor.avatar} alt={doctor.name} data-ai-hint={doctor.dataAiHint} />
                            <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg">{doctor.name}</h3>
                            <p className="text-sm text-primary font-semibold">{doctor.specialty}</p>
                             <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                <span className="font-semibold text-sm">{doctor.rating}</span>
                                <span className="text-xs text-muted-foreground">({doctor.reviews} {t('schedule.reviews')})</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow flex flex-col justify-between">
                       <div>
                            <p className="text-sm font-semibold mb-2">{t('schedule.availability')}</p>
                            <div className="flex flex-wrap gap-2">
                                {doctor.availability.map(day => <Badge key={day} variant="outline">{day}</Badge>)}
                            </div>
                       </div>
                       <Button className="w-full mt-4">{t('schedule.bookAppointment')}</Button>
                    </CardContent>
                </Card>
            ))}
        </div>

    </div>
  );
}
