"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, User } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender?: string;
  chronic?: boolean;
  lastRisk?: {
    score: number;
    level: 'low' | 'moderate' | 'high';
    updatedAt: number;
    model_version: string;
  };
}

export function TriagePanel() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRiskScores = async () => {
    setRefreshing(true);
    try {
      // Refresh risk scores for all patients without cached or stale scores
      const staleThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      const patientsToUpdate = patients.filter(p => 
        !p.lastRisk || p.lastRisk.updatedAt < staleThreshold
      );

      await Promise.all(
        patientsToUpdate.map(patient =>
          fetch('/api/ml/risk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: patient.id })
          })
        )
      );

      // Reload patients to get updated risk scores
      await loadPatients();
    } catch (error) {
      console.error('Failed to refresh risk scores:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Sort patients by risk score (high to low), then by chronic condition
  const sortedPatients = [...patients]
    .filter(p => p.lastRisk) // Only show patients with risk assessments
    .sort((a, b) => {
      // Primary sort: risk level (high > moderate > low)
      const riskOrder = { high: 3, moderate: 2, low: 1 };
      const aRisk = riskOrder[a.lastRisk!.level];
      const bRisk = riskOrder[b.lastRisk!.level];
      
      if (aRisk !== bRisk) return bRisk - aRisk;
      
      // Secondary sort: risk score (higher first)
      if (a.lastRisk!.score !== b.lastRisk!.score) {
        return b.lastRisk!.score - a.lastRisk!.score;
      }
      
      // Tertiary sort: chronic conditions first
      if (a.chronic !== b.chronic) {
        return a.chronic ? -1 : 1;
      }
      
      return 0;
    })
    .slice(0, 20); // Show top 20 high-risk patients

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-600';
      case 'moderate': return 'bg-amber-500';
      case 'low': return 'bg-emerald-600';
      default: return 'bg-gray-400';
    }
  };

  const getAge = (updatedAt: number) => {
    const hours = Math.floor((Date.now() - updatedAt) / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Patient Triage
            </CardTitle>
            <CardDescription>
              Patients prioritized by ML risk assessment
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRiskScores}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Scores
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : sortedPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No patients with risk assessments</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={refreshRiskScores}
            >
              Generate Risk Scores
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPatients.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded text-white font-medium ${getRiskColor(patient.lastRisk!.level)}`}
                    >
                      {patient.lastRisk!.level.toUpperCase()} {patient.lastRisk!.score}
                    </span>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{patient.age}y</span>
                        {patient.gender && <span>{patient.gender}</span>}
                        {patient.chronic && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                            Chronic
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Risk assessed</p>
                    <p>{getAge(patient.lastRisk!.updatedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
            {patients.length > sortedPatients.length && (
              <div className="text-center py-2 text-sm text-muted-foreground">
                Showing top {sortedPatients.length} high-risk patients
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}