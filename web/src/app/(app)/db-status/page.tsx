"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Wifi, WifiOff, RefreshCw, Server } from "lucide-react";
import { useState, useEffect } from "react";

type DatabaseInfo = {
  type: 'mysql' | 'memory' | 'unknown';
  connected: boolean;
};

export default function DatabaseStatusPage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      setDbInfo(data.database);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check database status:', error);
      setDbInfo({ type: 'unknown', connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusColor = (info: DatabaseInfo | null) => {
    if (!info) return 'secondary';
    if (info.type === 'mysql' && info.connected) return 'default';
    if (info.type === 'memory') return 'secondary';
    return 'destructive';
  };

  const getStatusText = (info: DatabaseInfo | null) => {
    if (!info) return 'Checking...';
    if (info.type === 'mysql' && info.connected) return 'MySQL Connected';
    if (info.type === 'memory') return 'In-Memory Storage';
    return 'Database Error';
  };

  const getStatusIcon = (info: DatabaseInfo | null) => {
    if (!info || loading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (info.type === 'mysql' && info.connected) return <Database className="h-4 w-4" />;
    if (info.type === 'memory') return <Server className="h-4 w-4" />;
    return <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Status</h1>
          <p className="text-muted-foreground">Monitor your database connection and configuration</p>
        </div>
        <Button onClick={checkDatabaseStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(dbInfo)}
              Current Database
            </CardTitle>
            <CardDescription>
              Active database configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(dbInfo)}>
                {getStatusText(dbInfo)}
              </Badge>
            </div>
            
            {dbInfo && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-mono">{dbInfo.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected:</span>
                  <span className={dbInfo.connected ? 'text-green-600' : 'text-red-600'}>
                    {dbInfo.connected ? 'Yes' : 'No'}
                  </span>
                </div>
                {lastChecked && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Checked:</span>
                    <span className="font-mono text-xs">
                      {lastChecked.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              MySQL Configuration
            </CardTitle>
            <CardDescription>
              Settings from .env file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Host:</span>
              <span className="font-mono">localhost</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Port:</span>
              <span className="font-mono">3306</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User:</span>
              <span className="font-mono">root</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database:</span>
              <span className="font-mono">healthcare_db</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      <div className="space-y-4">
        {dbInfo?.type === 'memory' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Using In-Memory Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <p className="mb-4">
                Your application is currently using in-memory storage. This is fine for development, 
                but data will be lost when the server restarts.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">To enable MySQL:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Run PowerShell as Administrator</li>
                  <li>Execute: <code className="bg-yellow-100 px-1 rounded">net start MYSQL80</code></li>
                  <li>Run: <code className="bg-yellow-100 px-1 rounded">node test-mysql.js</code></li>
                  <li>Restart your application</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {dbInfo?.type === 'mysql' && dbInfo.connected && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Database className="h-4 w-4" />
                MySQL Connected Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700">
              <p>
                Your application is connected to MySQL database. All data is persistent 
                and will survive server restarts.
              </p>
            </CardContent>
          </Card>
        )}

        {dbInfo?.type === 'unknown' || (dbInfo && !dbInfo.connected) && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Database Connection Issue
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p className="mb-4">
                There's an issue with the database connection. Please check:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>MySQL service is running</li>
                <li>Connection credentials are correct</li>
                <li>Database server is accessible</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}