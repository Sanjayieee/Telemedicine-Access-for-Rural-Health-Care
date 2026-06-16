
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Toolbar,
  ToolbarSearch,
  ToolbarActions,
  ToolbarSort,
  ToolbarFilter,
  ToolbarMoreActions,
} from "@/components/ui/toolbar";
import { useLanguage } from "@/context/language-context";
import { Users, PlusCircle, ArrowRight, Download, UserCheck, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePatients } from '@/hooks/use-patients';
import { useState, useMemo } from 'react';

export default function PatientsPage() {
  const { t } = useLanguage();
  const { patients, loading, error, reload } = usePatients();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState([
    { key: 'male', label: 'Male', active: false },
    { key: 'female', label: 'Female', active: false },
    { key: 'recent', label: 'Recent Visits', active: false },
  ]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterChange = (key: string, active: boolean) => {
    setFilters(prev => prev.map(f => f.key === key ? { ...f, active } : f));
  };

  const filtered = useMemo(() => {
    let result = patients.filter(p => 
      !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.id.toLowerCase().includes(search.toLowerCase())
    );

    // Apply filters
    const activeFilters = filters.filter(f => f.active);
    if (activeFilters.length > 0) {
      result = result.filter(p => {
        return activeFilters.some(filter => {
          switch (filter.key) {
            case 'male':
              return p.gender?.toLowerCase() === 'male';
            case 'female':
              return p.gender?.toLowerCase() === 'female';
            case 'recent':
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(p.createdAt) > weekAgo;
            default:
              return false;
          }
        });
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [patients, search, filters, sortKey, sortDirection]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('sidebar.patients')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('patients.description')}
        </p>
      </div>

       <Card>
            <CardHeader>
                <div>
                    <CardTitle>{t('patients.patientList')}</CardTitle>
                    <CardDescription>{t('patients.patientListDescription')}</CardDescription>
                </div>
            </CardHeader>
            <Toolbar>
                <ToolbarSearch
                    searchValue={search}
                    onSearchChange={setSearch}
                    placeholder={t('patients.searchPlaceholder')}
                />
                <ToolbarActions>
                    <ToolbarFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <ToolbarSort
                        sortOptions={[
                            { key: 'name', label: 'Name' },
                            { key: 'age', label: 'Age' },
                            { key: 'date', label: 'Date Added' },
                        ]}
                        currentSort={sortKey}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                    />
                    <ToolbarMoreActions
                        actions={[
                            {
                                key: 'export',
                                label: 'Export Patient List',
                                icon: <Download className="h-4 w-4" />,
                                onClick: () => console.log('Export clicked'),
                            },
                            {
                                key: 'bulk-update',
                                label: 'Bulk Update',
                                icon: <UserCheck className="h-4 w-4" />,
                                onClick: () => console.log('Bulk update clicked'),
                            },
                        ]}
                    />
                    <Link href="/patients/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('patients.addNewPatient')}
                        </Button>
                    </Link>
                </ToolbarActions>
            </Toolbar>
            <CardContent>
                {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
                {error && <p className="text-sm text-red-600">{error} <button onClick={reload} className="underline">Retry</button></p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('patients.name')}</TableHead>
                            <TableHead>{t('patients.age')}</TableHead>
                            <TableHead>{t('patients.gender')}</TableHead>
                            <TableHead>{t('patients.lastVisit')}</TableHead>
                            <TableHead className="text-right">{t('patients.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(patient.name)}`} alt={patient.name} />
                                  <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{patient.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{patient.age}</TableCell>
                            <TableCell>{patient.gender}</TableCell>
                            <TableCell>{new Date(patient.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Link href={`/patients/${patient.id}`}><Button variant="outline" size="sm">
                                {t('patients.viewRecord')} <ArrowRight className="ml-2 h-4 w-4" />
                              </Button></Link>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!loading && !filtered.length && (
                          <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-sm">No patients</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>

  </div>
  );
}
