
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pill, Search, MapPin } from "lucide-react";
import { useState, useEffect } from 'react';
import { updateStock } from '@/lib/domain-actions';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
interface StockItem { id:string; name:string; quantity:number; updatedAt:number; }
async function fetchStock(): Promise<StockItem[]> { const res = await fetch('/api/stock'); if(!res.ok) return []; return res.json(); }
import { useLanguage } from "@/context/language-context";

const pharmacies = [
    { name: "Apollo Pharmacy", distance: "1.2 km", inStock: true },
    { name: "MedPlus Pharmacy", distance: "2.5 km", inStock: true },
    { name: "Wellness Forever", distance: "3.1 km", inStock: false },
    { name: "Janta Medical Store", distance: "4.0 km", inStock: true },
]

export default function PharmacyPage() {
  const { t } = useLanguage();
  const [medName,setMedName] = useState('');
  const [qty,setQty] = useState<number|''>('');
  const [busy,setBusy] = useState(false);
  const [stock,setStock] = useState<StockItem[]>([]);
  const [loading,setLoading] = useState(true);
  async function load() { setLoading(true); try { setStock(await fetchStock()); } finally { setLoading(false); } }
  useEffect(()=>{ load(); },[]);

  async function handleAdjust(sign: 1|-1) {
    if(!medName || !qty) return;
    setBusy(true);
  try { await updateStock(medName, sign * Number(qty)); setQty(''); load(); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <Pill className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('pharmacy.title')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('pharmacy.description')}
        </p>
      </div>

       <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder={t('pharmacy.searchPlaceholder')} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
            <div className="mb-6 grid gap-2 md:grid-cols-5 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-medium">Medicine</label>
                <Input value={medName} onChange={e=>setMedName(e.target.value)} placeholder="e.g. Paracetamol" />
              </div>
              <div>
                <label className="text-xs font-medium">Qty</label>
                <Input type="number" value={qty} onChange={e=>setQty(e.target.value?Number(e.target.value):'')} placeholder="10" />
              </div>
              <div className="flex gap-2">
                <Button type="button" disabled={busy || !medName || !qty} onClick={()=>handleAdjust(1)}>Add</Button>
                <Button type="button" variant="destructive" disabled={busy || !medName || !qty} onClick={()=>handleAdjust(-1)}>Remove</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Adjust local stock (demo only)</p>
            </div>
             <h3 className="text-lg font-semibold mb-4">Current Stock</h3>
             <div className="mb-8 border rounded">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Name</TableHead>
                     <TableHead>Quantity</TableHead>
                     <TableHead>Updated</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {stock.map(s=> (
                     <TableRow key={s.id}>
                       <TableCell className="font-medium flex items-center gap-2">{s.name} {s.quantity < 10 && <Badge variant="destructive">Low</Badge>}</TableCell>
                       <TableCell>{s.quantity}</TableCell>
                       <TableCell>{new Date(s.updatedAt).toLocaleTimeString()}</TableCell>
                     </TableRow>
                   ))}
                   {!loading && !stock.length && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground text-sm">No stock items</TableCell></TableRow>}
                 </TableBody>
               </Table>
               {loading && <p className="p-2 text-xs text-muted-foreground">Loading...</p>}
             </div>
             <h3 className="text-lg font-semibold mb-4">{t('pharmacy.pharmaciesNearYou')}</h3>
            <div className="space-y-4">
                {pharmacies.map((pharmacy, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-4">
                        <div>
                            <p className="font-semibold">{pharmacy.name}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1"/>
                                {pharmacy.distance} {t('pharmacy.distanceAway')}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                           {pharmacy.inStock ? 
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">{t('pharmacy.inStock')}</Badge> : 
                                <Badge variant="destructive">{t('pharmacy.outOfStock')}</Badge>
                            }
                            <Button disabled={!pharmacy.inStock} className="flex-grow sm:flex-grow-0">
                                {t('pharmacy.reserve')}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
