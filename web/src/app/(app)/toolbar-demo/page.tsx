"use client";

import { useState, useMemo } from 'react';
import {
  Toolbar,
  ToolbarSearch,
  ToolbarActions,
  ToolbarSort,
  ToolbarFilter,
  ToolbarMoreActions,
} from '@/components/ui/toolbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Download, 
  Upload, 
  Settings, 
  RefreshCw,
  Users,
  Activity
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Mock data for demonstration
const mockData = [
  { id: '1', name: 'Dr. Rajesh Kumar', department: 'Cardiology', status: 'active', lastLogin: '2024-01-15', patients: 45 },
  { id: '2', name: 'Dr. Priya Sharma', department: 'Pediatrics', status: 'active', lastLogin: '2024-01-14', patients: 32 },
  { id: '3', name: 'Dr. Amit Singh', department: 'Neurology', status: 'inactive', lastLogin: '2024-01-10', patients: 28 },
  { id: '4', name: 'Dr. Sunita Patel', department: 'Orthopedics', status: 'active', lastLogin: '2024-01-15', patients: 52 },
  { id: '5', name: 'Dr. Vikram Gupta', department: 'Emergency', status: 'active', lastLogin: '2024-01-15', patients: 67 },
  { id: '6', name: 'Dr. Meera Joshi', department: 'Gynecology', status: 'active', lastLogin: '2024-01-13', patients: 38 },
];

export default function ToolbarDemoPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState([
    { key: 'active', label: 'Active Doctors', active: false },
    { key: 'inactive', label: 'Inactive Doctors', active: false },
    { key: 'cardiology', label: 'Cardiology', active: false },
    { key: 'pediatrics', label: 'Pediatrics', active: false },
    { key: 'highPatients', label: 'High Patient Load (50+)', active: false },
  ]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterChange = (key: string, active: boolean) => {
    setFilters(prev => prev.map(f => f.key === key ? { ...f, active } : f));
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // Simulate export functionality
    alert('Data exported successfully!');
  };

  const handleImport = () => {
    console.log('Importing data...');
    alert('Import functionality would open here');
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
    alert('Data refreshed!');
  };

  const handleSettings = () => {
    console.log('Opening settings...');
    alert('Settings panel would open here');
  };

  const filteredData = useMemo(() => {
    let result = mockData.filter(item => 
      !search || 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.department.toLowerCase().includes(search.toLowerCase())
    );

    // Apply filters
    const activeFilters = filters.filter(f => f.active);
    if (activeFilters.length > 0) {
      result = result.filter(item => {
        return activeFilters.some(filter => {
          switch (filter.key) {
            case 'active':
              return item.status === 'active';
            case 'inactive':
              return item.status === 'inactive';
            case 'cardiology':
              return item.department.toLowerCase() === 'cardiology';
            case 'pediatrics':
              return item.department.toLowerCase() === 'pediatrics';
            case 'highPatients':
              return item.patients >= 50;
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
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'patients':
          aValue = a.patients;
          bValue = b.patients;
          break;
        case 'lastLogin':
          aValue = new Date(a.lastLogin);
          bValue = new Date(b.lastLogin);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [mockData, search, filters, sortKey, sortDirection]);

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Toolbar Demo</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Comprehensive demonstration of the toolbar component system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.filter(d => d.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              83% active rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.reduce((sum, d) => sum + d.patients, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table with Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
        </CardHeader>
        
        <Toolbar>
          <ToolbarSearch
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search doctors or departments..."
          />
          <ToolbarActions>
            <ToolbarFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <ToolbarSort
              sortOptions={[
                { key: 'name', label: 'Name' },
                { key: 'department', label: 'Department' },
                { key: 'patients', label: 'Patient Count' },
                { key: 'lastLogin', label: 'Last Login' },
              ]}
              currentSort={sortKey}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
            <ToolbarMoreActions
              actions={[
                {
                  key: 'export',
                  label: 'Export to CSV',
                  icon: <Download className="h-4 w-4" />,
                  onClick: handleExport,
                },
                {
                  key: 'import',
                  label: 'Import Data',
                  icon: <Upload className="h-4 w-4" />,
                  onClick: handleImport,
                },
                {
                  key: 'refresh',
                  label: 'Refresh Data',
                  icon: <RefreshCw className="h-4 w-4" />,
                  onClick: handleRefresh,
                },
                {
                  key: 'settings',
                  label: 'Table Settings',
                  icon: <Settings className="h-4 w-4" />,
                  onClick: handleSettings,
                },
              ]}
            />
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </ToolbarActions>
        </Toolbar>

        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredData.length} of {mockData.length} doctors
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>
                    <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{doctor.patients}</TableCell>
                  <TableCell>{new Date(doctor.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No doctors found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Toolbar Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">✨ Features in this demo:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Search:</strong> Type to search doctors by name or department</li>
              <li><strong>Filters:</strong> Filter by status, department, or patient load</li>
              <li><strong>Sorting:</strong> Sort by name, department, patient count, or last login</li>
              <li><strong>More Actions:</strong> Export, import, refresh, and settings options</li>
              <li><strong>Primary Action:</strong> Add new doctor button</li>
              <li><strong>Responsive:</strong> Adapts to mobile and desktop screens</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 Try these interactions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Search for "Dr. Rajesh" or "Cardiology"</li>
              <li>Filter by "Active Doctors" to see only active staff</li>
              <li>Sort by "Patient Count" in descending order</li>
              <li>Click the "..." button to see more actions</li>
              <li>Apply multiple filters to see how they combine</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}