import { NextRequest, NextResponse } from 'next/server';
import { listStockItems, listPrescriptions } from '@/lib/db';

interface StockForecast {
  id: string;
  name: string;
  currentQuantity: number;
  dailyUsageRate: number;
  daysUntilEmpty: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendation: string;
  confidence: number;
}

interface ForecastResponse {
  ok: boolean;
  forecasts: StockForecast[];
  metadata: {
    totalItems: number;
    analysisDate: number;
    lookbackDays: number;
  };
}

async function calculateUsageRate(itemName: string, lookbackDays: number = 30): Promise<number> {
  const prescriptions = await listPrescriptions();
  const cutoffDate = Date.now() - (lookbackDays * 24 * 60 * 60 * 1000);
  
  // Filter prescriptions within lookback period
  const recentPrescriptions = prescriptions.filter(p => p.createdAt >= cutoffDate);
  
  // Count occurrences of this medication
  let totalUsage = 0;
  const normalizedItemName = itemName.toLowerCase();
  
  for (const prescription of recentPrescriptions) {
    const medName = prescription.medication.toLowerCase();
    
    // Check if medication names match (fuzzy matching)
    if (medName.includes(normalizedItemName) || normalizedItemName.includes(medName)) {
      // Extract quantity from dosage if possible (simplified)
      const dosageMatch = prescription.dosage.match(/(\d+)/);
      const quantity = dosageMatch ? parseInt(dosageMatch[1]) : 1;
      
      // Extract duration in days (simplified)
      const durationMatch = prescription.duration.match(/(\d+)d?/);
      const durationDays = durationMatch ? parseInt(durationMatch[1]) : 7;
      
      totalUsage += quantity * durationDays;
    }
  }
  
  // Calculate daily usage rate
  return totalUsage / lookbackDays;
}

function getRiskLevel(daysUntilEmpty: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (daysUntilEmpty < 0) return 'critical';
  if (daysUntilEmpty <= 7) return 'high';
  if (daysUntilEmpty <= 14) return 'moderate';
  return 'low';
}

function getRecommendation(forecast: Omit<StockForecast, 'recommendation'>): string {
  const { daysUntilEmpty, riskLevel, dailyUsageRate, currentQuantity } = forecast;
  
  if (riskLevel === 'critical') {
    return 'URGENT: Out of stock! Order immediately and consider emergency procurement.';
  } else if (riskLevel === 'high') {
    const needed = Math.ceil(dailyUsageRate * 30); // 30-day supply
    return `Critical shortage detected. Order ${needed} units within 2-3 days to avoid stockout.`;
  } else if (riskLevel === 'moderate') {
    const needed = Math.ceil(dailyUsageRate * 45); // 45-day supply
    return `Stock running low. Consider ordering ${needed} units within next week.`;
  } else {
    const reorderPoint = Math.ceil(dailyUsageRate * 14); // 2-week buffer
    return `Stock levels adequate. Reorder when quantity drops below ${reorderPoint} units.`;
  }
}

function calculateConfidence(currentQuantity: number, dailyUsageRate: number, lookbackDays: number): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence if we have more historical data
  if (lookbackDays >= 30) confidence += 0.2;
  else if (lookbackDays >= 14) confidence += 0.1;
  
  // Higher confidence if usage rate is based on actual prescriptions
  if (dailyUsageRate > 0) confidence += 0.2;
  
  // Higher confidence for items with moderate stock levels
  if (currentQuantity >= 10 && currentQuantity <= 100) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lookbackDays = parseInt(searchParams.get('lookback') || '30');
    
    const stockItems = await listStockItems();
    const forecasts: StockForecast[] = [];
    
    for (const item of stockItems) {
      const dailyUsageRate = await calculateUsageRate(item.name, lookbackDays);
      
      // Calculate days until empty
      let daysUntilEmpty: number;
      if (dailyUsageRate <= 0) {
        // No usage detected - assume low consumption
        daysUntilEmpty = item.currentStock > 0 ? 365 : 0; // 1 year or already empty
      } else {
        daysUntilEmpty = Math.floor(item.currentStock / dailyUsageRate);
      }
      
      const riskLevel = getRiskLevel(daysUntilEmpty);
      const confidence = calculateConfidence(item.currentStock, dailyUsageRate, lookbackDays);
      
      const forecast: StockForecast = {
        id: item.id,
        name: item.name,
        currentQuantity: item.currentStock,
        dailyUsageRate: Math.round(dailyUsageRate * 100) / 100,
        daysUntilEmpty,
        riskLevel,
        recommendation: '',
        confidence: Math.round(confidence * 100) / 100
      };
      
      forecast.recommendation = getRecommendation(forecast);
      forecasts.push(forecast);
    }
    
    // Sort by risk level (critical > high > moderate > low) then by days until empty
    const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
    forecasts.sort((a, b) => {
      const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return a.daysUntilEmpty - b.daysUntilEmpty;
    });
    
    const response: ForecastResponse = {
      ok: true,
      forecasts,
      metadata: {
        totalItems: stockItems.length,
        analysisDate: Date.now(),
        lookbackDays
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Stock forecast error:', error);
    return NextResponse.json(
      { ok: false, error: 'Stock forecast failed' },
      { status: 500 }
    );
  }
}