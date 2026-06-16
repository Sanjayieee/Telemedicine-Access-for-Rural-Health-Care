"use client";
import { useEffect, useState } from 'react';
import { queueSync, listQueued, clearQueued } from '@/lib/offline';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, WifiOff, Wifi, UploadCloud } from 'lucide-react';

interface QueuedItem { id:number; type:string; createdAt:number; patients?: any[]; records?: any[]; }

export function HealthWorkerOfflinePanel() {
  const [items,setItems] = useState<QueuedItem[]>([]);
  const [online,setOnline] = useState<boolean>(true);
  const [busy,setBusy] = useState(false);
  const [status,setStatus] = useState<string>('');

  async function refresh() {
    const data = await listQueued() as any[];
    setItems(data.map(d=>({id:d.id, type:d.type, createdAt:d.createdAt, patients:d.patients, records:d.records})));
  }

  useEffect(()=>{
    refresh();
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setOnline(navigator.onLine);
    return ()=>{
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  },[]);

  async function simulateAdd() {
    // Simulate blank draft (legacy)
    await queueSync({ type: 'patientDraft', patients: [], records: [] });
    refresh();
  }

  async function handleSync() {
    setBusy(true); setStatus('Syncing...');
    try {
  const allPatients = items.flatMap(i=>i.patients||[]);
  const res = await fetch('/api/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ patients: allPatients, records: [], prescriptions: [], stock: [] }) });
      if(!res.ok) throw new Error('Sync failed');
  const data = await res.json();
  setStatus(`Synced ${data.createdCount||0} new / skipped ${data.skippedCount||0}`);
      await clearQueued();
      refresh();
    } catch (e:any) {
      setStatus(e.message);
    } finally {
      setBusy(false);
      setTimeout(()=>setStatus(''), 3000);
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {online ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />} Offline Queue
          </CardTitle>
          <CardDescription>{items.length} pending item(s)</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={simulateAdd}>Queue Draft</Button>
          <Button size="sm" disabled={!items.length || !online || busy} onClick={handleSync}>
            {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}<UploadCloud className="mr-1 h-4 w-4"/> Sync
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 max-h-40 overflow-auto text-xs">
          {items.map(i=> <li key={i.id} className="flex justify-between border rounded px-2 py-1 bg-secondary/40"><span>{i.type}{i.patients?.length?` (${i.patients.length})`:''}</span><span>{new Date(i.createdAt).toLocaleTimeString()}</span></li> )}
          {!items.length && <li className="text-muted-foreground">No queued data.</li>}
        </ul>
        {status && <p className="mt-2 text-xs text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  );
}
